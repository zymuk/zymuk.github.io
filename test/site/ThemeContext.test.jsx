import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../../src/site/ThemeContext";

const Consumer = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("midnight")}>midnight</button>
      <button onClick={() => setTheme("default")}>default</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <ThemeProvider>
      <Consumer />
    </ThemeProvider>,
  );

describe("ThemeContext", () => {
  it("defaults to the 'default' theme when nothing is stored", () => {
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("default");
  });

  it("updates the theme and persists it to localStorage", () => {
    renderWithProvider();
    fireEvent.click(screen.getByRole("button", { name: "midnight" }));

    expect(screen.getByTestId("theme").textContent).toBe("midnight");
    expect(localStorage.getItem("siteTheme")).toBe("midnight");
  });

  it("restores a previously chosen theme from localStorage on mount", () => {
    localStorage.setItem("siteTheme", "sunset");
    renderWithProvider();
    expect(screen.getByTestId("theme").textContent).toBe("sunset");
  });
});
