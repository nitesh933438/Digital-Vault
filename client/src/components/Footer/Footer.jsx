import "./Footer.css";
import { Link } from "react-router-dom";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Left */}

        <div className="footer-section">

          <h2 className="footer-brand"><img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" /><span>Digital Vault</span></h2>

          <p>
            Secure cloud based document management system
            for storing Aadhaar, PAN, Certificates,
            Resume and all important files safely.
          </p>

        </div>

        {/* Quick Links */}

        <div className="footer-section">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>

          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>

          <Link to="/dashboard">Dashboard</Link>

        </div>

        {/* Support */}

        <div className="footer-section">

          <h3>Support</h3>

          <Link to="/documents">Documents</Link>

          <Link to="/favorites">Favorites</Link>

          <Link to="/profile">Profile</Link>

          <Link to="/settings">Settings</Link>

<Link to="/privacy">

Privacy Policy

</Link>

<Link to="/terms">

Terms & Conditions

</Link>

        </div>

        {/* Contact */}

        <div className="footer-section">

          <h3>Contact</h3>

<p>
  <FaEnvelope />
  nitesh933438@gmail.com
</p>

<p>
  <FaPhoneAlt />
  +91 9334387983
</p>

<p>
  <FaMapMarkerAlt />
  Patna, Bihar, India
</p>

        </div>

      </div>

      {/* Social */}

<div className="footer-social">

  <a
    href="https://www.facebook.com/share/1BfEnT1HRq/"
    target="_blank"
    rel="noopener noreferrer"
    title="Facebook"
  >
    <FaFacebook />
  </a>

  <a
    href="https://www.instagram.com/i._am_nitesh_?igsh=azN4OWx0eDZjOGNh"
    target="_blank"
    rel="noopener noreferrer"
    title="Instagram"
  >
    <FaInstagram />
  </a>

  <a
    href="https://www.linkedin.com/in/nitesh-kumar-3b7b4b382?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    target="_blank"
    rel="noopener noreferrer"
    title="LinkedIn"
  >
    <FaLinkedin />
  </a>

  <a
    href="https://github.com/nitesh933438"
    target="_blank"
    rel="noopener noreferrer"
    title="GitHub"
  >
    <FaGithub />
  </a>

</div>

      {/* Copyright */}

      <div className="footer-bottom">

  <div>
    © {new Date().getFullYear()} Digital Vault |
    Designed & Developed with ❤️ by <strong>Nitesh Kumar</strong>
  </div>

  <span className="footer-version" title="Application version">
    v{__APP_VERSION__}
  </span>

</div>

    </footer>
  );
}

export default Footer;