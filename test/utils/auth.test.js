import {
  generateToken,
  isAuthenticated,
  logout,
  TOKEN_KEY,
  TOKEN_EXP_KEY,
  USER_KEY,
  SESSION_DURATION_MS,
} from "../../src/utils/auth";

describe("auth utils", () => {
  describe("generateToken", () => {
    it("returns a 32-character lowercase hex string (128-bit)", () => {
      const token = generateToken();
      expect(token).toMatch(/^[0-9a-f]{32}$/);
    });

    it("produces a unique token on every call", () => {
      const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
      expect(tokens.size).toBe(100);
    });

    it("reads random bytes from crypto.getRandomValues", () => {
      const spy = jest.spyOn(globalThis.crypto, "getRandomValues");
      generateToken();
      expect(spy).toHaveBeenCalledWith(expect.any(Uint8Array));
      expect(spy.mock.calls[0][0].length).toBe(16);
    });
  });

  describe("isAuthenticated", () => {
    it("returns false when no token is stored", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("returns false when the expiration value is missing", () => {
      localStorage.setItem(TOKEN_KEY, "abc");
      expect(isAuthenticated()).toBe(false);
    });

    it("returns false when the expiration value is not a number", () => {
      localStorage.setItem(TOKEN_KEY, "abc");
      localStorage.setItem(TOKEN_EXP_KEY, "not-a-number");
      expect(isAuthenticated()).toBe(false);
    });

    it("returns false when the session has expired", () => {
      localStorage.setItem(TOKEN_KEY, "abc");
      localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() - 1000));
      expect(isAuthenticated()).toBe(false);
    });

    it("returns true for a valid unexpired session", () => {
      localStorage.setItem(TOKEN_KEY, "abc");
      localStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + 60_000));
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("logout", () => {
    it("removes token, expiration and user keys from localStorage", () => {
      localStorage.setItem(TOKEN_KEY, "abc");
      localStorage.setItem(TOKEN_EXP_KEY, "123");
      localStorage.setItem(USER_KEY, '{"email":"a@b.com"}');

      logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(TOKEN_EXP_KEY)).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });

  it("defines a 24-hour session duration", () => {
    expect(SESSION_DURATION_MS).toBe(24 * 60 * 60 * 1000);
  });
});
