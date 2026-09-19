import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import "./Notifications.css";
import BackButton from "../../components/BackButton/BackButton";

import {
  subscribeNotifications,
  clearAllNotifications,
  deleteNotification,
  markAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

import {
  FaBell,
  FaTrashAlt,
  FaCheckCircle,
  FaRegBell,
  FaSearch,
  FaFilter,
  FaCheckDouble,
} from "react-icons/fa";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* =====================================
        REALTIME NOTIFICATIONS
  ===================================== */

  useEffect(() => {
    const unsubscribe = subscribeNotifications((data) => {
      setNotifications(data || []);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* =====================================
        FILTERED DATA
  ===================================== */

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];

    if (filter === "read") {
      data = data.filter((item) => item.read);
    }

    if (filter === "unread") {
      data = data.filter((item) => !item.read);
    }

    if (search.trim()) {
      data = data.filter((item) =>
        item.message
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return data;
  }, [notifications, search, filter]);

  /* =====================================
        MARK AS READ
  ===================================== */

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* =====================================
        MARK ALL
  ===================================== */

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* =====================================
        DELETE
  ===================================== */

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* =====================================
        CLEAR ALL
  ===================================== */

  const handleClear = async () => {
    try {
      await clearAllNotifications();
      toast.success("All notifications cleared");
    } catch (err) {
      toast.error(err.message);
    }
  };

    /* =====================================
        LOADING
  ===================================== */

  if (loading) {
    return (
      <div className="notifications-page">

      <div className="page-back-row"><BackButton label="Back to Dashboard" /></div>
        <div className="loading-box">
          <FaBell className="loading-icon" />
          <h2>Loading Notifications...</h2>
          <p>Please wait while we fetch your latest notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">

      <div className="page-back-row"><BackButton label="Back to Dashboard" /></div>

      {/* ===========================
            HEADER
      ============================ */}

      <div className="notifications-header">

        <div>
          <h1>
            <FaBell />
            {" "}Notifications
          </h1>

          <p>
            View and manage all your recent activities.
          </p>
        </div>

        <div className="header-buttons">

          <button
            className="mark-btn"
            onClick={handleMarkAll}
          >
            <FaCheckDouble />
            Mark All Read
          </button>

          <button
            className="clear-btn"
            onClick={handleClear}
          >
            <FaTrashAlt />
            Clear All
          </button>

        </div>

      </div>

      {/* ===========================
            SEARCH + FILTER
      ============================ */}

      <div className="notification-toolbar">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="filter-box">

          <FaFilter />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option value="all">
              All
            </option>

            <option value="read">
              Read
            </option>

            <option value="unread">
              Unread
            </option>

          </select>

        </div>

      </div>

      {/* ===========================
            EMPTY STATE
      ============================ */}

      {filteredNotifications.length === 0 ? (
        <div className="empty-notification">

          <FaRegBell className="empty-icon" />

          <h2>No Notifications</h2>

          <p>
            No notifications found.
          </p>

        </div>
      ) : (

        <div className="notification-list">

          <AnimatePresence>

            {filteredNotifications.map((item) => (

                            <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`notification-card ${
                  item.read ? "read" : "unread"
                }`}
              >
                <div className="notification-left">
                  <FaBell className="bell-icon" />
                </div>

                <div className="notification-center">
                  <div className="notification-title-row"><h4>{item.title || "Notification"}</h4><span className="notification-source">{item.source === "admin" ? "Admin" : "System"}</span></div>
                  <p className="notification-message">{item.message}</p>
                  {item.source === "admin" && <small className="notification-sender">From: {item.senderName || "Digital Vault Admin"}{item.senderEmail ? ` • ${item.senderEmail}` : ""}</small>}

                  <small>
                    {item.createdAt?.toDate
                      ? item.createdAt
                          .toDate()
                          .toLocaleString()
                      : "Just now"}
                  </small>

                  <div className="status-row">
                    <span
                      className={
                        item.read
                          ? "status read-status"
                          : "status unread-status"
                      }
                    >
                      {item.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>

                <div className="notification-actions">
                  {!item.read && (
                    <button
                      className="read-btn"
                      onClick={() => handleRead(item.id)}
                      title="Mark as Read"
                    >
                      <FaCheckCircle />
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                    title="Delete Notification"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </motion.div>
            ))}

          </AnimatePresence>

        </div>
      )}

    </div>
  );
}

export default Notifications;