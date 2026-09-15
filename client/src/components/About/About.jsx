import "./About.css";
import { Link } from "react-router-dom";

function About() {

  return (

    <section className="about" id="about">

      <div className="about-left">

        <span className="about-tag">
          ABOUT DIGITAL VAULT
        </span>

        <h2>
          Keep Every Important Document Safe In One Place
        </h2>

        <p>

          Digital Vault is a secure cloud-based document management
          platform where you can upload, organize, preview and access
          your important files anytime from anywhere.

        </p>

        <div className="about-list">

          <div>✅ End-to-End Secure Storage</div>

          <div>✅ Fast Document Search</div>

          <div>✅ Cloud Backup</div>

          <div>✅ File Preview & Download</div>

          <div>✅ Favorite Documents</div>

          <div>✅ Mobile Friendly Dashboard</div>

        </div>

        <Link to="/register">

          <button className="about-btn">
            Start Free →
          </button>

        </Link>

      </div>

      <div className="about-right">

        <div className="about-card">

          <div className="about-item">
            📁 Documents
          </div>

          <div className="about-item">
            ☁ Secure Cloud
          </div>

          <div className="about-item">
            🔒 Encrypted Storage
          </div>

          <div className="about-item">
            ⚡ Instant Access
          </div>

          <div className="about-item">
            ❤️ Favorites
          </div>

        </div>

      </div>

    </section>

  );

}

export default About;