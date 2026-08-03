import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextEncoderDecoder from "../../../../src/site/pages/textEncoderDecoder/TextEncoderDecoder";

const getTextareas = (container) =>
  container.querySelectorAll("textarea");

describe("TextEncoderDecoder", () => {
  it("URL-encodes the input text", () => {
    const { container } = render(<TextEncoderDecoder />);
    fireEvent.change(
      screen.getByPlaceholderText("Enter text to encode/decode"),
      { target: { value: "hello world" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Encode" }));

    const [encoded, decoded] = getTextareas(container);
    expect(encoded.value).toBe("hello%20world");
    expect(decoded.value).toBe("");
  });

  it("URL-decodes previously encoded text", () => {
    const { container } = render(<TextEncoderDecoder />);
    fireEvent.change(
      screen.getByPlaceholderText("Enter text to encode/decode"),
      { target: { value: "hello world" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Encode" }));
    fireEvent.click(screen.getByRole("button", { name: "Decode" }));

    const [encoded, decoded] = getTextareas(container);
    expect(encoded.value).toBe("hello%20world");
    expect(decoded.value).toBe("hello world");
  });

  it("round-trips unicode text through encode then decode", () => {
    const { container } = render(<TextEncoderDecoder />);
    fireEvent.change(
      screen.getByPlaceholderText("Enter text to encode/decode"),
      { target: { value: "xin chào" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Encode" }));

    const [encoded] = getTextareas(container);
    expect(encoded.value).toBe("xin%20ch%C3%A0o");

    fireEvent.click(screen.getByRole("button", { name: "Decode" }));

    const [, decoded] = getTextareas(container);
    expect(decoded.value).toBe("xin chào");
  });

  it("shows an error message when encoding empty input", () => {
    const { container } = render(<TextEncoderDecoder />);
    fireEvent.click(screen.getByRole("button", { name: "Encode" }));
    const [encoded] = getTextareas(container);
    expect(encoded.value).toBe(
      "Error: Input text is empty. Please enter text to encode.",
    );
  });

  it("shows an error message when decoding empty input", () => {
    const { container } = render(<TextEncoderDecoder />);
    fireEvent.click(screen.getByRole("button", { name: "Decode" }));
    const [, decoded] = getTextareas(container);
    expect(decoded.value).toBe(
      "Error: Encoded text is empty. Please enter text to decode.",
    );
  });

  it("copies the encoded result via navigator.clipboard", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue() },
      configurable: true,
    });

    const { container } = render(<TextEncoderDecoder />);
    fireEvent.change(
      screen.getByPlaceholderText("Enter text to encode/decode"),
      { target: { value: "abc" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Encode" }));

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("abc");
  });
});
