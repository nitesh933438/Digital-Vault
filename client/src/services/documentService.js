import { db } from "../firebase/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { addNotification } from "./notificationService";

const notify = async (message) => {
  await addNotification(message);
  window.dispatchEvent(new Event("notificationUpdated"));
};

export const deleteDocument = async (document) => {
  if (!document?.id) throw new Error("Invalid document.");

  try {
    // Free client-only architecture: remove Firestore metadata.
    // The Cloudinary asset cannot be destroyed securely without exposing the API secret.
    await deleteDoc(doc(db, "documents", document.id));

    try {
      await notify(`🗑️ ${document.fileName || "Document"} removed from your vault`);
    } catch (notificationError) {
      console.warn("Delete notification could not be created:", notificationError);
    }

    window.dispatchEvent(new Event("documentsUpdated"));
    return { success: true, cloudinaryDeleted: false };
  } catch (error) {
    throw new Error(error.message || "Delete failed.");
  }
};

export const toggleFavorite = async (id, currentFavorite) => {
  if (!id) throw new Error("Invalid document.");

  try {
    const favorite = !currentFavorite;
    await updateDoc(doc(db, "documents", id), { favorite });
    try {
      await notify(favorite ? "⭐ Added to Favorites" : "❌ Removed from Favorites");
    } catch (notificationError) {
      console.warn("Favorite notification could not be created:", notificationError);
    }
    window.dispatchEvent(new Event("documentsUpdated"));
    return { success: true, favorite };
  } catch (error) {
    throw new Error(error.message || "Favorite update failed.");
  }
};

export const renameDocument = async (id, newName) => {
  const fileName = newName?.trim();
  if (!id || !fileName) throw new Error("File name required.");

  try {
    await updateDoc(doc(db, "documents", id), { fileName });
    try {
      await notify(`✏️ Renamed to ${fileName}`);
    } catch (notificationError) {
      console.warn("Rename notification could not be created:", notificationError);
    }
    window.dispatchEvent(new Event("documentsUpdated"));
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Rename failed.");
  }
};

export const updateCategory = async (id, category) => {
  if (!id || !category?.trim()) throw new Error("Category required.");

  try {
    await updateDoc(doc(db, "documents", id), { category: category.trim() });
    try {
      await notify(`📂 Category updated to ${category.trim()}`);
    } catch (notificationError) {
      console.warn("Category notification could not be created:", notificationError);
    }
    window.dispatchEvent(new Event("documentsUpdated"));
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Category update failed.");
  }
};

export const downloadDocument = async (document) => {
  const url = document?.fileUrl || document?.fileURL || document?.url;
  if (!url) throw new Error("File URL not found.");

  // Cloudinary's attachment flag makes downloads reliable even when the
  // browser ignores the HTML download attribute for a cross-origin URL.
  const downloadUrl = url.includes("/upload/")
    ? url.replace("/upload/", "/upload/fl_attachment/")
    : url;

  const link = window.document.createElement("a");
  link.href = downloadUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = document.fileName || "document";
  window.document.body.appendChild(link);
  link.click();
  link.remove();
};

export const openDocument = downloadDocument;
