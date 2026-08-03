import "@testing-library/jest-dom";

// Provide the full WebCrypto API (getRandomValues + subtle.digest) which the
// app relies on (auth token generation, SHA hashes in EncryptDecrypt).
try {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    const { webcrypto } = require("crypto");
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
      writable: true,
    });
  }
} catch (err) {
  // Keep whatever the environment already provides.
}

// jsdom does not expose TextEncoder/TextDecoder, but EncryptDecrypt uses them
// for hashing/encoding. Node's globals are a drop-in replacement.
try {
  if (typeof globalThis.TextEncoder === "undefined") {
    const { TextEncoder, TextDecoder } = require("util");
    globalThis.TextEncoder = TextEncoder;
    globalThis.TextDecoder = TextDecoder;
  }
} catch (err) {
  // Keep whatever the environment already provides.
}

// Browser APIs that jsdom does not implement (or only logs "not implemented")
// but some components call.
window.scrollTo = () => {};
window.alert = () => {};
document.execCommand = document.execCommand || (() => false);

// Keep localStorage isolated between tests.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});
