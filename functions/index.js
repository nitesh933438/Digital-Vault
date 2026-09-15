const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

admin.initializeApp();

const app = express();
const allowedOrigins = String(process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin is not allowed."));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/digital-vault",
  createParentPath: true,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024) },
  abortOnLimit: true,
}));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const sanitizeSegment = (value = "") => String(value).replace(/[^a-zA-Z0-9_-]/g, "");

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Authentication required." });
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    logger.error("Auth middleware error", error);
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token." });
  }
};

const allowedTypes = new Set([
  "application/pdf", "image/png", "image/jpeg", "image/webp", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/csv",
  "application/zip", "video/mp4", "video/webm", "video/quicktime",
]);

app.get("/api/health", (_req, res) => res.json({ success: true, service: "Digital Vault API", status: "ok" }));

app.post("/api/cloudinary/upload", requireAuth, async (req, res) => {
  try {
    if (!req.files?.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const file = req.files.file;
    const maxBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024);
    if (!allowedTypes.has(file.mimetype)) return res.status(400).json({ success: false, message: "Unsupported file type." });
    if (file.size > maxBytes) return res.status(413).json({ success: false, message: "Maximum file size is 25 MB." });

    const uid = sanitizeSegment(req.user.uid);
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `Digital-Vault/${uid}`,
      resource_type: "auto",
    });

    return res.status(200).json({
      success: true,
      file: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format,
        resource_type: result.resource_type,
      },
    });
  } catch (error) {
    logger.error("Upload error", error);
    return res.status(500).json({ success: false, message: "Upload failed. Please try again." });
  }
});

app.post("/api/cloudinary/delete", requireAuth, async (req, res) => {
  try {
    const { publicId, resourceType = "image" } = req.body || {};
    const uid = sanitizeSegment(req.user.uid);
    const allowedPrefix = `Digital-Vault/${uid}/`;
    if (!publicId || typeof publicId !== "string") return res.status(400).json({ success: false, message: "publicId is required." });
    if (!publicId.startsWith(allowedPrefix)) return res.status(403).json({ success: false, message: "You cannot delete this file." });
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error("Delete error", error);
    return res.status(500).json({ success: false, message: "Delete failed. Please try again." });
  }
});

app.post("/api/cloudinary/admin-delete", requireAuth, async (req, res) => {
  try {
    const email = String(req.user?.email || "").trim().toLowerCase();
    const provider = req.user?.firebase?.sign_in_provider;
    const verified = req.user?.email_verified === true;
    if (email !== "nitesh933438@gmail.com" || provider !== "google.com" || !verified) {
      return res.status(403).json({ success: false, message: "Primary administrator authorization required." });
    }
    const { publicId, resourceType = "image" } = req.body || {};
    if (!publicId || typeof publicId !== "string" || !publicId.startsWith("Digital-Vault/")) {
      return res.status(400).json({ success: false, message: "A valid Digital Vault publicId is required." });
    }
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
    return res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error("Admin delete error", error);
    return res.status(500).json({ success: false, message: "Admin delete failed." });
  }
});

app.use((err, _req, res, _next) => {
  logger.error("Unhandled function error", err);
  res.status(err?.statusCode || 500).json({ success: false, message: err?.message || "Internal server error." });
});

exports.backend = onRequest({ region: "us-central1", timeoutSeconds: 120, memory: "512MiB", maxInstances: 10 }, app);
