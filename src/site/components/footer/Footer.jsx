import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="github">
          <i className="fab fa-github"></i>
        </a>
        <a href="linkedin">
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="twitter">
          <i className="fab fa-twitter"></i>
        </a>
      </div>
      <p>&copy; 2025 [Your Name] - All rights reserved.</p>
    </footer>
  );
};

export default Footer;
