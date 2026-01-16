import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LANGS = [
  { code: "en", label: "English" },
  { code: "vi", label: "Vietnamese" },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
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

    // Load users from data.json
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error loading users:", err));
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
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      localStorage.setItem("admin_token", "authenticated");
      localStorage.setItem("user", JSON.stringify(user));
      alert(t.login_success || "Login successful!");
      navigate("/admin", { replace: true });
    } else {
      setError(t.login_error || "Invalid email or password!");
    }
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.enter_email || "Enter email"}
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
