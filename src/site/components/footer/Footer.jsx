import React from "react";
import "./Footer.css";

const Footer = () => {
  const linkGithub = "https://github.com/zymuk";
  const linkLinkedin = "https://www.linkedin.com/in/ngoctrt";
  const linkFacebook = "https://www.facebook.com/trtngoc656/";
  const linkEmail = "mailto:ttngoc653@gmail.com";

  return (
    <footer className="footer">
      <div className="social-icons">
        <a href={linkGithub}>
          <i className="fab fa-github"></i>
        </a>
        <a href={linkLinkedin}>
          <i className="fab fa-linkedin"></i>
        </a>
        <a href={linkFacebook}>
          <i className="fab fa-facebook"></i>
        </a>
        <a href={linkEmail}>
          <i className="fas fa-envelope"></i>
        </a>
      </div>
      <p>&copy; 2025 Zymuk Trần - All rights reserved.</p>
    </footer>
  );
};

export default Footer;
