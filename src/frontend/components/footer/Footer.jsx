import "./footer.css";
import packageJson from "../../../../package.json";

function Footer() {
  return (
    <footer className="footer">
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
