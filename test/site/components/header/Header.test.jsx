import React from "react";
import { render, screen, act } from "@testing-library/react";
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
});
