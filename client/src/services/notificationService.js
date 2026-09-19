import { auth, db } from "../firebase/firebase";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  getCountFromServer,
  onSnapshot,
} from "firebase/firestore";

/* =====================================================
   ADD NOTIFICATION
===================================================== */

export const addNotification = async (notification) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const message = typeof notification === "string"
      ? notification
      : notification?.message || notification?.title || "Notification";

    await addDoc(collection(db, "notifications"), {
      uid: user.uid,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });

    window.dispatchEvent(new Event("notificationUpdated"));
  } catch (error) {
    console.error("Notification Error:", error);
    throw error;
  }
};

/* =====================================================
   GET ALL NOTIFICATIONS
===================================================== */

export const getNotifications = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return [];

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((item) => ({
        id: item.id,
        ...item.data(),
      }))
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

  } catch (error) {
    console.error(error);
    return [];
  }
};

/* =====================================================
   GET RECENT NOTIFICATIONS
===================================================== */

export const getRecentNotifications = async () => {
  const notifications = await getNotifications();
  return notifications.slice(0, 5);
};

/* =====================================================
   GET UNREAD COUNT
===================================================== */

export const getNotificationCount = async () => {
  try {
    const user = auth.currentUser;

    if (!user) return 0;

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.filter((item) => item.data()?.read === false).length;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

/* =====================================================
   MARK SINGLE NOTIFICATION AS READ
===================================================== */

export const markNotificationAsRead = async (id) => {
  try {
    if (!id) return;

    await updateDoc(doc(db, "notifications", id), {
      read: true,
    });

    window.dispatchEvent(new Event("notificationUpdated"));
  } catch (error) {
    console.error("markNotificationAsRead:", error);
    throw error;
  }
};

// Backward Compatibility
export const markNotificationRead = markNotificationAsRead;
export const markAsRead = markNotificationAsRead;
/* =====================================================
   MARK ALL NOTIFICATIONS AS READ
===================================================== */

export const markAllNotificationsAsRead = async () => {
  try {
    const notifications = await getNotifications();

    await Promise.all(
      notifications.map((item) =>
        updateDoc(doc(db, "notifications", item.id), {
          read: true,
        })
      )
    );

    window.dispatchEvent(new Event("notificationUpdated"));
  } catch (error) {
    console.error("markAllNotificationsAsRead:", error);
    throw error;
  }
};

// Backward Compatibility
export const markAllNotificationsRead = markAllNotificationsAsRead;

/* =====================================================
   DELETE SINGLE NOTIFICATION
===================================================== */

export const deleteNotification = async (id) => {
  try {
    if (!id) return;

    await deleteDoc(doc(db, "notifications", id));

    window.dispatchEvent(new Event("notificationUpdated"));
  } catch (error) {
    console.error("deleteNotification:", error);
    throw error;
  }
};

/* =====================================================
   CLEAR ALL NOTIFICATIONS
===================================================== */

export const clearAllNotifications = async () => {
  try {
    const notifications = await getNotifications();

    await Promise.all(
      notifications.map((item) =>
        deleteDoc(doc(db, "notifications", item.id))
      )
    );

    window.dispatchEvent(new Event("notificationUpdated"));
  } catch (error) {
    console.error("clearAllNotifications:", error);
    throw error;
  }
};

// Backward Compatibility
export const clearNotifications = clearAllNotifications;

/* =====================================================
   REALTIME SUBSCRIBE
===================================================== */

export const subscribeNotifications = (callback) => {
  const user = auth.currentUser;

  if (!user) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "notifications"),
    where("uid", "==", user.uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

      callback(notifications);
    },
    (error) => {
      console.error("Notification Listener Error:", error);
      callback([]);
    }
  );
};
/* =====================================================
   ADMIN NOTIFICATION
===================================================== */

export const createAdminNotification = async (uid, message, recipient = {}) => {
  if (!uid || !String(message || "").trim()) throw new Error("Recipient and message are required.");
  const sender = auth.currentUser;
  await addDoc(collection(db, "notifications"), {
    uid,
    message: String(message).trim(),
    title: "Admin Notification",
    read: false,
    createdAt: serverTimestamp(),
    source: "admin",
    senderName: sender?.displayName || "Digital Vault Admin",
    senderEmail: sender?.email || "",
    recipientName: recipient?.name || "",
    recipientEmail: recipient?.email || "",
  });
};

/* =====================================================
   DEFAULT EXPORT
===================================================== */

const notificationService = {
  addNotification,
  getNotifications,
  getRecentNotifications,
  getNotificationCount,

  markNotificationAsRead,
  markNotificationRead,
  markAsRead,

  markAllNotificationsAsRead,
  markAllNotificationsRead,

  deleteNotification,
  clearAllNotifications,
  clearNotifications,

  subscribeNotifications,
  createAdminNotification,
};

export default notificationService;