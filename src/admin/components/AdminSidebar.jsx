import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`admin-sidebar ${isOpen ? "" : "closed"}`}>
      {/* Nút Toggle */}
      <div className="toggle-btn" onClick={toggleSidebar}>
        <i
          className={`fas ${isOpen ? "fa-chevron-left" : "fa-chevron-right"}`}
        ></i>
      </div>

      {/* Danh sách menu */}
      <ul>
        <li>
          <NavLink to="" className="active">
            <i className="fas fa-tachometer-alt"></i>
            <span className="menu-text">Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="homepage" className="active">
            <i className="fas fa-paint-brush"></i>
            <span className="menu-text">Homepage</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="projects" className="active">
            <i className="fas fa-folder"></i>
            <span className="menu-text">Projects</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="features" className="active">
            <i className="fas fa-tools"></i>
            <span className="menu-text">Features</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="users" className="active">
            <i className="fas fa-users"></i>
            <span className="menu-text">Users</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="settings" className="active">
            <i className="fas fa-cog"></i>
            <span className="menu-text">Settings</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
