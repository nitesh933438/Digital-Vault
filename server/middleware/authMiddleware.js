const jwt = require("jsonwebtoken");

const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certCache = { certs: null, expiresAt: 0 };

async function getGoogleCerts() {
  const now = Date.now();
  if (certCache.certs && certCache.expiresAt > now) return certCache.certs;

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error("Unable to fetch Firebase signing certificates.");

  const certs = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 3600);
  certCache = { certs, expiresAt: now + maxAge * 1000 };
  return certs;
}

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      return res.status(500).json({ success: false, message: "Firebase server configuration is missing." });
    }

    const decodedHeader = jwt.decode(token, { complete: true });
    const kid = decodedHeader?.header?.kid;
    const certs = await getGoogleCerts();
    const publicKey = certs[kid];

    if (!publicKey) {
      return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    if (decoded.auth_time > Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired authentication token." });
  }
};

module.exports = { requireAuth };
