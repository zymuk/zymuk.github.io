import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JsonFormatter from "../../../../src/site/pages/jsonFormatter/JsonFormatter";

const getTextareas = (container) =>
  container.querySelectorAll("textarea");

const typeInput = (value) =>
  fireEvent.change(screen.getByPlaceholderText("Paste JSON here..."), {
    target: { value },
  });

describe("JsonFormatter", () => {
  it("formats valid JSON with indentation", () => {
    const { container } = render(<JsonFormatter />);
    typeInput('{"name":"zymuk","tags":["qa","dev"]}');
    fireEvent.click(screen.getByRole("button", { name: "Format" }));

    const [, output] = getTextareas(container);
    expect(output.value).toBe(
      '{\n  "name": "zymuk",\n  "tags": [\n    "qa",\n    "dev"\n  ]\n}'
    );
    expect(screen.getByText(/Valid JSON/)).toBeInTheDocument();
  });

  it("minifies valid JSON", () => {
    const { container } = render(<JsonFormatter />);
    typeInput('{\n  "name": "zymuk",\n  "count": 2\n}');
    fireEvent.click(screen.getByRole("button", { name: "Minify" }));

    const [, output] = getTextareas(container);
    expect(output.value).toBe('{"name":"zymuk","count":2}');
    expect(screen.getByText(/Valid JSON/)).toBeInTheDocument();
  });

  it("validates JSON without changing it", () => {
    const { container } = render(<JsonFormatter />);
    typeInput('{"ok":true}');
    fireEvent.click(screen.getByRole("button", { name: "Validate" }));

    const [, output] = getTextareas(container);
    expect(output.value).toBe('{\n  "ok": true\n}');
    expect(screen.getByText(/no syntax errors/)).toBeInTheDocument();
  });

  it("shows the error location (line and column) for invalid JSON", () => {
    render(<JsonFormatter />);
    typeInput('{\n  "a": 1,\n}');
    fireEvent.click(screen.getByRole("button", { name: "Format" }));

    expect(screen.getByText(/Invalid JSON at line 3, column 1/)).toBeInTheDocument();
  });

  it("shows an error message when formatting empty input", () => {
    render(<JsonFormatter />);
    fireEvent.click(screen.getByRole("button", { name: "Format" }));

    expect(screen.getByText(/JSON input is empty/)).toBeInTheDocument();
  });

  it("clears input, output and status", () => {
    const { container } = render(<JsonFormatter />);
    typeInput('{"a":1}');
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    const [input, output] = getTextareas(container);
    expect(input.value).toBe("");
    expect(output.value).toBe("");
    expect(screen.queryByText(/Valid JSON/)).not.toBeInTheDocument();
  });

  it("copies the formatted result via navigator.clipboard", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue() },
      configurable: true,
    });

    render(<JsonFormatter />);
    typeInput('{"a":1}');
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '{\n  "a": 1\n}'
    );
  });
});
