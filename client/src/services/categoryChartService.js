import { auth, db } from "../firebase/firebase";

import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export const getCategoryData = async () => {

  const user = auth.currentUser;

  if (!user) return [];

  const q = query(
    collection(db, "documents"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const categories = {};

  snapshot.docs.forEach((doc) => {

    const data = doc.data();

    if (categories[data.category]) {

      categories[data.category]++;

    } else {

      categories[data.category] = 1;

    }

  });

  return Object.keys(categories).map((key) => ({
    name: key,
    value: categories[key]
  }));

};