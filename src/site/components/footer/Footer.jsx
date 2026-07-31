import React, { useState, useEffect } from "react";
import packageJson from "../../../../package.json";
import "./Footer.css";

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    fetch(`/data.json?v=${Date.now()}`)
      .then((response) => response.json())
      .then((data) =>
        setSocialLinks(Array.isArray(data.contact) ? data.contact : [])
      )
      .catch((error) =>
        console.error("Error loading footer social links:", error)
      );
  }, []);

  const renderSocialLinks = () => {
    const links = [];
    for (let i = 0; i < socialLinks.length; i++) {
      const link = socialLinks[i];
      links.push(
        <a key={i} href={link.url} title={link.title}>
          <i className={link.icon}></i>
        </a>
      );
    }
    return links;
  };

  return (
    <footer className="footer-site">
      <div className="footer-site-content">
        <div className="social-icons">{renderSocialLinks()}</div>
        <p>
          <span>&copy; 2025 Zymuk Trần - All rights reserved</span>
          {packageJson.datetimedeploy !== undefined &&
            packageJson.datetimedeploy.length > 0 && (
              <span> - Deploy at {packageJson.datetimedeploy}</span>
            )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
