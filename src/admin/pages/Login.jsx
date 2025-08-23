import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import packageJson from "../../../package.json";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setTimeout(() => {
        navigate("/admin");
      }, 100);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    const apiPage =
      packageJson.apipage !== undefined && packageJson.apipage.length > 0
        ? packageJson.apipage
        : "http://localhost/zymuk_page_api/";
    const response = await fetch(apiPage + "/api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = response.json();
    if (data.token) {
      localStorage.setItem("admin_token", data.token);
      alert("Login successful!");
      setTimeout(() => {
        navigate("/admin");
      }, 100);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="header">
        <span className="title">Admin Panel</span>
        <span className="home-icon" onClick={() => navigate("/")}>
          <i className="fas fa-home"></i>
        </span>
      </div>
      <div className="login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            className="input-box"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          <input
            type="password"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          <button type="submit" className="button">
            Login
          </button>
        </form>
      </div>
      <div className="footer">&copy; 2025 Zymuk Trần. All rights reserved.</div>
    </div>
  );
};

export default Login;
