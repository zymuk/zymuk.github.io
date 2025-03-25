import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("..", { replace: true });
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "123456") {
      localStorage.setItem("token", "your_token_here");
      navigate("..", { replace: true });
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="admin-login-container">
      {/* Header */}
      <div className="header">
        <span className="title">Admin Panel</span>
        <span className="home-icon" onClick={() => navigate("/")}>
          <i className="fas fa-home"></i>
        </span>
      </div>

      {/* Login Form */}
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

      {/* Footer */}
      <div className="footer">
        &copy; 2025 Admin Panel. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
