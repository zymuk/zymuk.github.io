import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Notes from "../../../../src/site/pages/notes/Notes";

const openAddForm = () => {
  fireEvent.click(screen.getByRole("button", { name: /add note/i }));
};

const fillTitleAndSave = (title) => {
  fireEvent.change(screen.getByLabelText("Title *"), {
    target: { value: title },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
};

const getStoredNotes = () =>
  JSON.parse(localStorage.getItem("userNotes"));

describe("Notes", () => {
  it("shows the empty state when there are no notes", () => {
    render(<Notes />);
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(screen.getByText(/Create your first note/)).toBeInTheDocument();
  });

  it("creates a note and persists it to localStorage", () => {
    render(<Notes />);
    openAddForm();
    expect(screen.getByText("Create New Note")).toBeInTheDocument();
    fillTitleAndSave("Meeting notes");

    expect(screen.getByText("Meeting notes")).toBeInTheDocument();
    const stored = getStoredNotes();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ title: "Meeting notes" });
    expect(stored[0].id).toBeTruthy();
    expect(stored[0].createdAt).toBe(stored[0].updatedAt);
  });

  it("loads existing notes from localStorage on mount", () => {
    localStorage.setItem(
      "userNotes",
      JSON.stringify([
        {
          id: "1",
          title: "Old note",
          shortContent: "<p>desc</p>",
          content: "",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ]),
    );
    render(<Notes />);
    expect(screen.getByText("Old note")).toBeInTheDocument();
  });

  it("edits an existing note and bumps updatedAt", () => {
    render(<Notes />);
    openAddForm();
    fillTitleAndSave("Original");

    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByText("Edit Note")).toBeInTheDocument();
    expect(screen.getByLabelText("Title *").value).toBe("Original");

    fireEvent.change(screen.getByLabelText("Title *"), {
      target: { value: "Updated title" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(screen.getByText("Updated title")).toBeInTheDocument();
    const stored = getStoredNotes();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Updated title");
    expect(stored[0].createdAt).not.toBe(stored[0].updatedAt);
  });

  it("deletes a note after confirmation", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    render(<Notes />);
    openAddForm();
    fillTitleAndSave("To delete");

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.queryByText("To delete")).not.toBeInTheDocument();
    expect(getStoredNotes()).toHaveLength(0);
  });

  it("keeps the note when deletion is cancelled", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    render(<Notes />);
    openAddForm();
    fillTitleAndSave("Keep me");

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(getStoredNotes()).toHaveLength(1);
  });

  it("filters notes by the search term", () => {
    render(<Notes />);
    openAddForm();
    fillTitleAndSave("Shopping list");
    openAddForm();
    fillTitleAndSave("Work tasks");

    fireEvent.change(screen.getByPlaceholderText("Search notes..."), {
      target: { value: "shopping" },
    });
    expect(screen.getByText("Shopping list")).toBeInTheDocument();
    expect(screen.queryByText("Work tasks")).not.toBeInTheDocument();
  });

  it("does not create a note when the title is empty", () => {
    render(<Notes />);
    openAddForm();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByText("No notes yet")).toBeInTheDocument();
    expect(getStoredNotes()).toBeNull();
  });
});
