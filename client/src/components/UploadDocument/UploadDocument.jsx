import { useState } from "react";
import "./UploadDocument.css";

import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

import {
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaFileVideo,
  FaTrashAlt,
  FaCheckCircle
} from "react-icons/fa";

import { uploadDocument } from "../../services/storageService";

function UploadDocument() {

  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("General");
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { width, height } = useWindowSize();

  const allowedTypes = [
    "application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp",
    "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain", "text/csv", "application/zip",
    "video/mp4", "video/webm", "video/quicktime"
  ];
  const maxUploadBytes = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_BYTES || 25 * 1024 * 1024);

  const onDrop = (acceptedFiles) => {

    const validFiles = [];

    acceptedFiles.forEach((file) => {

      if (!allowedTypes.includes(file.type)) {

        toast.error(`${file.name} is not supported`);

        return;

      }

      if (file.size > maxUploadBytes) {

        toast.error(`${file.name} is larger than ${Math.round(maxUploadBytes / 1024 / 1024)}MB`);

        return;

      }

      validFiles.push({

        file,

        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null

      });

    });

    setFiles((prev) => {

      const merged = [...prev];

      validFiles.forEach((item) => {

        const exists = merged.find(

          (f) =>

            f.file.name === item.file.name &&

            f.file.size === item.file.size

        );

        if (!exists) {

          merged.push(item);

        }

      });

      return merged;

    });

  };

  const {

    getRootProps,

    getInputProps,

    isDragActive

  } = useDropzone({

    onDrop,

    multiple: true,

    accept: {

      "application/pdf": [".pdf"],

      "image/png": [".png"],

      "image/jpeg": [".jpg", ".jpeg"],

      "image/webp": [".webp"],

      "application/msword": [".doc"],

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/zip": [".zip"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/quicktime": [".mov"]

    }

  });

  const removeFile = (index) => {

    const updated = [...files];

    if (updated[index]?.preview) {

      URL.revokeObjectURL(updated[index].preview);

    }

    updated.splice(index, 1);

    setFiles(updated);

  };

  const getIcon = (type) => {

    if (type.includes("pdf"))

      return <FaFilePdf className="pdf-icon" />;

    if (

      type.includes("word") ||

      type.includes("document")

    )

      return <FaFileWord className="word-icon" />;

    if (type.includes("image"))

      return <FaFileImage className="image-icon" />;

    if (type.includes("video"))

      return <FaFileVideo className="file-icon" />;

    return <FaFileAlt className="file-icon" />;

  };

  const formatSize = (bytes) => {

    if (bytes < 1024)

      return bytes + " B";

    if (bytes < 1024 * 1024)

      return (bytes / 1024).toFixed(1) + " KB";

    return (bytes / 1024 / 1024).toFixed(2) + " MB";

  };

  const totalSize = files.reduce(

    (sum, item) => sum + item.file.size,

    0

  );

  const handleUpload = async () => {

    if (files.length === 0) {

      toast.error("Please select files");

      return;

    }

    try {

      setUploading(true);

      const loading = toast.loading("Uploading documents...");

      for (const item of files) {

  await uploadDocument(
    item.file,
    category,
    setProgress
  );

}

      toast.dismiss(loading);

      toast.success("Documents Uploaded Successfully");

      window.dispatchEvent(
  new Event("documentsUpdated")
);

window.dispatchEvent(
  new Event("notificationUpdated")
);

      setSuccess(true);

      setTimeout(() => {

        setSuccess(false);

      }, 3000);

      setFiles([]);

      setProgress(0);

    } catch (err) {

      toast.error(err.message);

    } finally {

      setUploading(false);

    }

  };

  return (
        <>
      {success && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={250}
        />
      )}

      <div className="upload-card">

        <div className="upload-header">

          <div>

            <h2>📁 Upload Documents</h2>

            <p>
              Securely upload PDF, Word, Excel, PowerPoint, text, image and video files to Digital Vault (up to 25 MB each).
            </p>

          </div>

          <div className="upload-summary">

            <h3>{files.length}</h3>

            <span>Files Selected</span>

          </div>

        </div>

        <div
          {...getRootProps()}
          className={`upload-area ${isDragActive ? "active" : ""}`}
        >

          <input {...getInputProps()} />

          <FaCloudUploadAlt className="upload-icon" />

          <h3>

            {isDragActive

              ? "Drop Files Here"

              : "Drag & Drop Files Here"}

          </h3>

          <p>

            or Click to Browse Files

          </p>

        </div>

        {

          files.length > 0 && (

            <>

              <div className="file-info">

                <span>

                  Total Files :

                  <b> {files.length}</b>

                </span>

                <span>

                  Total Size :

                  <b> {formatSize(totalSize)}</b>

                </span>

              </div>

              <div className="file-list">

                {

                  files.map((item, index) => (

                    <div
                      key={index}
                      className="file-card"
                    >

                      <div className="file-left">

                        {

                          item.preview

                            ?

                            <img
                              src={item.preview}
                              alt="preview"
                              className="preview"
                            />

                            :

                            getIcon(item.file.type)

                        }

                        <div>

                          <h4>

                            {item.file.name}

                          </h4>

                          <p>

                            {formatSize(item.file.size)}

                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeFile(index)}
                      >

                        <FaTrashAlt />

                      </button>

                    </div>

                  ))

                }

              </div>

            </>

          )

        }

        <div className="category-box">

          <label>

            Select Category

          </label>

          <select

            value={category}

            onChange={(e) => setCategory(e.target.value)}

          >

            <option>General</option>

            <option>Aadhaar</option>

            <option>PAN</option>

            <option>Resume</option>

            <option>Certificate</option>

          </select>

        </div>

        {

          uploading && (

            <div className="progress">

              <div

                style={{

                  width: `${progress}%`

                }}

              >

                {progress}%

              </div>

            </div>

          )

        }

        <button

          className="upload-btn"

          onClick={handleUpload}

          disabled={uploading || files.length === 0}

        >

          {

            uploading

              ?

              "Uploading..."

              :

              <>

                <FaCloudUploadAlt />

                Upload Documents

              </>

          }

        </button>

        {

          success && (

            <div className="success-box">

              <FaCheckCircle />

              Documents Uploaded Successfully

            </div>

          )

        }

      </div>

    </>

  );

}

export default UploadDocument;