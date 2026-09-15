import { db } from "../firebase/firebase";

import {
  doc,
  updateDoc
} from "firebase/firestore";

export const toggleFavorite = async (id, favorite) => {

  await updateDoc(
    doc(db, "documents", id),
    {
      favorite: !favorite
    }
  );

};