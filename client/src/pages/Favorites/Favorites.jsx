import { useEffect, useState } from "react";
import "./Favorites.css";
import BackButton from "../../components/BackButton/BackButton";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

import DocumentCard from "../../components/DocumentCard/DocumentCard";
import { deleteDocument, toggleFavorite } from "../../services/documentService";
import PreviewModal from "../../components/PreviewModal/PreviewModal";
import toast from "react-hot-toast";

function Favorites() {

  const [favorites, setFavorites] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "documents"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFavorites(data.filter((item) => item.favorite === true));

    });

    return () => unsubscribe();

  }, []);

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.fileName}"?`)) return;
    try {
      await deleteDocument(doc);
      toast.success("Document deleted successfully");
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleFavorite = async (doc) => {
    try {
      await toggleFavorite(doc.id, doc.favorite);
    } catch (err) {
      toast.error(err.message || "Favorite update failed");
    }
  };

  return (

    <div className="favorites-page">

      <div className="page-back-row"><BackButton label="Back to Dashboard" /></div>

      <h1>⭐ Favorite Documents</h1>

      <div className="document-grid">

        {

          favorites.length===0 ?

          <p>No Favorite Documents.</p>

          :

          favorites.map(doc=>(

            <DocumentCard

              key={doc.id}

              doc={doc}

              onDelete={handleDelete}
              onPreview={setSelectedDoc}
              onFavorite={() => handleFavorite(doc)}
            />

          ))

        }

      </div>

      <PreviewModal
        doc={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={handleDelete}
      />

    </div>

  );

}

export default Favorites;