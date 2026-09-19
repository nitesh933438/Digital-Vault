import { db } from "../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const normalizeSubscriberEmail = (email = "") => email.trim().toLowerCase();

const emailId = async (email) => {
  if (!globalThis.crypto?.subtle) throw new Error("Secure browser cryptography is unavailable. Please try again on HTTPS.");
  const bytes = new TextEncoder().encode(email);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};

export const subscribeToNewsletter = async (email) => {
  const normalized = normalizeSubscriberEmail(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Please enter a valid email address.");
  }

  const id = await emailId(normalized);
  try {
    await setDoc(doc(db, "newsletterSubscribers", id), {
      email: normalized,
      status: "active",
      source: "website",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { alreadySubscribed: false, id };
  } catch (error) {
    // Public clients cannot update an existing subscriber, so a permission
    // error here means this deterministic email record already exists.
    if (error?.code === "permission-denied") return { alreadySubscribed: true, id };
    throw error;
  }
};
