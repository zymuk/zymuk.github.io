import "./header.css";
import { Link } from "react-router-dom";

function HomeHeader() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        <i className="bi bi-list">Zimuk</i>
        <span>Tran</span>
      </Link>
      <nav className="navbar">
        <a href="#Home" className="active">
          Home
        </a>
        <a href="#Information" className="active">
          Information
        </a>
        <a href="#Contact" className="active">
          Contact
        </a>
      </nav>
    </header>
  );
}

export default HomeHeader;
