import { auth, db } from "../firebase/firebase";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

/*
==========================================
GET RECENT DOCUMENTS
==========================================
*/

export const getRecentDocuments = async () => {

  try {

    const user = auth.currentUser;

    if (!user) {

      return [];

    }

    const q = query(

      collection(db, "documents"),

      where("uid", "==", user.uid)

    );

    const snapshot = await getDocs(q);

    const documents = snapshot.docs.map((doc) => {

      const data = doc.data();

      return {

        id: doc.id,

        uid: data.uid || "",

        fileName: data.fileName || "Untitled",

        fileUrl:
          data.fileUrl ||
          data.fileURL ||
          data.url ||
          "",

        publicId:
          data.publicId || "",

        category:
          data.category || "General",

        fileType:
          data.fileType || "",

        size:
          Number(data.size || 0),

        favorite:
          Boolean(data.favorite),

        createdAt:
          data.createdAt || null

      };

    });

    documents.sort((a, b) => {
      const av = a.createdAt?.toMillis?.() ?? (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const bv = b.createdAt?.toMillis?.() ?? (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return bv - av;
    });

    return documents.slice(0, 10);

  }

  catch (error) {

    console.error(

      "Recent Documents Error:",

      error

    );

    return [];

  }

};

/*
==========================================
GET DOCUMENT COUNT
==========================================
*/

export const getDocumentCount = async () => {

  try {

    const user = auth.currentUser;

    if (!user) return 0;

    const q = query(

      collection(db, "documents"),

      where("uid", "==", user.uid)

    );

    const snapshot = await getDocs(q);

    return snapshot.size;

  }

  catch (error) {

    console.error("Count Error :", error);

    return 0;

  }

};

/*
==========================================
GET STORAGE USED
==========================================
*/

export const getStorageUsed = async () => {

  try {

    const user = auth.currentUser;

    if (!user) return 0;

    const q = query(

      collection(db, "documents"),

      where("uid", "==", user.uid)

    );

    const snapshot = await getDocs(q);

    let total = 0;

    snapshot.forEach((doc) => {

      total += Number(doc.data().size || 0);

    });

    return total;

  }

  catch (error) {

    console.error("Storage Error :", error);

    return 0;

  }

};

/*
==========================================
FORMAT STORAGE
==========================================
*/

export const formatFileSize = (bytes = 0) => {

  if (bytes === 0) return "0 B";

  const sizes = [

    "B",

    "KB",

    "MB",

    "GB",

    "TB"

  ];

  const i = Math.floor(

    Math.log(bytes) /

    Math.log(1024)

  );

  return (

    bytes /

    Math.pow(1024, i)

  ).toFixed(2) +

  " " +

  sizes[i];

};

/*
==========================================
GET FILE ICON TYPE
==========================================
*/

export const getFileExtension = (fileName = "") => {

  return fileName

    .split(".")

    .pop()

    .toLowerCase();

};