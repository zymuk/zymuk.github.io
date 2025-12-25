import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

const AdminHeader = ({ displayName }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("login", { replace: true });
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
      <h1 className="admin-title">Admin Dashboard</h1>
      <div
        className="admin-header-user"
        ref={dropdownRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Hello, </span>
        <span className="username">{displayName}</span>
        <i className="fas fa-caret-down"></i>
        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
