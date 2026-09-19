import { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

function scrollToSection(id, closeMenu) {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  closeMenu?.();
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="logo" to="/" onClick={closeMenu} aria-label="Digital Vault home">
        <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" />
        <span>Digital Vault</span>
      </Link>

      <ul className="nav-links">
        <li><button onClick={() => scrollToSection("home")}>Home</button></li>
        <li><button onClick={() => scrollToSection("features")}>Features</button></li>
        <li><button onClick={() => scrollToSection("about")}>About</button></li>
        <li><button onClick={() => scrollToSection("contact")}>Contact</button></li>
      </ul>

      <div className="nav-buttons">
        <ThemeToggle />
        <Link to="/login"><button className="loginBtn">Login</button></Link>
        <Link to="/register"><button className="registerBtn">Register</button></Link>
      </div>

      <button
        className="mobile-menu"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
      </button>

      {menuOpen && (
        <div className="mobile-nav-panel">
          <button onClick={() => scrollToSection("home", closeMenu)}>Home</button>
          <button onClick={() => scrollToSection("features", closeMenu)}>Features</button>
          <button onClick={() => scrollToSection("about", closeMenu)}>About</button>
          <button onClick={() => scrollToSection("contact", closeMenu)}>Contact</button>
          <div className="mobile-nav-actions">
            <ThemeToggle />
            <Link to="/login" onClick={closeMenu}><button className="loginBtn">Login</button></Link>
            <Link to="/register" onClick={closeMenu}><button className="registerBtn">Register</button></Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
