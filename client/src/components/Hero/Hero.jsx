import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero" id="home">

      <div className="hero-left">

        <h1>
          Store Your Important Documents Securely
        </h1>

<div className="hero-badge">
  <span>🔒</span>
  <div>
    <h4>100% Secure</h4>
    <p>Storage</p>
  </div>
</div>

        <p>
          Upload, manage, preview and download your important documents anytime from anywhere.
        </p>

        <div className="hero-buttons">

          <Link to="/register">
            <button className="primary-btn">
              Get Started
            </button>
          </Link>

          <a href="#features">
            <button className="secondary-btn">
              Learn More
            </button>
          </a>

        </div>

      </div>

      <div className="hero-right">

        <div className="vault-card">

          <div className="doc">📄 Aadhaar Card</div>
          <div className="doc">🪪 PAN Card</div>
          <div className="doc">🎓 Marksheet</div>
          <div className="doc">📁 Resume.pdf</div>
          <div className="doc">📷 Passport Photo</div>

        </div>

      </div>

    </section>
  );
}

export default Hero;