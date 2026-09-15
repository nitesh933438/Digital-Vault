const cloudinary = require("../config/cloudinary");

const sanitizeSegment = (value = "") => value.replace(/[^a-zA-Z0-9_-]/g, "");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.files?.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const file = req.files.file;
    const maxBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024);
    const allowedTypes = new Set([
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/zip",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Unsupported file type." });
    }

    if (file.size > maxBytes) {
      return res.status(413).json({ success: false, message: "Maximum file size is 25 MB." });
    }

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
    console.error("Upload Error:", error);
    return res.status(500).json({ success: false, message: "Upload failed. Please try again." });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType = "image" } = req.body || {};
    const uid = sanitizeSegment(req.user.uid);
    const allowedPrefix = `Digital-Vault/${uid}/`;

    if (!publicId || typeof publicId !== "string") {
      return res.status(400).json({ success: false, message: "publicId is required." });
    }

    if (!publicId.startsWith(allowedPrefix)) {
      return res.status(403).json({ success: false, message: "You cannot delete this file." });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, message: "Delete failed. Please try again." });
  }
};


exports.adminDeleteFile = async (req, res) => {
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
    console.error("Admin delete error:", error);
    return res.status(500).json({ success: false, message: "Admin delete failed." });
  }
};
