import { auth, db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  getNotificationCount
} from "./notificationService";

/* ==========================================
   TOTAL STORAGE (5 GB)
========================================== */

export const TOTAL_STORAGE =
  5 * 1024 * 1024 * 1024;

/* ==========================================
   FORMAT STORAGE
========================================== */

export const formatStorage = (bytes = 0) => {

  if (bytes === 0) return "0 B";

  const sizes = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ];

  const i = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return (
    (bytes / Math.pow(1024, i)).toFixed(2) +
    " " +
    sizes[i]
  );

};

export const formatBytes = formatStorage;

/* ==========================================
   STORAGE CALCULATOR
========================================== */

const getDocumentType = (doc = {}) => {
  const raw = String(
    doc.fileType || doc.mimeType || doc.type || doc.fileName || doc.name || ""
  ).toLowerCase();
  const name = String(doc.fileName || doc.name || "").toLowerCase();

  if (raw.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (raw.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)$/.test(name)) return "Images";
  if (raw.includes("video") || /\.(mp4|mov|avi|mkv|webm|m4v)$/.test(name)) return "Videos";
  if (raw.includes("audio") || /\.(mp3|wav|aac|m4a|ogg|flac)$/.test(name)) return "Audio";
  if (raw.includes("word") || raw.includes("document") || /\.(doc|docx|odt|rtf|txt)$/.test(name)) return "Documents";
  if (raw.includes("sheet") || raw.includes("excel") || /\.(xls|xlsx|csv|ods)$/.test(name)) return "Spreadsheets";
  if (raw.includes("presentation") || raw.includes("powerpoint") || /\.(ppt|pptx|odp)$/.test(name)) return "Presentations";
  if (raw.includes("zip") || raw.includes("archive") || /\.(zip|rar|7z|tar|gz)$/.test(name)) return "Archives";
  return "Other";
};

