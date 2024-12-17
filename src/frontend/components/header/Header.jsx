import { useEffect, useState } from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isHomePage, setIsHomePage] = useState(false);
  const [isHideMenuMobile, setIsHideMenuMobile] = useState(true);
  const [menuSelected, setMenuSelected] = useState("");

  const linkToSection = ["Home", "Information", "Contact", "Apps"];

  const location = useLocation();

  useEffect(() => {
    const regexHomePage = new RegExp(
      "([hpts]{4,}[:/]{0,}[a-zA-Z0-9.:]{1,}[/]{0,}([#]{1,}[a-zA-Z0-9]{0,}){0,}[/]{0,}){1,}$"
    );
    const checkHonePage = regexHomePage.test(window.location.href);
    setIsHomePage(checkHonePage);
  }, [location]);

  useEffect(() => {
    let menuIconElement = document.querySelector(".header #menu-icon");
    if (window.getComputedStyle(menuIconElement).visibility === "hidden")
      setIsHideMenuMobile(false);
  }, []);

  const handleClickMenuIcon = () => {
    const newValue = isHideMenuMobile === false;
    setIsHideMenuMobile(newValue);
  };

  const handleMenu = (menuName) => {
    setMenuSelected(menuName);
  };

  return (
    <header className="header">
      <a href={window.location.origin} className="logo">
        Zymuk
        <span> Page</span>
      </a>
      <i
        className={isHideMenuMobile ? "bi bi-list" : "bi bi-x"}
        id="menu-icon"
        onClick={handleClickMenuIcon}
      />
      <nav
        className="navbar"
        style={{ display: isHideMenuMobile ? "none" : "block" }}
      >
        {(isHomePage &&
          linkToSection.map((item) => {
            return (
              <a
                key={item}
                href={"#" + item}
                onClick={() => handleMenu(item)}
                className={menuSelected === item ? "active" : null}
              >
                {item}
              </a>
            );
          })) || <Link to="/tools">Tools</Link>}
      </nav>
    </header>
  );
}

export default Header;
