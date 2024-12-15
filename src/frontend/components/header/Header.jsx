import "./header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Zimuk
        <span>Tran</span>
      </Link>
      <i className="bi bi-list" id="menu-icon" />
      <nav className="navbar">
        <Link to="/" className="active">
          Home
        </Link>
        <Link to="/tools">Tools</Link>
      </nav>
    </header>
  );
}

export default Header;
