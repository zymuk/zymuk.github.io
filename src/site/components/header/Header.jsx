import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import packageJson from "../../../../package.json";
import "./Header.css";

const Header = ({ scrollToSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const navigate = useNavigate();
  const apiPage =
    packageJson.apipage !== undefined && packageJson.apipage.length > 0
      ? packageJson.apipage
      : "http://localhost/zymuk_page_api/";
  const [listActivedFeatures, setListActivedFeatures] = useState([
    {
      id: "calculator",
      displayName: "Calculator",
      description: "",
      isVisible: true,
    },
    { id: "notes", displayName: "Notes", description: "", isVisible: true },
    {
      id: "save_web",
      displayName: "Save Web Page",
      description: "",
      isVisible: false,
    },
    {
      id: "numerology-name",
      displayName: "Auto generate numerology name",
      description: "",
      isVisible: true,
    },
    {
      id: "text_encoder_decoder",
      displayName: "Encode/Decode Text",
      description: "",
      isVisible: false,
    },
  ]);

  useEffect(() => {
    fetch(apiPage + "/api/load_features.php", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setListActivedFeatures(data.data);
        } else {
          // NOTE: alert để thông báo lỗi, cân nhắc thay thế UI thông báo phù hợp
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error loading features:", error);
      });
  }, [apiPage]);

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
          {listActivedFeatures.length > 0 ? (
            listActivedFeatures.map((element) => {
              return (
                <li key={element.id}>
                  <Link to={"/" + element.id}>{element.displayName}</Link>
                </li>
              );
            })
          ) : (
            <li>
              <Link to="/" key="no">
                No features available
              </Link>
            </li>
          )}
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
