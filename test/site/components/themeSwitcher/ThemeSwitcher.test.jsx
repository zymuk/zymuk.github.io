import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeSwitcher from "../../../../src/site/components/themeSwitcher/ThemeSwitcher";
import { ThemeProvider } from "../../../../src/site/ThemeContext";

const renderSwitcher = () =>
  render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>,
  );

describe("ThemeSwitcher", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("renders only the toggle button (showing the active theme name) until opened", () => {
    renderSwitcher();
    expect(
      screen.getByRole("button", { name: "Change homepage theme" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Use Midnight theme" }),
    ).not.toBeInTheDocument();
  });

  it("shows the theme options, each with a visible name, when the toggle is clicked", () => {
    renderSwitcher();
    fireEvent.click(
      screen.getByRole("button", { name: "Change homepage theme" }),
    );

    expect(
      screen.getByRole("button", { name: "Use Midnight theme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use Sunset theme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Use Harvard Clean theme" }),
    ).toBeInTheDocument();
  });

  it("selects a theme, persists it, closes the options and updates the toggle label", () => {
    renderSwitcher();
    fireEvent.click(
      screen.getByRole("button", { name: "Change homepage theme" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Use Midnight theme" }));

    expect(localStorage.getItem("siteTheme")).toBe("midnight");
    expect(
      screen.queryByRole("button", { name: "Use Midnight theme" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change homepage theme" }),
    ).toHaveTextContent("Midnight");
  });
});
