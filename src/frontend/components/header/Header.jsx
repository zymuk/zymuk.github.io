import "./header.css";

function Header() {
  return (
    <header className="header">
      <a href="#" className="logo">
        <i class="bi bi-menu-button-wide-fill"></i>
        <div>Zimuk</div>
        <span>Tran</span>
      </a>
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

export default Header;
