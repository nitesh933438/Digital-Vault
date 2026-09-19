import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Documents.css";
import BackButton from "../../components/BackButton/BackButton";

import toast from "react-hot-toast";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

import Loading from "../../components/Loading/Loading";
import DocumentCard from "../../components/DocumentCard/DocumentCard";
import PreviewModal from "../../components/PreviewModal/PreviewModal";

import {
  deleteDocument,
  toggleFavorite
} from "../../services/documentService";

import { exportCSV } from "../../services/exportService";
import { exportPDF } from "../../services/pdfExportService";

import {
  FaSearch,
  FaFileCsv,
  FaFilePdf,
  FaThLarge,
  FaList
} from "react-icons/fa";

function Documents() {

  const [documents, setDocuments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const [selectedDoc, setSelectedDoc] = useState(null);

  const [gridView, setGridView] = useState(true);

  useEffect(() => {
    const querySearch = searchParams.get("search") || "";
    setSearch(querySearch);
  }, [searchParams]);

  useEffect(() => {

    const user = auth.currentUser;

    if (!user) {

      setLoading(false);

      return;

    }

    const q = query(

      collection(db, "documents"),

      where("uid", "==", user.uid)

    );

    const unsubscribe = onSnapshot(

      q,

      (snapshot) => {

        const docs = snapshot.docs.map((item) => {

          const data = item.data();

          return {

            id: item.id,

            ...data,

            // Cloudinary URL Support
            fileUrl:
              data.fileUrl ||
              data.fileURL ||
              data.url ||
              "",

            fileName:
              data.fileName ||
              "Untitled",

            category:
              data.category ||
              "General",

            publicId:
              data.publicId ||
              "",

            favorite:
              data.favorite ||
              false,

            size:
              data.size ||
              0

          };

        });

        setDocuments(docs);

        setLoading(false);

      },

      (error) => {

    
        toast.error("Unable to load documents");

        setLoading(false);

      }

    );

    return () => unsubscribe();

  }, []);

    const filteredDocuments = useMemo(() => {

    let data = [...documents];

    // Search
    if (search.trim()) {
      const queryText = search.trim().toLowerCase();
      const aliases = {
        photo: ["jpg", "jpeg", "png", "webp", "image", "photo"],
        photos: ["jpg", "jpeg", "png", "webp", "image", "photo"],
        image: ["jpg", "jpeg", "png", "webp", "image", "photo"],
        images: ["jpg", "jpeg", "png", "webp", "image", "photo"],
        video: ["mp4", "webm", "mov", "video"],
        videos: ["mp4", "webm", "mov", "video"],
        pdf: ["pdf", "application/pdf"],
        document: ["pdf", "doc", "docx", "document", "word"],
        documents: ["pdf", "doc", "docx", "document", "word"],
        word: ["doc", "docx", "word"],
      };
      data = data.filter((doc) => {
        const name = String(doc.fileName || "").toLowerCase();
        const type = String(doc.fileType || doc.type || "").toLowerCase();
        const format = String(doc.format || "").toLowerCase();
        const categoryText = String(doc.category || "").toLowerCase();
        const extension = name.includes(".") ? name.split(".").pop() : "";
        const haystack = `${name} ${type} ${format} ${categoryText} ${extension}`;
        if (haystack.includes(queryText)) return true;
        return (aliases[queryText] || []).some((alias) => haystack.includes(alias));
      });
    }

    // Category Filter
    if (category !== "All") {

      data = data.filter(

        (doc) =>

          doc.category === category

      );

    }

    // Sorting
    switch (sortBy) {

      case "Newest":

        data.sort(

          (a, b) =>

            (b.createdAt?.seconds || 0) -

            (a.createdAt?.seconds || 0)

        );

        break;

      case "Oldest":

        data.sort(

          (a, b) =>

            (a.createdAt?.seconds || 0) -

            (b.createdAt?.seconds || 0)

        );

        break;

      case "A-Z":

        data.sort((a, b) =>

          a.fileName.localeCompare(

            b.fileName

          )

        );

        break;

      case "Size":

        data.sort(

          (a, b) =>

            (b.size || 0) -

            (a.size || 0)

        );

        break;

      default:

        break;

    }

    return data;

  }, [

    documents,

    search,

    category,

    sortBy

  ]);

  // Delete Document
  const handleDelete = async (doc) => {

    if (

      !window.confirm(

        `Delete "${doc.fileName}" ?`

      )

    ) {

      return;

    }

    try {

      await deleteDocument(doc);

      toast.success(

        "Document Deleted Successfully"

      );

    }

    catch (err) {

      toast.error(

        err.message ||

        "Delete Failed"

      );

    }

  };

  // Favorite
  const handleFavorite = async (doc) => {

    try {

      await toggleFavorite(

        doc.id,

        doc.favorite

      );

    }

    catch (err) {

      toast.error(

        err.message ||

        "Favorite Failed"

      );

    }

  };

  if (loading) {

    return <Loading />;

  }

    return (

    <div className="documents-page">

      <div className="page-back-row"><BackButton label="Back to Dashboard" /></div>

      {/* Header */}

      <div className="documents-header">

        <div>

          <h1>📁 My Documents</h1>

          <p>

            Manage, search, preview and organize your uploaded documents.

          </p>

        </div>

      </div>

      {/* Toolbar */}

      <div className="documents-toolbar">

        {/* Search */}

        <div className="search-box">

          <FaSearch />

          <input

            type="text"

            placeholder="Search documents..."

            value={search}

            onChange={(e) =>

              setSearch(e.target.value)

            }

          />

        </div>

        {/* Category */}

        <select

          value={category}

          onChange={(e) =>

            setCategory(e.target.value)

          }

        >

          <option value="All">

            All Categories

          </option>

          <option value="General">

            General

          </option>

          <option value="Aadhaar">

            Aadhaar

          </option>

          <option value="PAN">

            PAN

          </option>

          <option value="Resume">

            Resume

          </option>

          <option value="Certificate">

            Certificate

          </option>

        </select>

        {/* Sort */}

        <select

          value={sortBy}

          onChange={(e) =>

            setSortBy(e.target.value)

          }

        >

          <option value="Newest">

            Newest

          </option>

          <option value="Oldest">

            Oldest

          </option>

          <option value="A-Z">

            A-Z

          </option>

          <option value="Size">

            Size

          </option>

        </select>

        {/* Export CSV */}

        <button

          className="toolbar-btn csv"

          onClick={() => {
            try { exportCSV(filteredDocuments, auth.currentUser); }
            catch (error) { toast.error(error.message || "CSV export failed."); }
          }}

        >

          <FaFileCsv />

          CSV

        </button>

        {/* Export PDF */}

        <button

          className="toolbar-btn pdf"

          onClick={() => {
            try { exportPDF(filteredDocuments, auth.currentUser); }
            catch (error) { toast.error(error.message || "PDF export failed."); }
          }}

        >

          <FaFilePdf />

          PDF

        </button>

        {/* Grid / List */}

        <button

          className="toolbar-btn"

          onClick={() =>

            setGridView(!gridView)

          }

        >

          {

            gridView

              ?

              <FaList />

              :

              <FaThLarge />

          }

        </button>

      </div>

      {/* Documents */}

<div
  className={
    gridView
      ? "documents-grid"
      : "documents-list"
  }
>

  {
    filteredDocuments.length === 0 ? (

      <div className="empty-state">

        <div className="empty-icon">
          📂
        </div>

        <h2>No Documents Found</h2>

        <p>
          Upload your first document to get started.
        </p>

      </div>

    ) : (

      filteredDocuments.map((doc) => (

        <DocumentCard
          key={doc.id}
          doc={doc}
          onDelete={handleDelete}
          onPreview={setSelectedDoc}
          onFavorite={() => handleFavorite(doc)}
        />

      ))

    )
  }

</div>

      {/* Preview Modal */}

      <PreviewModal

        doc={selectedDoc}

        onClose={() =>

          setSelectedDoc(null)

        }

        onDelete={handleDelete}

      />

    </div>

  );

}

export default Documents;