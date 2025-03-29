import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ scrollToSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  const renderMenu = () => {
    const regexHomePage = new RegExp(
      "([hpts]{4,}[:/]{0,}[a-zA-Z0-9.:]{1,}[/]{0,}([#]{1,}[a-zA-Z0-9]{0,}){0,}[/]{0,}){1,}$"
    );
    const checkHonePage = regexHomePage.test(window.location.href);
    if (checkHonePage) {
      return (
        <ul>
          <li>
            <button
              onClick={() => scrollToSection("about")}
              data-scroll="about"
            >
              About
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("projects")}
              data-scroll="projects"
            >
              Projects
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("features")}
              data-scroll="features"
            >
              Features
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("contact")}
              data-scroll="contact"
            >
              Contact
            </button>
          </li>
        </ul>
      );
    } else {
      return (
        <ul>
          <li>
            <Link to="/tools/app1">App 1</Link>
          </li>
          <li>
            <Link to="/tools/app2">App 2</Link>
          </li>
          <li>
            <Link to="/tools">Tools</Link>
          </li>
        </ul>
      );
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1
          className="site-title"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        >
          Zymuk Page
        </h1>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <nav className={`nav ${menuOpen ? "open" : ""}`}>{renderMenu()}</nav>
      </div>
    </header>
  );
};

export default Header;
