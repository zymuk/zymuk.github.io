import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NumerologyName from "../../../../src/site/pages/numerologyName/NumerologyName";

const BIRTH_DATE = "1990-05-15";

const generate = (container, date = BIRTH_DATE) => {
  fireEvent.change(screen.getByLabelText(/birth date/i), {
    target: { value: date },
  });
  fireEvent.click(screen.getByRole("button", { name: /generate name/i }));
  return container.querySelector(".result-display").textContent;
};

const getHistory = () => JSON.parse(localStorage.getItem("numerologyHistory"));

describe("NumerologyName", () => {
  it("shows the empty history state", () => {
    render(<NumerologyName />);
    expect(screen.getByText("No history yet")).toBeInTheDocument();
  });

  it("shows the number mapping table after choosing a birth date", () => {
    const { container } = render(<NumerologyName />);
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: BIRTH_DATE },
    });
    expect(container.querySelector(".mapping-table")).toBeInTheDocument();
  });

  it("generates a name whose letters match the missing numbers", () => {
    const { container } = render(<NumerologyName />);
    const name = generate(container);
    // For 1990-05-15 the digits 2,3,4,6,7,8 are missing -> 6 letters from their sets.
    expect(name).toMatch(/^[BCDFGHKLMOPQSTUVXYZ]{6}$/);
  });

  it("saves the generated name to history and localStorage", () => {
    const { container } = render(<NumerologyName />);
    generate(container);

    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));
    expect(screen.getByText(/Birth Date: 1990-05-15/)).toBeInTheDocument();

    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].date).toBe(BIRTH_DATE);
    expect(history[0].results).toHaveLength(1);
  });

  it("filters history by the search term", () => {
    const { container } = render(<NumerologyName />);
    generate(container);
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));

    fireEvent.change(screen.getByPlaceholderText("Search history..."), {
      target: { value: "1990" },
    });
    expect(screen.getByText(/Birth Date: 1990-05-15/)).toBeInTheDocument();
  });

  it("shows 'No entries found' when search matches nothing", () => {
    const { container } = render(<NumerologyName />);
    generate(container);
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));

    fireEvent.change(screen.getByPlaceholderText("Search history..."), {
      target: { value: "2025" },
    });
    expect(screen.getByText("No entries found")).toBeInTheDocument();
  });

  it("deletes a history entry after confirmation", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = render(<NumerologyName />);
    generate(container);
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.queryByText(/Birth Date: 1990-05-15/)).not.toBeInTheDocument();
    expect(getHistory()).toHaveLength(0);
  });

  it("keeps the entry when deletion is cancelled", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const { container } = render(<NumerologyName />);
    generate(container);
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));

    fireEvent.click(screen.getByTitle("Delete"));
    expect(screen.getByText(/Birth Date: 1990-05-15/)).toBeInTheDocument();
    expect(getHistory()).toHaveLength(1);
  });

  it("clears all history after confirmation", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const { container } = render(<NumerologyName />);
    generate(container);
    fireEvent.click(screen.getByRole("button", { name: /save to history/i }));

    fireEvent.click(screen.getByText(/clear all/i));
    expect(screen.getByText("No history yet")).toBeInTheDocument();
    expect(getHistory()).toEqual([]);
  });
});
