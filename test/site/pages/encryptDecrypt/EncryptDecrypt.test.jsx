import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EncryptDecrypt from "../../../../src/site/pages/encryptDecrypt/EncryptDecrypt";

const setup = () => {
  const utils = render(<EncryptDecrypt />);
  const textareas = () => utils.container.querySelectorAll("textarea");

  return {
    ...utils,
    setAlgorithm: (value) =>
      fireEvent.change(screen.getByLabelText("Algorithm:"), {
        target: { value },
      }),
    setMode: (mode) => {
      const [encryptBtn, decryptBtn] =
        utils.container.querySelectorAll(".mode-btn");
      fireEvent.click(mode === "encrypt" ? encryptBtn : decryptBtn);
    },
    setInput: (value) =>
      fireEvent.change(textareas()[0], { target: { value } }),
    process: () =>
      fireEvent.click(utils.container.querySelector(".btn-process")),
    output: () => textareas()[1].value,
    input: () => textareas()[0].value,
    status: () =>
      utils.container.querySelector(".status-message")?.textContent || "",
    password: (value) =>
      fireEvent.change(utils.container.querySelector("#password"), {
        target: { value },
      }),
  };
};

const roundTrip = (utils, algorithm, plainText, password) => {
  utils.setAlgorithm(algorithm);
  if (password) {
    utils.password(password);
  }
  utils.setInput(plainText);
  utils.process();
  const encrypted = utils.output();
  expect(encrypted).not.toBe("");

  utils.setInput(encrypted);
  utils.setMode("decrypt");
  utils.process();
  expect(utils.output()).toBe(plainText);
};

describe("EncryptDecrypt", () => {
  describe("encrypt/decrypt roundtrips", () => {
    it("base64", () => {
      roundTrip(setup(), "base64", "hello world");
    });

    it("caesar cipher", () => {
      roundTrip(setup(), "caesar", "hello");
    });

    it("rot13 (symmetric)", () => {
      roundTrip(setup(), "rot13", "hello");
    });

    it("atbash (symmetric)", () => {
      roundTrip(setup(), "atbash", "hello");
    });

    it("reverse text", () => {
      roundTrip(setup(), "reverse", "abc");
    });

    it("binary encoding", () => {
      roundTrip(setup(), "binary", "Hi");
    });

    it("hex encoding", () => {
      roundTrip(setup(), "hex", "Hi");
    });

    it("ascii values", () => {
      roundTrip(setup(), "ascii", "Hi");
    });

    it("url encoding", () => {
      roundTrip(setup(), "url", "a b");
    });

    it("morse code", () => {
      roundTrip(setup(), "morse", "SOS");
    });

    it("pig latin for a vowel-start word", () => {
      roundTrip(setup(), "piglatin", "hello");
    });

    it("xor cipher with password", () => {
      roundTrip(setup(), "xor", "hello world", "secret");
    });

    it("vigenere cipher with password", () => {
      roundTrip(setup(), "vigenere", "hello world", "key");
    });
  });

  describe("known expected outputs", () => {
    it("base64 encodes 'hello world'", () => {
      const utils = setup();
      utils.setInput("hello world");
      utils.process();
      expect(utils.output()).toBe("aGVsbG8gd29ybGQ=");
    });

    it("caesar shifts letters by 3", () => {
      const utils = setup();
      utils.setAlgorithm("caesar");
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("khoor");
    });

    it("rot13 rotates letters", () => {
      const utils = setup();
      utils.setAlgorithm("rot13");
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("uryyb");
    });

    it("vigenere encrypts 'hello' with key 'key' to 'rijvs'", () => {
      const utils = setup();
      utils.setAlgorithm("vigenere");
      utils.password("key");
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("rijvs");
    });

    it("morse encodes 'SOS'", () => {
      const utils = setup();
      utils.setAlgorithm("morse");
      utils.setInput("SOS");
      utils.process();
      expect(utils.output()).toBe("... --- ...");
    });

    it("binary encodes 'A' to 01000001", () => {
      const utils = setup();
      utils.setAlgorithm("binary");
      utils.setInput("A");
      utils.process();
      expect(utils.output()).toBe("01000001");
    });

    it("hex encodes 'A' to 41", () => {
      const utils = setup();
      utils.setAlgorithm("hex");
      utils.setInput("A");
      utils.process();
      expect(utils.output()).toBe("41");
    });

    it("url encodes 'a b' to 'a%20b'", () => {
      const utils = setup();
      utils.setAlgorithm("url");
      utils.setInput("a b");
      utils.process();
      expect(utils.output()).toBe("a%20b");
    });

    it("md5 produces the known hash for 'hello'", () => {
      const utils = setup();
      utils.setAlgorithm("md5");
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("5d41402abc4b2a76b9719d911017c592");
    });

    it("sha256 produces the known hash for 'hello'", async () => {
      const utils = setup();
      utils.setAlgorithm("sha256");
      utils.setInput("hello");
      utils.process();
      await waitFor(() =>
        expect(utils.output()).toBe(
          "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        ),
      );
    });
  });

  describe("validation and errors", () => {
    it("blocks processing empty input", () => {
      const utils = setup();
      utils.process();
      expect(utils.status()).toContain("Please enter text to process");
      expect(utils.output()).toBe("");
    });

    it("requires a password for xor", () => {
      const utils = setup();
      utils.setAlgorithm("xor");
      utils.setInput("hello");
      utils.process();
      expect(utils.status()).toContain("Password is required for XOR");
      expect(utils.output()).toBe("");
    });

    it("requires a password for vigenere", () => {
      const utils = setup();
      utils.setAlgorithm("vigenere");
      utils.setInput("hello");
      utils.process();
      expect(utils.status()).toContain("Password is required for VIGENERE");
    });

    it("rejects decrypting a hash (one-way only)", () => {
      const utils = setup();
      utils.setAlgorithm("md5");
      utils.setMode("decrypt");
      utils.setInput("abc");
      utils.process();
      expect(utils.status()).toContain("Hash functions are one-way only");
      expect(utils.output()).toBe("");
    });

    it("shows an error for invalid base64 input", () => {
      const utils = setup();
      utils.setMode("decrypt");
      utils.setInput("!!!");
      utils.process();
      expect(utils.status()).toContain("Error");
      expect(utils.output()).toBe("");
    });
  });

  describe("swap, copy and clear", () => {
    it("swaps output into input and toggles mode", () => {
      const utils = setup();
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("aGVsbG8=");

      fireEvent.click(utils.container.querySelector(".btn-swap"));
      expect(utils.input()).toBe("aGVsbG8=");
      expect(utils.output()).toBe("");

      utils.process();
      expect(utils.output()).toBe("hello");
    });

    it("copies the output via navigator.clipboard", () => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: jest.fn().mockResolvedValue() },
        configurable: true,
      });
      const utils = setup();
      utils.setInput("hello");
      utils.process();

      fireEvent.click(utils.container.querySelector(".btn-copy"));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("aGVsbG8=");
      expect(utils.status()).toContain("Copied to clipboard");
    });

    it("clears input, output, password and status", () => {
      const utils = setup();
      utils.setAlgorithm("vigenere");
      utils.password("key");
      utils.setInput("hello");
      utils.process();
      expect(utils.output()).toBe("rijvs");

      fireEvent.click(utils.container.querySelector(".btn-clear"));
      expect(utils.input()).toBe("");
      expect(utils.output()).toBe("");
      expect(utils.status()).toBe("");
      expect(utils.container.querySelector("#password").value).toBe("");
    });
  });
});
