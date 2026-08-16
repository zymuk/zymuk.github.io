import React, { useState } from "react";
import { useTheme } from "../../ThemeContext";
import { HOME_THEMES } from "../../pages/home/homeThemes";
import "./ThemeSwitcher.css";

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const activeTheme = HOME_THEMES.find((t) => t.id === theme) || HOME_THEMES[0];

  return (
    <div className={`theme-switcher ${open ? "open" : ""}`}>
      {open && (
        <div className="theme-switcher-options">
          {HOME_THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-option ${t.id === theme ? "active" : ""}`}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              aria-label={`Use ${t.name} theme`}
            >
              <span
                className="theme-swatch"
                style={{ backgroundColor: t.swatch }}
                aria-hidden="true"
              />
              <span className="theme-option-name">{t.name}</span>
            </button>
          ))}
        </div>
      )}
      <button
        className="theme-switcher-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Change homepage theme"
        aria-expanded={open}
        title="Change homepage theme"
      >
        <span className="theme-switcher-icon" aria-hidden="true">
          🎨
        </span>
        <span className="theme-switcher-label">{activeTheme.name}</span>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
