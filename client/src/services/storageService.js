import { auth, db } from "../firebase/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import { uploadToCloudinary } from "./cloudinaryService";
import { addNotification } from "./notificationService";

export const uploadDocument = async (
  file,
  category = "General",
  onProgress = () => {}
) => {
  const user = auth.currentUser;

  if (!user) throw new Error("Please login first.");
  if (!file) throw new Error("Please select a file.");

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
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
    "video/quicktime"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type.");
  }

  const maxUploadBytes = Number(
    import.meta.env.VITE_MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024
  );

  if (file.size > maxUploadBytes) {
    throw new Error(
      `Maximum file size is ${Math.round(maxUploadBytes / 1024 / 1024)} MB.`
    );
  }

  onProgress(10);

  // Single-field query avoids a Firestore composite-index requirement.
  const duplicateQuery = query(
    collection(db, "documents"),
    where("uid", "==", user.uid)
  );
  const duplicateSnapshot = await getDocs(duplicateQuery);
  const duplicate = duplicateSnapshot.docs.some(
    (item) =>
      String(item.data()?.fileName || "")
        .trim()
        .toLowerCase() === file.name.trim().toLowerCase()
  );

  if (duplicate) throw new Error("File already exists.");

  onProgress(20);

  const cloudinary = await uploadToCloudinary(file, (progress) => {
    onProgress(20 + Math.floor(progress * 0.6));
  });

  onProgress(85);

  const documentData = {
    uid: user.uid,
    fileName: file.name,
    fileUrl: cloudinary.secure_url,
    publicId: cloudinary.public_id || "",
    category,
    fileType: file.type,
    size: file.size,
    favorite: false,
    format: cloudinary.format || "",
    resourceType: cloudinary.resource_type || "",
    storageProvider: "cloudinary",
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, "documents"), documentData);

  onProgress(100);

  try {
    await addNotification(`📤 ${file.name} uploaded successfully`);
  } catch (notificationError) {
    console.warn("Upload notification could not be created:", notificationError);
  }

  window.dispatchEvent(new Event("documentsUpdated"));
  window.dispatchEvent(new Event("notificationUpdated"));

  return {
    success: true,
    id: docRef.id,
    ...documentData
  };
};
