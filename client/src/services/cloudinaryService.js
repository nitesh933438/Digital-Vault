import { auth } from "../firebase/firebase";

const CLOUDINARY_CLOUD_NAME = String(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ""
).trim();

const CLOUDINARY_UPLOAD_PRESET = String(
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ""
).trim();

const ensureCloudinaryConfig = () => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary cloud name is not configured.");
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary unsigned upload preset is not configured.");
  }
};

export const uploadToCloudinary = async (file, onProgress = () => {}) => {
  if (!file) throw new Error("No file selected.");

  const user = auth.currentUser;
  if (!user) throw new Error("Please login first.");

  ensureCloudinaryConfig();

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/auto/upload`;
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", `Digital-Vault/${user.uid}`);
  formData.append("context", `uid=${user.uid}`);

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.timeout = 120000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        data = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        onProgress(100);
        resolve(data);
        return;
      }

      const message =
        data?.error?.message ||
        `Cloudinary upload failed (${xhr.status}).`;
      const error = new Error(message);
      error.status = xhr.status;
      reject(error);
    };

    xhr.onerror = () => {
      reject(new TypeError("Network error while uploading to Cloudinary."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Cloudinary upload timed out."));
    };

    xhr.send(formData);
  });
};

// Firebase Spark/GitHub Pages cannot safely destroy Cloudinary assets because
// Cloudinary's destroy API requires the API secret. In the free architecture,
// document deletion removes only the Firestore metadata record.
export const deleteFromCloudinary = async () => ({
  success: true,
  skipped: true,
  message: "Cloudinary asset deletion is unavailable in the free client-only setup."
});

export const adminDeleteFromCloudinary = deleteFromCloudinary;
