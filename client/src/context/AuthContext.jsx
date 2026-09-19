import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ADMIN_EMAIL, isGoogleUser, syncGoogleUser } from "../services/authService";

const AuthContext = createContext(null);

const isGoogleProvider = (currentUser) =>
  currentUser?.providerData?.some((provider) => provider.providerId === "google.com");

const isRootAdmin = (currentUser) =>
  String(currentUser?.email || "").trim().toLowerCase() === ADMIN_EMAIL &&
  isGoogleProvider(currentUser);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        let data = null;
        if (isGoogleUser(currentUser)) {
          data = await syncGoogleUser(currentUser);
        } else {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          data = snap.exists() ? snap.data() : null;
        }
        setProfile(data);

        if (data?.status === "disabled") {
          await signOut(auth);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.warn("Could not load user profile:", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let enabled = false;
    try {
      enabled = JSON.parse(localStorage.getItem("settings") || "{}").autoLogout === true;
    } catch {}
    if (!enabled) return undefined;

    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try { await signOut(auth); } catch {}
      }, 30 * 60 * 1000);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  const rootAdmin = isRootAdmin(user);
  const delegatedAdmin =
    !rootAdmin &&
    String(user?.email || "").trim().toLowerCase() !== ADMIN_EMAIL &&
    profile?.role === "admin";
  const isAdmin = rootAdmin || delegatedAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: isAdmin ? "admin" : "user",
        isAdmin,
        isRootAdmin: rootAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
