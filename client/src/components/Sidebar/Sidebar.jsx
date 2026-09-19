import { useState, useMemo, useEffect } from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import "./Sidebar.css";

import toast from "react-hot-toast";

import {
  FaHome,
  FaFolderOpen,
  FaStar,
  FaUser,
  FaCog,
  FaBell,
  FaCloud,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaUserShield
} from "react-icons/fa";

import { logoutUser } from "../../services/authService";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";

import {
  getDashboardStats
} from "../../services/dashboardService";

import {
  subscribeNotifications
} from "../../services/notificationService";

function Sidebar() {

  const navigate = useNavigate();

  const location = useLocation();

  const { user, isAdmin } = useAuth();

  const [open, setOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("dv-sidebar-collapsed") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("dv-sidebar-collapsed", String(collapsed)); } catch {}
  }, [collapsed]);

  // Always reset the drawer when moving between phone/tablet and desktop.
  // This prevents a mobile drawer state from leaking into another device mode.
  useEffect(() => {
    const closeDrawerOnDesktop = () => {
      if (window.innerWidth > 992) setOpen(false);
    };
    closeDrawerOnDesktop();
    window.addEventListener("resize", closeDrawerOnDesktop, { passive: true });
    window.addEventListener("orientationchange", closeDrawerOnDesktop, { passive: true });
    return () => {
      window.removeEventListener("resize", closeDrawerOnDesktop);
      window.removeEventListener("orientationchange", closeDrawerOnDesktop);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const [stats, setStats] = useState({

    storageUsed: 0,

    storageRemaining: 0,

    storagePercent: 0,

    formattedStorage: "0 B",

    formattedRemaining: "5 GB",

    notificationCount: 0

  });

  const [notificationCount, setNotificationCount] =
  useState(0);

  /* ===============================
   LOAD SIDEBAR DATA
=============================== */

const loadSidebar = async () => {

  try {

    const data = await getDashboardStats();

    if (data) {

      setStats(data);

    }

  }

  catch (error) {


  }

};

  /* ===============================
   REALTIME SIDEBAR REFRESH
=============================== */

useEffect(() => {

  loadSidebar();

  const refreshSidebar = () => {

    loadSidebar();

  };

  window.addEventListener(
    "documentsUpdated",
    refreshSidebar
  );

  window.addEventListener(
    "notificationUpdated",
    refreshSidebar
  );

  return () => {

    window.removeEventListener(
      "documentsUpdated",
      refreshSidebar
    );

    window.removeEventListener(
      "notificationUpdated",
      refreshSidebar
    );

  };

}, []);

  /* ===============================
   REALTIME NOTIFICATIONS
=============================== */

useEffect(() => {

  const unsubscribe =
    subscribeNotifications((notifications) => {

      const unread =
        notifications.filter(
          (item) => !item.read
        ).length;

      setNotificationCount(unread);

    });

  return () => {

    if (unsubscribe) {

      unsubscribe();

    }

  };

}, []);

    const [avatar, setAvatar] = useState(() => user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "User")}&background=2563eb&color=ffffff&size=256`);

  useEffect(() => {
    const refreshAvatar = () => {
      const current = auth.currentUser;
      setAvatar(current?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(current?.displayName || user?.displayName || "User")}&background=2563eb&color=ffffff&size=256`);
    };
    refreshAvatar();
    window.addEventListener("profileUpdated", refreshAvatar);
    return () => window.removeEventListener("profileUpdated", refreshAvatar);
  }, [user?.displayName]);

    const menus = [

    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard"
    },

    {
      title: "Documents",
      icon: <FaFolderOpen />,
      path: "/documents"
    },

    {
      title: "Favorites",
      icon: <FaStar />,
      path: "/favorites"
    },

    {
      title: "Profile",
      icon: <FaUser />,
      path: "/profile"
    },

    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings"
    },
    ...(isAdmin ? [{ title: "Admin Panel", icon: <FaUserShield />, path: "/admin" }] : [])

  ];

  const storagePercent =
stats.storagePercent;

const storageUsed =
stats.formattedStorage;

const storageRemaining =
stats.formattedRemaining;

