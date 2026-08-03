import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SaveWeb from "../../../../src/site/pages/saveWeb/SaveWeb";

const getStatus = (container) =>
  container.querySelector(".status-message")?.textContent || "";

const fillForm = (container, { title, url, description }) => {
  fireEvent.change(container.querySelector("#title"), {
    target: { value: title },
  });
  fireEvent.change(container.querySelector("#url"), {
    target: { value: url },
  });
  fireEvent.change(container.querySelector("#description"), {
    target: { value: description },
  });
};

describe("SaveWeb", () => {
  it("shows the empty state when there are no bookmarks", () => {
    render(<SaveWeb />);
    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(screen.getByText(/Start saving your favorite web pages/)).toBeInTheDocument();
  });

  it("rejects saving when the title is missing", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, { title: "", url: "https://example.com", description: "" });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));
    expect(getStatus(container)).toContain("Please enter a title");
  });

  it("rejects saving when the URL is missing", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, { title: "My site", url: "", description: "" });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));
    expect(getStatus(container)).toContain("Please enter a URL");
  });

  it("rejects an invalid URL format", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, { title: "My site", url: "not-a-url", description: "" });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));
    expect(getStatus(container)).toContain("Invalid URL format");
  });

  it("adds a bookmark and persists it to localStorage", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, {
      title: "GitHub",
      url: "https://github.com",
      description: "Code hosting",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(getStatus(container)).toContain("Bookmark saved successfully");

    const saved = JSON.parse(localStorage.getItem("savedWebPages"));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      title: "GitHub",
      url: "https://github.com",
      description: "Code hosting",
    });
    expect(saved[0].id).toBeTruthy();
    expect(saved[0].createdAt).toBeTruthy();
  });

  it("loads existing bookmarks from localStorage on mount", () => {
    localStorage.setItem(
      "savedWebPages",
      JSON.stringify([
        {
          id: 1,
          title: "Existing",
          url: "https://existing.com",
          description: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
    render(<SaveWeb />);
    expect(screen.getByText("Existing")).toBeInTheDocument();
  });

  it("filters bookmarks by the search term", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, {
      title: "GitHub",
      url: "https://github.com",
      description: "",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    fillForm(container, {
      title: "LinkedIn",
      url: "https://linkedin.com",
      description: "",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    fireEvent.change(screen.getByPlaceholderText("Search bookmarks..."), {
      target: { value: "github" },
    });
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();
  });

  it("edits an existing bookmark", () => {
    const { container } = render(<SaveWeb />);
    fillForm(container, {
      title: "GitHub",
      url: "https://github.com",
      description: "old",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    fireEvent.click(screen.getByTitle("Edit"));
    expect(container.querySelector("#title").value).toBe("GitHub");

    fireEvent.change(container.querySelector("#title"), {
      target: { value: "GitHub Dev" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Bookmark" }));

    expect(screen.getByText("GitHub Dev")).toBeInTheDocument();
    expect(getStatus(container)).toContain("Bookmark updated successfully");

    const saved = JSON.parse(localStorage.getItem("savedWebPages"));
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("GitHub Dev");
    expect(saved[0].updatedAt).not.toBe(saved[0].createdAt);
  });

  it("deletes a bookmark after confirmation", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = render(<SaveWeb />);
    fillForm(container, {
      title: "GitHub",
      url: "https://github.com",
      description: "",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("savedWebPages"))).toHaveLength(0);
    expect(getStatus(container)).toContain("Bookmark deleted successfully");
  });

  it("keeps the bookmark when deletion is cancelled", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { container } = render(<SaveWeb />);
    fillForm(container, {
      title: "GitHub",
      url: "https://github.com",
      description: "",
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Bookmark" }));

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("savedWebPages"))).toHaveLength(1);
  });
});
