import React, { createContext, useContext, useState } from "react";
import { DEFAULT_THEME_ID } from "./pages/home/homeThemes";

const STORAGE_KEY = "siteTheme";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID,
  );

  const setTheme = (id) => {
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