const handleLogout = async () => {

  try {

    await logoutUser();

    toast.success(
      "Logged out successfully"
    );

    navigate("/login");

  }

  catch (err) {

    toast.error(err.message);

  }

};

return (
  <>

    {/* ===========================
        MOBILE MENU BUTTON
    =========================== */}

    <button
      className="dv-sidebar-menu-btn"
      onClick={() => setOpen((value) => !value)}
      aria-label={open ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={open}
      type="button"
    >
      {
        open
          ? <FaTimes />
          : <FaBars />
      }
    </button>

    {/* ===========================
        OVERLAY
    =========================== */}

    {
      open &&

      <div
        className="dv-sidebar-overlay"
        onClick={() => setOpen(false)}
      />

    }

    {/* ===========================
        SIDEBAR
    =========================== */}

    <aside

      className={`
        dv-sidebar
        ${open ? "open" : ""}
        ${collapsed ? "collapsed" : ""}
      `}

    >

      {/* ===========================
          HEADER
      =========================== */}

      <div className="dv-sidebar-header">

        <div className="dv-sidebar-logo">

          <div className="dv-sidebar-logo-icon">
            <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="" aria-hidden="true" />
          </div>

          {

            !collapsed &&

            <div className="dv-sidebar-logo-text">

              <h2 aria-label="Digital Vault">
                <span>Digital</span>
                <span>Vault</span>
              </h2>

              <p>
                Secure Cloud Storage
              </p>

            </div>

          }

        </div>

        <button

          className="dv-sidebar-collapse"

          onClick={() =>
            setCollapsed(!collapsed)
          }

        >

          {

            collapsed

              ? <FaChevronRight />

              : <FaChevronLeft />

          }

        </button>

      </div>

      {/* ===========================
          NAVIGATION
      =========================== */}

      <nav className="dv-sidebar-nav">

        {

          menus.map((menu) => (

            <Link

              key={menu.path}

              to={menu.path}

              onClick={() => setOpen(false)}

              className={`dv-sidebar-link ${
                location.pathname === menu.path
                  ? "active"
                  : ""
              }`}

            >

              <div className="dv-sidebar-icon">

                {menu.icon}

              </div>

              {

                !collapsed &&

                <span>

                  {menu.title}

                </span>

              }

            </Link>

          ))

        }

      </nav>

      {/* ===========================
          REAL STORAGE CARD
      =========================== */}

      {

        !collapsed &&

        <div
          className="dv-storage-card dv-storage-card-clickable"
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

          <div className="dv-storage-top">

            <div className="dv-storage-title">

              <FaCloud />

              <span>

                Cloud Storage

              </span>

            </div>

            <strong>

              {stats.storagePercent.toFixed(1)}%

            </strong>

          </div>

          <div className="dv-storage-progress">

            <div

              className="dv-storage-progress-fill"

              style={{

                width: `${stats.storagePercent}%`

              }}

            />

          </div>

          <p>

            {stats.formattedStorage}

            {" / "}

            {stats.formattedRemaining}

          </p>

        </div>

      }

      {/* ===========================
          FOOTER
      =========================== */}

      <div className="dv-sidebar-footer">

        <button
          className="dv-install-sidebar-btn"
          onClick={() => {
            setOpen(false);
            window.dispatchEvent(new Event("dv:show-install"));
          }}
          title="Install App"
        >
          <FaCloud />
          {!collapsed && <span>Install App</span>}
        </button>

        <button
          className="dv-notification-btn"
          onClick={() => {
            setOpen(false);
            navigate("/notifications");
          }}
          aria-label="Open notifications"
          title={collapsed ? "Notifications" : undefined}
        >
          <div className="left">
            <FaBell />
            {!collapsed && <span>Notifications</span>}
          </div>
          {notificationCount > 0 && (
            <div className="badge">{notificationCount}</div>
          )}
        </button>

        <button

          className="dv-logout-btn"

          onClick={handleLogout}

        >

          <FaSignOutAlt />

          {

            !collapsed &&

            <span>

              Logout

            </span>

          }

        </button>

      </div>

    </aside>

  </>

);

}

export default Sidebar;