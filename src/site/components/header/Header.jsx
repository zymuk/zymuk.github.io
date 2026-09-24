import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

const Header = ({ scrollToSection }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresSubmenuOpen, setFeaturesSubmenuOpen] = useState(false);
  const [animationsSubmenuOpen, setAnimationsSubmenuOpen] = useState(false);
  const headerRef = useRef(null);
  const isMobile = () =>
    window.matchMedia &&
    window.matchMedia("(max-width: 1440px)").matches;
  const toggleMenu = () => {
    if (menuOpen) {
      closeMenus();
    } else {
      setFeaturesSubmenuOpen(false);
      setAnimationsSubmenuOpen(false);
      setMenuOpen(true);
    }
  };
  const closeMenus = () => {
    setMenuOpen(false);
    setFeaturesSubmenuOpen(false);
    setAnimationsSubmenuOpen(false);
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [listActivedFeatures, setListActivedFeatures] = useState([]);
  const [listActivedAnimations, setListActivedAnimations] = useState([]);
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
    let active = true;
    const visibleOnly = (list) =>
      list.filter((item) => item.isVisible !== false);
    const readSaved = (key) => {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : null;
      } catch (error) {
        console.error(`Invalid ${key} data in localStorage:`, error);
        return null;
      }
    };

    const savedFeatures = readSaved("features");
    const savedAnimations = readSaved("animations");
    if (savedFeatures) setListActivedFeatures(visibleOnly(savedFeatures));
    if (savedAnimations) setListActivedAnimations(visibleOnly(savedAnimations));

    if (savedFeatures && savedAnimations) return;

    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        if (!savedFeatures) {
          setListActivedFeatures(visibleOnly(data.features || []));
        }
        if (!savedAnimations) {
          setListActivedAnimations(visibleOnly(data.animations || []));
        }
      })
      .catch((error) => console.error("Error loading section lists:", error));

    return () => {
      active = false;
    };
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
          onClick={(event) => {
            if (!event.target.closest("li.has-submenu")) {
              setMenuOpen(false);
              setFeaturesSubmenuOpen(false);
              setAnimationsSubmenuOpen(false);
            }
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
              onClick={(event) => {
                if (isMobile()) {
                  event.stopPropagation();
                  setAnimationsSubmenuOpen(false);
                  setFeaturesSubmenuOpen(!featuresSubmenuOpen);
                } else {
                  scrollToSection("features");
                }
              }}
              aria-expanded={featuresSubmenuOpen}
              data-scroll="features"
            >
              Features
            </button>
            <button
              className="submenu-toggle"
              onClick={(event) => {
                event.stopPropagation();
                setAnimationsSubmenuOpen(false);
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
                      <Link to={"/features/" + element.id}>
                        {element.displayName}
                      </Link>
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
          <li
            className={`has-submenu ${animationsSubmenuOpen ? "open" : ""}`}
          >
            <button
              onClick={(event) => {
                if (isMobile()) {
                  event.stopPropagation();
                  setFeaturesSubmenuOpen(false);
                  setAnimationsSubmenuOpen(!animationsSubmenuOpen);
                } else {
                  scrollToSection("animations");
                }
              }}
              aria-expanded={animationsSubmenuOpen}
              data-scroll="animations"
            >
              Animations
            </button>
            <button
              className="submenu-toggle"
              onClick={(event) => {
                event.stopPropagation();
                setFeaturesSubmenuOpen(false);
                setAnimationsSubmenuOpen(!animationsSubmenuOpen);
              }}
              aria-haspopup="true"
              aria-expanded={animationsSubmenuOpen}
              aria-label="Toggle animations submenu"
            >
              ▾
            </button>
            <ul className="submenu">
              {listActivedAnimations.length > 0 ? (
                listActivedAnimations.map((element) => {
                  return (
                    <li key={element.id}>
                      <Link to={"/animations/" + element.id}>
                        {element.displayName}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li>
                  <Link to="/">No animations available</Link>
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
      const isActive = (path) => location.pathname === path;
      const showFeatures = location.pathname.startsWith("/features");
      const showAnimations = location.pathname.startsWith("/animations");
      const showBoth = !showFeatures && !showAnimations;
      return (
        <ul onClick={() => setMenuOpen(false)}>
          <li>
            <Link
              to="/"
              className={isActive("/") ? "active" : ""}
              aria-current={isActive("/") ? "page" : undefined}
            >
              Home
            </Link>
          </li>
          {(showFeatures || showBoth) &&
            (listActivedFeatures.length > 0 ? (
              listActivedFeatures.map((element) => {
                const path = element.path || "/features/" + element.id;
                const active = isActive(path);
                return (
                  <li key={element.id}>
                    <Link
                      to={path}
                      className={active ? "active" : ""}
                      aria-current={active ? "page" : undefined}
                    >
                      {element.displayName}
                      {element.id === "reminders" && reminderCount > 0 && (
                        <span
                          className="nav-badge"
                          aria-label="Pending reminders"
                        >
                          {reminderCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li>
                <Link to="/" key="no-features">
                  No features available
                </Link>
              </li>
            ))}
          {(showAnimations || showBoth) &&
            (listActivedAnimations.length > 0 ? (
              listActivedAnimations.map((element) => {
                const path = element.path || "/animations/" + element.id;
                const active = isActive(path);
                return (
                  <li key={element.id}>
                    <Link
                      to={path}
                      className={active ? "active" : ""}
                      aria-current={active ? "page" : undefined}
                    >
                      {element.displayName}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li>
                <Link to="/" key="no-animations">
                  No animations available
                </Link>
              </li>
            ))}
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
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <nav className={`nav ${menuOpen ? "open" : ""}`}>{renderMenu()}</nav>
      </div>
    </header>
  );
};

export default Header;
