import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calculator from "../../../../src/site/pages/calculator/Calculator";

const getResult = (container) =>
  container.querySelector(".result").textContent;

const clickSequence = (container, labels) => {
  labels.forEach((label) => {
    fireEvent.click(screen.getByRole("button", { name: label }));
  });
};

describe("Calculator", () => {
  it("performs basic arithmetic", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["2", "+", "3", "="]);
    expect(getResult(container)).toBe("5");

    clickSequence(container, ["C", "9", "-", "4", "="]);
    expect(getResult(container)).toBe("5");

    clickSequence(container, ["C", "7", "×", "8", "="]);
    expect(getResult(container)).toBe("56");

    clickSequence(container, ["C", "8", "÷", "2", "="]);
    expect(getResult(container)).toBe("4");
  });

  it("respects operator precedence", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["5", "+", "3", "×", "2", "="]);
    expect(getResult(container)).toBe("11");
  });

  it("handles decimal numbers", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["0", ".", "5", "+", "0", ".", "5", "="]);
    expect(getResult(container)).toBe("1");
  });

  it("supports unary minus", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["-", "5", "="]);
    expect(getResult(container)).toBe("-5");
  });

  it("supports power operator", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["2", "^", "1", "0", "="]);
    expect(getResult(container)).toBe("1024");
  });

  it("supports square root token", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["√", "9"]);
    expect(container.querySelector(".input").textContent).toBe("√(9");
  });

  it("supports trigonometric function tokens", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["sin"]);
    expect(container.querySelector(".input").textContent).toBe("sin(");

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    clickSequence(container, ["cos"]);
    expect(container.querySelector(".input").textContent).toBe("cos(");

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    clickSequence(container, ["tan"]);
    expect(container.querySelector(".input").textContent).toBe("tan(");
  });

  it("supports log, ln, exp tokens", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["log"]);
    expect(container.querySelector(".input").textContent).toBe("log(");

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    clickSequence(container, ["ln"]);
    expect(container.querySelector(".input").textContent).toBe("ln(");

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    clickSequence(container, ["exp"]);
    expect(container.querySelector(".input").textContent).toBe("exp(");
  });

  it("shows Error for an unterminated function expression", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["sin", "0", "="]);
    expect(getResult(container)).toBe("Error");
  });

  it("evaluates constants pi and e", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["π", "="]);
    expect(getResult(container)).toBe("3.14159265359");

    clickSequence(container, ["C", "e", "="]);
    expect(getResult(container)).toBe("2.71828182846");
  });

  it("shows Error for a malformed expression", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["2", "+", "+", "="]);
    expect(getResult(container)).toBe("Error");
  });

  it("shows Error for division by zero", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["1", "÷", "0", "="]);
    expect(getResult(container)).toBe("Error");
  });

  it("clears input and result with the C button", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["2", "+", "3", "="]);
    expect(getResult(container)).toBe("5");

    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(container.querySelector(".input").textContent).toBe("0");
    expect(getResult(container)).toBe("");
  });

  it("deletes the last character with the backspace button", () => {
    const { container } = render(<Calculator />);
    clickSequence(container, ["1", "2", "3"]);
    expect(container.querySelector(".input").textContent).toBe("123");

    fireEvent.click(screen.getByRole("button", { name: "⌫" }));
    expect(container.querySelector(".input").textContent).toBe("12");
  });

  it("does nothing when = is pressed with an empty input", () => {
    const { container } = render(<Calculator />);
    fireEvent.click(screen.getByRole("button", { name: "=" }));
    expect(container.querySelector(".input").textContent).toBe("0");
    expect(getResult(container)).toBe("");
  });
});
