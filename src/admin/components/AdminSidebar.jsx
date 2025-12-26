import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((err) => {
        console.error("Error loading translations:", err);
        // Fallback to English translations
        fetch("/en.json")
          .then((res) => res.json())
          .then((data) => setT(data));
      });
  }, [lang]);
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
            <span className="menu-text">{t.dashboard || "Dashboard"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="homepage" className="active">
            <i className="fas fa-paint-brush"></i>
            <span className="menu-text">{t.homepage || "Homepage"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="projects" className="active">
            <i className="fas fa-folder"></i>
            <span className="menu-text">{t.projects || "Projects"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="features" className="active">
            <i className="fas fa-tools"></i>
            <span className="menu-text">{t.features || "Features"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="experience" className="active">
            <i className="fas fa-briefcase"></i>
            <span className="menu-text">{t.experience || "Experience"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="profile">
            <i className="fas fa-user-edit"></i>
            <span className="menu-text">
              {t.edit_profile || "Edit Profile"}
            </span>
          </NavLink>
        </li>
        <li>
          <NavLink to="users" className="active">
            <i className="fas fa-users"></i>
            <span className="menu-text">{t.users || "Users"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="settings" className="active">
            <i className="fas fa-cog"></i>
            <span className="menu-text">{t.settings || "Settings"}</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
