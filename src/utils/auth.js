const TOKEN_KEY = "admin_token";
const TOKEN_EXP_KEY = "admin_token_exp";
const USER_KEY = "user";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export const generateToken = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return false;
  }
  const exp = Number(localStorage.getItem(TOKEN_EXP_KEY));
  if (!exp || Number.isNaN(exp) || Date.now() >= exp) {
    return false;
  }
  return true;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXP_KEY);
  localStorage.removeItem(USER_KEY);
};

export { TOKEN_KEY, TOKEN_EXP_KEY, USER_KEY, SESSION_DURATION_MS };
