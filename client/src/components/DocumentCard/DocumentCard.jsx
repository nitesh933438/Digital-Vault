import "./DocumentCard.css";
import { downloadDocument } from "../../services/documentService";
import toast from "react-hot-toast";

import {

  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaFileVideo,

  FaEye,
  FaDownload,
  FaTrash,

  FaRegStar,
  FaStar,

  FaCalendarAlt,
  FaFolderOpen

} from "react-icons/fa";

function DocumentCard({

  doc,

  onDelete,

  onPreview,

  onFavorite

}) {

  // Cloudinary URL

  const fileUrl =

    doc.fileUrl ||

    doc.fileURL ||

    doc.url ||

    "";

  const extension =

    doc.fileName

      ?.split(".")

      .pop()

      ?.toLowerCase();

  const getIcon = () => {

    if (extension === "pdf") {

      return <FaFilePdf className="pdf" />;

    }

    if (

      extension === "doc" ||

      extension === "docx"

    ) {

      return <FaFileWord className="word" />;

    }

    if (extension === "mp4" || extension === "webm" || extension === "mov") {
      return <FaFileVideo className="file" />;
    }

    if (

      extension === "jpg" ||

      extension === "jpeg" ||

      extension === "png" ||

      extension === "webp"

    ) {

      return <FaFileImage className="image" />;

    }

    return <FaFileAlt className="file" />;

  };

  const formatSize = (bytes) => {

    if (!bytes) return "0 B";

    if (bytes < 1024) {

      return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

      return (bytes / 1024).toFixed(1) + " KB";

    }

    if (bytes < 1024 * 1024 * 1024) {

      return (bytes / 1024 / 1024).toFixed(2) + " MB";

    }

    return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";

  };

  const uploadDate =

    doc.createdAt?.seconds

      ? new Date(

          doc.createdAt.seconds * 1000

        ).toLocaleDateString()

      : "Today";

        return (

    <div className="document-card">

      {/* Category */}

      <div className="document-tag">

        <FaFolderOpen />

        <span>{doc.category}</span>

      </div>

      {/* Favorite */}

      <button

        className="favorite-btn"

        onClick={onFavorite}

        title={

          doc.favorite

            ? "Remove Favorite"

            : "Add Favorite"

        }

      >

        {

          doc.favorite

            ?

            <FaStar />

            :

            <FaRegStar />

        }

      </button>

      {/* File Icon */}

      <div className="document-icon">

        {getIcon()}

      </div>

      {/* File Name */}

      <h3 title={doc.fileName}>

        {doc.fileName}

      </h3>

      {/* File Info */}

      <div className="document-info">

        <span>

          <FaCalendarAlt />

          {uploadDate}

        </span>

        <span>

          {formatSize(doc.size)}

        </span>

      </div>

      {/* Actions */}

      <div className="document-actions">

        {/* Preview */}

        <button

          className="preview-btn"

          title="Preview"

          onClick={() => onPreview(doc)}

        >

          <FaEye />

        </button>

        {/* Download */}

        <button

          className="download-btn"

          title="Download"

          onClick={async () => {
            try {
              await downloadDocument(doc);
            } catch (error) {
              toast.error(error.message || "Download failed.");
            }
          }}

        >

          <FaDownload />

        </button>

        {/* Delete */}

        <button

          className="delete-btn"

          title="Delete"

          onClick={() => onDelete(doc)}

        >

          <FaTrash />

        </button>

      </div>

            </div>

  );

}

export default DocumentCard;