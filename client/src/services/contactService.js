import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = async ({ name, email, subject = "", message }) => {
  const clean = {
    name: String(name || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    subject: String(subject || "").trim() || "Digital Vault Contact",
    message: String(message || "").trim(),
  };
  if (!clean.name || !clean.email || !clean.message) throw new Error("Please fill in your name, email and message.");
  if (!emailPattern.test(clean.email)) throw new Error("Please enter a valid email address.");
  if (clean.name.length > 100 || clean.email.length > 160 || clean.subject.length > 180 || clean.message.length > 5000) {
    throw new Error("Please keep the message within the allowed limits.");
  }
  const ref = await addDoc(collection(db, "contactMessages"), {
    ...clean,
    status: "new",
    source: "website",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id };
};

export const getAllContactMessages = async () => {
  const snap = await getDocs(collection(db, "contactMessages"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => {
    const av = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const bv = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return bv - av;
  });
};

export const updateContactMessageStatus = async (id, status) => {
  const allowed = ["new", "read", "replied", "closed"];
  if (!id || !allowed.includes(status)) throw new Error("Invalid contact message status.");
  await updateDoc(doc(db, "contactMessages", id), { status, updatedAt: serverTimestamp() });
};

export const deleteContactMessage = async (id) => {
  if (!id) throw new Error("Invalid contact message.");
  await deleteDoc(doc(db, "contactMessages", id));
};
