import { db } from "../firebase/firebase";
import { getAllContactMessages, updateContactMessageStatus, deleteContactMessage } from "./contactService";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data(), uid: d.id }))
    .sort((a, b) => {
      const av = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const bv = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return bv - av;
    });
};

export const getAllDocuments = async () => {
  const snap = await getDocs(collection(db, "documents"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), uid: d.data().uid || "" }));
};

export const updateUserStatus = (uid, status) => updateDoc(doc(db, "users", uid), { status });
export const updateUserRole = (uid, role) => updateDoc(doc(db, "users", uid), { role });
export const deleteUserProfile = (uid) => deleteDoc(doc(db, "users", uid));

export const deleteDocumentAsAdmin = async (document) => {
  if (!document?.id) throw new Error("Invalid document.");
  await deleteDoc(doc(db, "documents", document.id));
};


export const getAllNewsletterSubscribers = async () => {
  const snap = await getDocs(collection(db, "newsletterSubscribers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => {
    const av = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const bv = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return bv - av;
  });
};

export const deleteNewsletterSubscriber = (id) => deleteDoc(doc(db, "newsletterSubscribers", id));

export { getAllContactMessages, updateContactMessageStatus, deleteContactMessage };
