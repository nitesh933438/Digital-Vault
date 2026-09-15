import { auth, db } from "../firebase/firebase";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export const getMonthlyUploads = async () => {

  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "documents"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const uploads = new Array(12).fill(0);

  snapshot.docs.forEach((doc) => {

    const data = doc.data();

    if (data.createdAt) {

      const date = data.createdAt.toDate();

      uploads[date.getMonth()]++;

    }

  });

  return months.map((month, index) => ({
    month,
    uploads: uploads[index]
  }));

};