export const calculateStorage = (documents = []) => {
  const safeDocuments = Array.isArray(documents) ? documents : [];
  const storageUsed = safeDocuments.reduce(
    (sum, doc) => sum + Math.max(0, Number(doc.size) || 0),
    0
  );

  const storageRemaining = Math.max(0, TOTAL_STORAGE - storageUsed);
  const storagePercent = Math.min(100, Math.max(0, (storageUsed / TOTAL_STORAGE) * 100));

  const typeMap = {};
  const categoryMap = {};
  safeDocuments.forEach((doc) => {
    const size = Math.max(0, Number(doc.size) || 0);
    const type = getDocumentType(doc);
    const category = String(doc.category || "General").trim() || "General";
    typeMap[type] = (typeMap[type] || 0) + size;
    categoryMap[category] = (categoryMap[category] || 0) + size;
  });

  const storageBreakdown = Object.entries(typeMap)
    .map(([name, bytes]) => ({ name, bytes, formatted: formatStorage(bytes) }))
    .sort((a, b) => b.bytes - a.bytes);

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, bytes]) => ({ name, bytes, formatted: formatStorage(bytes) }))
    .sort((a, b) => b.bytes - a.bytes);

  const largestFiles = safeDocuments
    .map((doc) => ({
      id: doc.id,
      name: doc.fileName || doc.name || "Untitled file",
      size: Math.max(0, Number(doc.size) || 0),
      formatted: formatStorage(Math.max(0, Number(doc.size) || 0)),
      type: getDocumentType(doc),
      url: doc.url || "",
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);

  return {
    storageUsed,
    storageRemaining,
    storagePercent,
    formattedStorage: formatStorage(storageUsed),
    formattedRemaining: formatStorage(storageRemaining),
    storageBreakdown,
    categoryBreakdown,
    largestFiles,
    fileCount: safeDocuments.length,
  };
};

/* ==========================================
   DASHBOARD STATS
========================================== */

export const getDashboardStats = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {

      return {

        totalDocuments: 0,

        favoriteDocuments: 0,

        recentDocuments: [],

        notificationCount: 0,

        pdfCount: 0,

        imageCount: 0,

        wordCount: 0,

        categories: {},

        storageUsed: 0,

        storageRemaining: TOTAL_STORAGE,

        storagePercent: 0,

        formattedStorage: "0 B",

        formattedRemaining: formatStorage(
          TOTAL_STORAGE
        )

      };

    }

    /* ==========================
       GET DOCUMENTS
    ========================== */

    const documentsQuery = query(

      collection(db, "documents"),

      where("uid", "==", user.uid)

    );

    const documentsSnapshot =
      await getDocs(documentsQuery);

    const documents =
      documentsSnapshot.docs.map((doc) => ({

        id: doc.id,

        ...doc.data()

      }));

    /* ==========================
       RECENT DOCUMENTS
       Reuse the already-fetched snapshot instead of issuing a
       second Firestore query. This keeps dashboard refreshes fast.
    ========================== */

    const recentDocuments = [...documents]
      .sort((a, b) => {
        const av = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bv = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bv - av;
      })
      .slice(0, 5);

    /* ==========================
       FAVORITES
    ========================== */

    const favoriteDocuments =
      documents.filter(
        (doc) => doc.favorite
      ).length;

    /* ==========================
       STORAGE
    ========================== */

    const storage =
      calculateStorage(documents);

    /* ==========================
       NOTIFICATION COUNT
    ========================== */

    const notificationCount =
      await getNotificationCount();

    /* ==========================
       FILE TYPES
    ========================== */

    const pdfCount =
      documents.filter((doc) =>
        doc.fileType?.includes("pdf")
      ).length;

    const imageCount =
      documents.filter((doc) =>
        doc.fileType?.includes("image")
      ).length;

    const wordCount =
      documents.filter(
        (doc) =>
          doc.fileType?.includes("word") ||
          doc.fileType?.includes("document")
      ).length;

    /* ==========================
       CATEGORIES
    ========================== */

    const categories = {};

    documents.forEach((doc) => {

      const name =
        doc.category || "General";

      categories[name] =
        (categories[name] || 0) + 1;

    });

    /* ==========================
       RETURN
    ========================== */

    return {
    totalDocuments: documents.length,

    favoriteDocuments,

    recentDocuments,

    categories,

    categoryStats: categories,

    documents,

    notificationCount,

    pdfCount,

    imageCount,

    wordCount,

    storageUsed: storage.storageUsed,

    storageRemaining: storage.storageRemaining,

    storagePercent: storage.storagePercent,

    storageBreakdown: storage.storageBreakdown,

    categoryBreakdown: storage.categoryBreakdown,

    largestFiles: storage.largestFiles,

    fileCount: storage.fileCount,

    formattedStorage: storage.formattedStorage,

    formattedRemaining: storage.formattedRemaining,

    storageColor:
        storage.storagePercent > 90
            ? "#ef4444"
            : storage.storagePercent > 70
            ? "#f59e0b"
            : "#22c55e",

    storageHealth:
        storage.storagePercent > 90
            ? "Critical"

            : storage.storagePercent > 70

            ? "Warning"

            : "Healthy",

    fileTypes: {
        PDF: pdfCount,
        Images: imageCount,
        Word: wordCount
    },

    weeklyUploads: [0,0,0,0,0,0,0],

    monthlyUploads: [0,0,0,0,0,0,0,0,0,0,0,0],

    recentActivity:[]
};

  }

    catch (error) {
    console.error("Dashboard Error:", error);

    return {
      totalDocuments: 0,
      favoriteDocuments: 0,
      recentDocuments: [],
      notificationCount: 0,
      pdfCount: 0,
      imageCount: 0,
      wordCount: 0,
      categories: {},
      storageUsed: 0,
      storageRemaining: TOTAL_STORAGE,
      storagePercent: 0,
      formattedStorage: "0 B",
      formattedRemaining: formatStorage(TOTAL_STORAGE),
      storageBreakdown: [],
      categoryBreakdown: [],
      largestFiles: [],
      fileCount: 0,
      storageHealth: "Healthy",
      storageColor: "#22c55e",
      fileTypes: {},
      categoryStats: {},
      documents: [],
      weeklyUploads: [0,0,0,0,0,0,0],
      monthlyUploads: [0,0,0,0,0,0,0,0,0,0,0,0],
      recentActivity: []
    };
  }
};