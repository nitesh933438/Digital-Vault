import "./QuickActions.css";

import { Link } from "react-router-dom";

import {
  FaCloudUploadAlt,
  FaFolderOpen,
  FaStar,
  FaUser,
  FaCog,
  FaRobot
} from "react-icons/fa";

const actions = [
  {
    title: "Upload",
    desc: "Upload Documents",
    icon: <FaCloudUploadAlt />,
    color: "#2563eb",
    path: "/documents"
  },
  {
    title: "Documents",
    desc: "My Files",
    icon: <FaFolderOpen />,
    color: "#16a34a",
    path: "/documents"
  },
  {
    title: "Favorites",
    desc: "Saved Files",
    icon: <FaStar />,
    color: "#f59e0b",
    path: "/favorites"
  },
  {
    title: "Profile",
    desc: "My Account",
    icon: <FaUser />,
    color: "#8b5cf6",
    path: "/profile"
  },
  {
    title: "Settings",
    desc: "Preferences",
    icon: <FaCog />,
    color: "#ef4444",
    path: "/settings"
  },
  {
    title: "AI Assistant",
    desc: "Smart Search",
    icon: <FaRobot />,
    color: "#06b6d4",
    path: "/dashboard?assistant=1"
  }
];

function QuickActions() {

  return (

    <section className="quick-actions">

      <div className="quick-header">

        <div>

          <span className="quick-tag">

            ⚡ Quick Access

          </span>

          <h2>

            Quick Actions

          </h2>

          <p>

            Access your most-used features instantly.

          </p>

        </div>

      </div>

      <div className="quick-grid">

        {

          actions.map((item,index)=>(

            <Link

              key={index}

              to={item.path}

              className="quick-card"

            >

              <div

                className="quick-icon"

                style={{

                  background:item.color

                }}

              >

                {item.icon}

              </div>

              <h3>

                {item.title}

              </h3>

              <p>

                {item.desc}

              </p>

            </Link>

          ))

        }

      </div>

    </section>

  );

}

export default QuickActions;