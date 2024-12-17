import "./footer.css";
import packageJson from "../../../../package.json";

function Footer() {
  return (
    <footer className="footer">
      <div className="social">
        <a href="mailto:ttngoc653@gmail.com">
          <i className="bi bi-envelope"></i>
        </a>
        <a href="https://www.facebook.com/">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="http://github.com/zymuk">
          <i className="bi bi-github"></i>
        </a>
      </div>
      <p className="copyright">
        <span>Copyright 2024 by Zymuk Tran. All Rights Reserved.</span>
        {packageJson.datetimedeploy !== undefined &&
          packageJson.datetimedeploy.length > 0 && (
            <span> - Deploy at {packageJson.datetimedeploy}</span>
          )}
      </p>
    </footer>
  );
}

export default Footer;
