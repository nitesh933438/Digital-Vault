const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = clientOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin is not allowed."));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.resolve(__dirname, "tmp"),
  createParentPath: true,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024) },
  abortOnLimit: true,
}));

app.get("/api/health", (_req, res) => res.json({ success: true, service: "Digital Vault API", status: "ok" }));
app.use("/api/cloudinary", require("./routes/cloudinaryRoutes"));

const clientDist = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: "1h", index: "index.html" }));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

app.get("/", (_req, res) => {
  if (fs.existsSync(clientDist)) return res.sendFile(path.join(clientDist, "index.html"));
  return res.json({ success: true, message: "Digital Vault API is running." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  const status = err?.statusCode || 500;
  res.status(status).json({ success: false, message: err?.message || "Internal server error." });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`🚀 Digital Vault server running on port ${PORT}`));
