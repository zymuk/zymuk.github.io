import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

const LANGS = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

const AdminHeader = ({ displayName }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [t, setT] = useState({});
  const dropdownRef = useRef(null);
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data));
  }, [lang]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("login", { replace: true });
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const currentLang = localStorage.getItem("lang") || "en";
    if (newLang !== currentLang) {
      localStorage.setItem("lang", newLang);
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="admin-header">
      <h1 className="admin-title">{t.admin_dashboard || "Admin Dashboard"}</h1>
      <div
        className="admin-header-user"
        ref={dropdownRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{t.hello || "Hello"}, </span>
        <span className="username">{displayName}</span>
        <i className="fas fa-caret-down"></i>
        {isOpen && (
          <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "8px 16px" }}>
              <label htmlFor="lang-select" style={{ marginRight: 8 }}>
                {t.language || "Language"}:
              </label>
              <select id="lang-select" value={lang} onChange={handleLangChange}>
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {t[l.code === "en" ? "english" : "vietnamese"] || l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> {t.logout || "Logout"}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
