import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LANGS = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [t, setT] = useState({});
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const navigate = useNavigate();

  useEffect(() => {
    const timestamp = new Date().getTime();
    fetch(`/${lang}.json?v=${timestamp}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setT(data);
      })
      .catch((error) => {
        console.error("Error loading translations:", error);
        // Fallback to English
        fetch(`/en.json?v=${timestamp}`)
          .then((res) => res.json())
          .then((data) => setT(data))
          .catch((fallbackError) =>
            console.error("Fallback error:", fallbackError)
          );
      });
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    // Only redirect if we're on the login page and have token
    if (token && window.location.pathname === "/admin/login") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    const currentLang = localStorage.getItem("lang") || "en";
    if (newLang !== currentLang) {
      setLang(newLang);
      localStorage.setItem("lang", newLang);
      // Use setTimeout to avoid immediate reload during state update
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Fake login: always succeed and set a dummy token
    localStorage.setItem("admin_token", "dummy_token");
    alert(t.login_success || "Login successful! (Static site mode)");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="admin-login-container">
      <div className="header">
        <span className="title">{t.admin_panel || "Admin Panel"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={lang}
            onChange={handleLangChange}
            style={{ padding: "4px" }}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <span className="home-icon" onClick={() => navigate("/")}>
            <i className="fas fa-home"></i>
          </span>
        </div>
      </div>
      <div className="login-container">
        <h2>{t.login_title || "Admin Login"}</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="input-box"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.enter_username || "Enter username"}
            required
          />
          <input
            type="password"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.enter_password || "Enter password"}
            required
          />
          <button type="submit" className="button">
            {t.login_button || "Login"}
          </button>
        </form>
      </div>
      <div className="footer">
        {t.footer_text || "© 2025 Zymuk Trần. All rights reserved."}
      </div>
    </div>
  );
};

export default Login;
