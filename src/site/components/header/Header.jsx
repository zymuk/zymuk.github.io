import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Header = ({ scrollToSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresSubmenuOpen, setFeaturesSubmenuOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenus = () => {
    setMenuOpen(false);
    setFeaturesSubmenuOpen(false);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [listActivedFeatures, setListActivedFeatures] = useState([]);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    const updateReminderCount = () => {
      try {
        const raw = localStorage.getItem("reminders");
        const items = raw ? JSON.parse(raw) : [];
        setReminderCount(items.filter((reminder) => !reminder.notified).length);
      } catch (error) {
        console.error("Invalid reminders data in localStorage:", error);
        setReminderCount(0);
      }
    };
    updateReminderCount();
    window.addEventListener("zymuk-reminders-changed", updateReminderCount);
    window.addEventListener("storage", updateReminderCount);
    return () => {
      window.removeEventListener("zymuk-reminders-changed", updateReminderCount);
      window.removeEventListener("storage", updateReminderCount);
    };
  }, []);

  useEffect(() => {
    let parsedFeatures = null;
    const savedFeatures = localStorage.getItem("features");
    if (savedFeatures) {
      try {
        parsedFeatures = JSON.parse(savedFeatures);
      } catch (error) {
        console.error("Invalid features data in localStorage:", error);
        parsedFeatures = null;
      }
    }

    if (parsedFeatures) {
      setListActivedFeatures(
        parsedFeatures.filter((feature) => feature.isVisible === true),
      );
    } else {
      fetch("/data.json")
        .then((response) => response.json())
        .then((data) => {
          const features = data.features || [];
          setListActivedFeatures(
            features.filter((feature) => feature.isVisible === true),
          );
        })
        .catch((error) => {
          console.error("Error loading features:", error);
        });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeMenus();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const renderMenu = () => {
    const checkHomePage = location.pathname === "/";
    if (checkHomePage) {
      return (
        <ul
          onClick={() => {
            setMenuOpen(false);
            setFeaturesSubmenuOpen(false);
          }}
        >
          <li>
            <button onClick={() => scrollToSection("hero")} data-scroll="hero">
              Hero
            </button>
          </li>
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
              onClick={() => scrollToSection("experience")}
              data-scroll="experience"
            >
              Experience
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("education")}
              data-scroll="education"
            >
              Education
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("certifications")}
              data-scroll="certifications"
            >
              Certifications
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("skills")}
              data-scroll="skills"
            >
              Skills
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
          <li
            className={`has-submenu ${featuresSubmenuOpen ? "open" : ""}`}
          >
            <button
              onClick={() => scrollToSection("features")}
              data-scroll="features"
            >
              Features
            </button>
            <button
              className="submenu-toggle"
              onClick={(event) => {
                event.stopPropagation();
                setFeaturesSubmenuOpen(!featuresSubmenuOpen);
              }}
              aria-haspopup="true"
              aria-expanded={featuresSubmenuOpen}
              aria-label="Toggle features submenu"
            >
              ▾
            </button>
            <ul className="submenu">
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
                  <Link to="/">No features available</Link>
                </li>
              )}
            </ul>
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
        <ul onClick={() => setMenuOpen(false)}>
          {listActivedFeatures.length > 0 ? (
            listActivedFeatures.map((element) => {
              return (
                <li key={element.id}>
                  <Link to={"/" + element.id}>
                    {element.displayName}
                    {element.id === "reminders" && reminderCount > 0 && (
                      <span className="nav-badge" aria-label="Pending reminders">
                        {reminderCount}
                      </span>
                    )}
                  </Link>
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
    <header className="header" ref={headerRef}>
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
