import "./header.css";
import { Link } from "react-router-dom";

function HomeHeader() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Zimuk
        <span>Tran</span>
      </Link>
      <i className="bi bi-list" id="menu-icon" />
      <nav className="navbar">
        <a href="#Home" className="active">
          Home
        </a>
        <a href="#Information">Information</a>
        <a href="#Contact">Contact</a>
      </nav>
    </header>
  );
}

export default HomeHeader;
