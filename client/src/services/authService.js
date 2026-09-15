import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const ADMIN_EMAIL = "nitesh933438@gmail.com";

export const isGoogleUser = (user) =>
  user?.providerData?.some((provider) => provider.providerId === "google.com") || false;

export const isConfiguredAdmin = (user) =>
  String(user?.email || "").trim().toLowerCase() === ADMIN_EMAIL && isGoogleUser(user);

export const registerUser = async (name, email, mobile, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ADMIN_EMAIL) {
    const error = new Error("This email is reserved for the Google administrator.");
    error.code = "auth/admin-email-reserved";
    throw error;
  }

  const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: name });
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name,
    email: normalizedEmail,
    mobile,
    photoURL: user.photoURL || "",
    createdAt: serverTimestamp(),
    role: "user",
    status: "active",
  });
  return userCredential;
};

export const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ADMIN_EMAIL) {
    const error = new Error("The primary administrator must sign in with Google.");
    error.code = "auth/admin-google-only";
    throw error;
  }
  return signInWithEmailAndPassword(auth, normalizedEmail, password);
};

export const logoutUser = async () => signOut(auth);

export const resetPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  return sendPasswordResetEmail(auth, normalizedEmail, {
    url: `${window.location.origin}${import.meta.env.BASE_URL}#/login`,
    handleCodeInApp: false,
  });
};

export const getUserData = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
};

// Google authentication uses a popup so the user stays on the app page.
// This is especially important on GitHub Pages, where a full-page redirect
// can hit a static-route 404 before the SPA is restored.
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result;
};

// Called by AuthContext after Firebase has established the authenticated user.
export const syncGoogleUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? userSnap.data() : {};
  const admin = isConfiguredAdmin(user);

  const baseData = {
    uid: user.uid,
    name: user.displayName || existing.name || "",
    email: user.email || existing.email || "",
    mobile: existing.mobile || "",
    photoURL: user.photoURL || existing.photoURL || "",
    role: admin ? "admin" : (existing.role === "admin" ? "admin" : "user"),
    status: existing.status || "active",
    updatedAt: serverTimestamp(),
  };
  if (!userSnap.exists()) baseData.createdAt = serverTimestamp();
  await setDoc(userRef, baseData, { merge: true });
  return { ...baseData, exists: userSnap.exists() };
};

export const isAdminGoogleAccount = isConfiguredAdmin;
