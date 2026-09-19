import "./DashboardHero.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  FaRobot,
  FaCloudUploadAlt,
  FaFolderOpen,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
  FaClock,
  FaCloud,
  FaStar,
  FaDatabase
} from "react-icons/fa";

function DashboardHero({ stats }) {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [time, setTime] = useState(new Date());

  useEffect(() => {

    const interval = setInterval(() => {

      setTime(new Date());

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const hour = time.getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {

    greeting = "Good Morning ☀️";

  }

  else if (hour < 17) {

    greeting = "Good Afternoon 🌤";

  }

  const storage = Number(stats?.storagePercent || 0);

const documents = Number(stats?.totalDocuments || 0);

const folders = Object.keys(stats?.categories || {}).length;

const favorites = Number(stats?.favoriteDocuments || 0);

    return (

    <section className="dashboardHero">

      <div className="hero-content">

        <div className="hero-badge">

          <FaRobot />

          <span>

            AI Powered Secure Digital Vault

          </span>

        </div>

        <h1>

          {greeting}

          <br />

          <span>

            {user?.displayName || "User"}

          </span>

        </h1>

        <p>

          Securely manage, organize and access your important
          documents anywhere with Cloudinary Cloud Storage,
          Firebase Security and AI Powered Search.

        </p>

        <div className="hero-buttons">

          <button

            className="heroPrimary"

            onClick={() => navigate("/documents")}

          >

            <FaCloudUploadAlt />

            Upload Document

          </button>

          <button

            className="heroSecondary"

            onClick={() => navigate("/documents")}

          >

            Explore

            <FaArrowRight />

          </button>

        </div>

        <div className="hero-mini-cards">

          <div className="mini-card">

            <FaFolderOpen />

            <div>

              <h3>

                {documents}

              </h3>

              <span>

                Documents

              </span>

            </div>

          </div>

          <div className="mini-card">

            <FaStar />

            <div>

              <h3>

                {favorites}

              </h3>

              <span>

                Favorites

              </span>

            </div>

          </div>

          <div className="mini-card">

            <FaShieldAlt />

            <div>

              <h3>

                100%

              </h3>

              <span>

                Secure

              </span>

            </div>

          </div>

        </div>

      </div>

            {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div className="hero-side">

        <div
          className="glass-card storage-glass-clickable"
          role="button"
          tabIndex={0}
          aria-label="Open storage details"
          onClick={() => window.dispatchEvent(new Event("openStorageDetails"))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.dispatchEvent(new Event("openStorageDetails"));
            }
          }}
        >

          <div className="glass-header">

            <div>

              <h3>

                Cloud Storage

              </h3>

              <p>

                Cloudinary Secure Storage

              </p>

            </div>

            <FaCloud />

          </div>

          <h2>
    {Number(storage).toFixed(2)}%
</h2>

          <div className="progress">

            <div
    className="progress-fill"
    style={{
        width: `${Math.min(storage,100)}%`
    }}
></div>

          </div>

          <div className="glass-stats">

            <div>

              <FaFolderOpen />

              <h4>
    {folders}
</h4>

              <span>

                Categories

              </span>

            </div>

            <div>

              <FaDatabase />

              <h4>

                {stats?.formattedStorage || "0 B"}

              </h4>

              <span>

                Used

              </span>

            </div>

            <div>

              <FaChartLine />

              <h4>
    {stats?.storageHealth ?? "Healthy"}
</h4>

              <span>

                Health

              </span>

            </div>

          </div>

          <div className="clock-box">

            <FaClock />

            <div>

              <h4>

                {time.toLocaleTimeString()}

              </h4>

              <span>

                {time.toDateString()}

              </span>

            </div>

          </div>

        </div>

      </div>

            {/* ==========================================
          FLOATING ELEMENTS
      ========================================== */}

      <div className="floating one"></div>

      <div className="floating two"></div>

      <div className="floating three"></div>

    </section>

  );

}

export default DashboardHero;