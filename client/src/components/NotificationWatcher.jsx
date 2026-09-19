import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { subscribeNotifications } from "../services/notificationService";

/**
 * Keeps notification feedback available on every protected route.
 * The first snapshot is treated as the baseline; only later additions
 * create a toast so opening the app never spams old notifications.
 */
function NotificationWatcher() {
  const { user } = useAuth();
  const knownIds = useRef(new Set());
  const initializedFor = useRef(null);

  useEffect(() => {
    knownIds.current = new Set();
    initializedFor.current = null;

    if (!user?.uid) return undefined;

    const unsubscribe = subscribeNotifications((items) => {
      const list = items || [];
      const firstSnapshot = initializedFor.current !== user.uid;

      if (firstSnapshot) {
        list.forEach((item) => knownIds.current.add(item.id));
        initializedFor.current = user.uid;
        return;
      }

      const fresh = list.filter((item) => !knownIds.current.has(item.id));
      fresh.slice(0, 2).forEach((item) => {
        toast(item.message || "You have a new notification.", {
          icon: "🔔",
          duration: 4500,
        });
      });

      list.forEach((item) => knownIds.current.add(item.id));
    });

    return unsubscribe;
  }, [user?.uid]);

  return null;
}

export default NotificationWatcher;
