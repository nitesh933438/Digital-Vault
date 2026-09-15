import { useEffect, useMemo, useState } from "react";

import "./RecentDocuments.css";
import PreviewModal from "../PreviewModal/PreviewModal";

import toast from "react-hot-toast";

import {

  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFolderOpen,
  FaCalendarAlt,
  FaDownload,
  FaStar,
  FaTrash,
  FaSearch,
  FaCloud,
  FaExternalLinkAlt

} from "react-icons/fa";

import {

  getRecentDocuments

} from "../../services/recentDocumentService";

import {

  deleteDocument,
  toggleFavorite,
  downloadDocument

} from "../../services/documentService";

function RecentDocuments({

  documents: dashboardDocuments = []

}) {

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);

  /*
  ==========================================
  LOAD DOCUMENTS
  ==========================================
  */

  const loadDocuments = async () => {

    try {

      setLoading(true);

      if (dashboardDocuments.length > 0) {

        setDocuments(dashboardDocuments);

      }

      else {

        const data = await getRecentDocuments();

        setDocuments(data);

      }

    }

    catch (error) {

      console.error(error);

      toast.error("Unable to load documents.");

      setDocuments([]);

    }

    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadDocuments();

    const refresh = () => {

      loadDocuments();

    };

    window.addEventListener(

      "documentsUpdated",

      refresh

    );

    return () => {

      window.removeEventListener(

        "documentsUpdated",

        refresh

      );

    };

  }, [dashboardDocuments]);

  /*
  ==========================================
  SEARCH FILTER
  ==========================================
  */

  const filteredDocuments = useMemo(() => {

    return documents.filter((doc) => {

      const name =

        (doc.fileName || "").toLowerCase();

      const category =

        (doc.category || "").toLowerCase();

      const keyword =

        search.toLowerCase();

      return (

        name.includes(keyword) ||

        category.includes(keyword)

      );

    });

  }, [documents, search]);

    /*
  ==========================================
  FILE ICON
  ==========================================
  */

  const getFileIcon = (fileName = "") => {

    const file = fileName.toLowerCase();

    if (file.endsWith(".pdf")) {
      return <FaFilePdf className="pdf" />;
    }

    if (
      file.endsWith(".doc") ||
      file.endsWith(".docx")
    ) {
      return <FaFileWord className="word" />;
    }

    if (
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".png") ||
      file.endsWith(".webp")
    ) {
      return <FaFileImage className="image" />;
    }

    if (
      file.endsWith(".zip") ||
      file.endsWith(".rar")
    ) {
      return <FaFileArchive className="zip" />;
    }

    return <FaFileAlt className="file" />;

  };

  /*
  ==========================================
  FORMAT DATE
  ==========================================
  */

  const formatDate = (createdAt) => {

    if (!createdAt) return "Today";

    try {

      if (createdAt.toDate) {

        return createdAt
          .toDate()
          .toLocaleDateString();

      }

      if (createdAt.seconds) {

        return new Date(
          createdAt.seconds * 1000
        ).toLocaleDateString();

      }

      return new Date(createdAt)
        .toLocaleDateString();

    }

    catch {

      return "Today";

    }

  };

  /*
  ==========================================
  DELETE DOCUMENT
  ==========================================
  */

  const handleDelete = async (document) => {

    const ok = window.confirm(
      `Delete "${document.fileName}" ?`
    );

    if (!ok) return;

    try {

      await deleteDocument(document);

      toast.success(
        "Document deleted successfully."
      );

      loadDocuments();

    }

    catch (error) {

      toast.error(error.message);

    }

  };

  /*
  ==========================================
  FAVORITE
  ==========================================
  */

  const handleFavorite = async (document) => {

    try {

      await toggleFavorite(

        document.id,

        document.favorite

      );

      toast.success(

        document.favorite

          ? "Removed from Favorites"

          : "Added to Favorites"

      );

      loadDocuments();

    }

    catch (error) {

      toast.error(error.message);

    }

  };

  /*
  ==========================================
  DOWNLOAD
  ==========================================
  */

  const handleDownload = async (document) => {
    try {
      await downloadDocument(document);
    } catch (error) {
      toast.error(error.message || "Download failed.");
    }
  };

  /*
  ==========================================
  OPEN DOCUMENT
  ==========================================
  */

  const handleOpen = (document) => {
    if (!document?.fileUrl && !document?.fileURL && !document?.url) {
      toast.error("File URL not found.");
      return;
    }
    setPreviewDocument(document);
  };

    /*
  ==========================================
  RENDER
  ==========================================
  */

  return (

    <section className="recent-section">

      {/* Header */}

      <div className="recent-top">

        <div>

          <span className="recent-tag">

            <FaCloud />

            Cloud Storage

          </span>

          <h2>

            Recent Documents

          </h2>

          <p>

            View, search and manage your latest uploaded documents.

          </p>

        </div>

        <div className="recent-search">

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

      </div>

      {/* Loading */}

      {

        loading && (

          <div className="recent-loading">

            <h3>

              Loading Documents...

            </h3>

          </div>

        )

      }

      {/* Empty */}

      {

        !loading && filteredDocuments.length === 0 && (

          <div className="recent-empty">

            <FaFolderOpen className="empty-icon" />

            <h3>

              No Documents Found

            </h3>

            <p>

              Upload your first document to start using your Digital Vault.

            </p>

          </div>

        )

      }

      {/* Grid */}

      {

        !loading && filteredDocuments.length > 0 && (

          <div className="recent-grid">            {

              filteredDocuments.map((doc) => (

                <div

                  key={doc.id}

                  className="recent-item"

                >

                  <div

                    className="recent-icon"

                    onClick={() => handleOpen(doc)}

                  >

                    {getFileIcon(doc.fileName)}

                  </div>

                  <div className="recent-content">

                    <h3 title={doc.fileName}>

                      {doc.fileName}

                    </h3>

                    <div className="recent-meta">

                      <span>

                        <FaFolderOpen />

                        {doc.category || "General"}

                      </span>

                      <span>

                        <FaCalendarAlt />

                        {formatDate(doc.createdAt)}

                      </span>

                    </div>

                    <div className="recent-bottom">

                      <span className="badge">

                        Secure

                      </span>

                      <div className="recent-actions">

                        <button

                          title="Open"

                          onClick={() => handleOpen(doc)}

                        >

                          <FaExternalLinkAlt />

                        </button>

                        <button

                          title="Favorite"

                          onClick={() => handleFavorite(doc)}

                        >

                          <FaStar

                            color={

                              doc.favorite

                                ? "#f59e0b"

                                : ""

                            }

                          />

                        </button>

                        <button

                          title="Download"

                          onClick={() => handleDownload(doc)}

                        >

                          <FaDownload />

                        </button>

                        <button

                          title="Delete"

                          className="delete-btn"

                          onClick={() => handleDelete(doc)}

                        >

                          <FaTrash />

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              ))

            }

          </div>

        )

      }

      {previewDocument && (
        <PreviewModal
          doc={previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDelete={handleDelete}
        />
      )}

    </section>

  );

}

export default RecentDocuments;

          