const express = require("express");
const router = express.Router();

const { uploadFile, deleteFile, adminDeleteFile } = require("../controllers/cloudinaryController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/upload", requireAuth, uploadFile);
router.post("/delete", requireAuth, deleteFile);
router.post("/admin-delete", requireAuth, adminDeleteFile);

module.exports = router;
