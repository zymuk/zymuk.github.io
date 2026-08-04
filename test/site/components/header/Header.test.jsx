import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../../src/site/components/header/Header";

const FEATURES = JSON.stringify([
  {
    id: "reminders",
    displayName: "Task Reminder",
    path: "/reminders",
    isVisible: true,
  },
  { id: "notes", displayName: "Notes", path: "/notes", isVisible: true },
]);

const renderHeader = () =>
  render(
    <MemoryRouter initialEntries={["/notes"]}>
      <Header scrollToSection={jest.fn()} />
    </MemoryRouter>,
  );

describe("Header", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("shows a badge with the count of pending reminders", () => {
    localStorage.setItem("features", FEATURES);
    localStorage.setItem(
      "reminders",
      JSON.stringify([
        { id: "1", title: "A", dueAt: Date.now() + 60000, notified: false },
        { id: "2", title: "B", dueAt: Date.now() + 60000, notified: true },
      ]),
    );

    renderHeader();

    expect(screen.getByText("Task Reminder")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("hides the badge when there are no pending reminders", () => {
    localStorage.setItem("features", FEATURES);

    renderHeader();

    expect(screen.getByText("Task Reminder")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("updates the badge when reminders change", () => {
    localStorage.setItem("features", FEATURES);

    renderHeader();
    expect(screen.queryByText("1")).not.toBeInTheDocument();

    localStorage.setItem(
      "reminders",
      JSON.stringify([
        { id: "1", title: "A", dueAt: Date.now() + 60000, notified: false },
      ]),
    );
    act(() => {
      window.dispatchEvent(new Event("zymuk-reminders-changed"));
    });

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("closes the dropdown when clicking outside the header", () => {
    localStorage.setItem("features", FEATURES);

    renderHeader();
    fireEvent.click(screen.getByText("☰"));
    expect(document.querySelector(".nav.open")).toBeInTheDocument();

    fireEvent.click(document.body);
    expect(document.querySelector(".nav.open")).not.toBeInTheDocument();
  });

  it("closes the dropdown when navigating to a page", () => {
    localStorage.setItem("features", FEATURES);

    renderHeader();
    fireEvent.click(screen.getByText("☰"));
    expect(document.querySelector(".nav.open")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Task Reminder"));
    expect(document.querySelector(".nav.open")).not.toBeInTheDocument();
  });

  it("scrolls to the features section when clicking Features", () => {
    localStorage.setItem("features", FEATURES);
    const scrollToSection = jest.fn();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header scrollToSection={scrollToSection} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Features$/ }));
    expect(scrollToSection).toHaveBeenCalledWith("features");
  });

  it("toggles the features submenu with the caret without closing the dropdown", () => {
    localStorage.setItem("features", FEATURES);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Header scrollToSection={jest.fn()} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("☰"));
    expect(document.querySelector(".nav.open")).toBeInTheDocument();

    const caretButton = screen.getByRole("button", {
      name: "Toggle features submenu",
    });
    expect(caretButton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(caretButton);
    expect(caretButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Task Reminder")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(document.querySelector(".nav.open")).toBeInTheDocument();
  });
});
