import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("login", { replace: true });
  };

  return (
    <header className="admin-header">
      <h1 className="admin-title">Admin Dashboard</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
