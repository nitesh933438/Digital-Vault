import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PreviewModal.css";

import {
  FaTimes,
  FaTrash,
  FaDownload,
  FaExternalLinkAlt,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaCalendarAlt,
  FaFolderOpen,
  FaWeightHanging,
  FaExclamationTriangle,
} from "react-icons/fa";

// React-PDF's worker must match the PDF.js version bundled with react-pdf.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

function PreviewModal({ doc, onClose, onDelete }) {
  const [zoom, setZoom] = useState(1);
  const [pdfPages, setPdfPages] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfError, setPdfError] = useState("");
  const [pageWidth, setPageWidth] = useState(820);
  const [imageMetrics, setImageMetrics] = useState({ width: 0, height: 0, fitScale: 1 });
  const bodyRef = useRef(null);
  const imageRef = useRef(null);
  const gestureRef = useRef({ pointers: new Map(), startDistance: 0, startZoom: 1, active: false });
  const zoomFrameRef = useRef(null);


  const extension = doc?.fileName?.split(".").pop()?.toLowerCase();
  const fileUrl = doc?.fileUrl || doc?.fileURL || doc?.url || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isPDF = extension === "pdf";
  const isVideo = ["mp4", "webm", "mov"].includes(extension) || String(doc?.fileType || "").startsWith("video/");
  const isWord = extension === "doc" || extension === "docx";

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (isPDF) {
        if (event.key === "ArrowLeft") setPdfPage((page) => Math.max(1, page - 1));
        if (event.key === "ArrowRight") setPdfPage((page) => Math.min(pdfPages || 1, page + 1));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, isPDF, pdfPages]);

  useEffect(() => {
    setZoom(1);
    setPdfPage(1);
    setPdfPages(0);
    setPdfError("");
  }, [doc]);

  useEffect(() => {
    if (!bodyRef.current) return undefined;

    const updateWidth = () => {
      const body = bodyRef.current;
      const available = body?.clientWidth || window.innerWidth - 32;
      const availableHeight = body?.clientHeight || window.innerHeight - 32;
      setPageWidth(Math.max(240, Math.min(920, available - 24)));

      const image = imageRef.current;
      if (image?.naturalWidth && image?.naturalHeight) {
        const maxW = Math.max(160, available - 32);
        const maxH = Math.max(120, availableHeight - 32);
        const fitScale = Math.min(1, maxW / image.naturalWidth, maxH / image.naturalHeight);
        setImageMetrics({
          width: image.naturalWidth,
          height: image.naturalHeight,
          fitScale: Math.max(0.05, fitScale),
        });
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(bodyRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [doc]);

  // Native one-finger scrolling is intentionally preserved. When a second
  // finger lands, we take over only the pinch gesture and update the same
  // zoom state used by the toolbar. This makes touch zoom work smoothly on
  // phones/tablets without sacrificing normal one-finger pan/scroll.
  const handlePointerDown = (event) => {
    if (event.pointerType !== "touch") return;
    const gesture = gestureRef.current;
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture.pointers.size === 2) {
      const points = [...gesture.pointers.values()];
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      gesture.startDistance = Math.hypot(dx, dy) || 1;
      gesture.startZoom = zoom;
      gesture.active = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    if (event.pointerType !== "touch") return;
    const gesture = gestureRef.current;
    if (!gesture.pointers.has(event.pointerId)) return;
    gesture.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!gesture.active || gesture.pointers.size < 2) return;

    const points = [...gesture.pointers.values()];
    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;
    const distance = Math.hypot(dx, dy) || 1;
    const maxZoom = isImage ? 3 : isPDF ? 2 : 1;
    const nextZoom = Math.max(0.5, Math.min(maxZoom, gesture.startZoom * (distance / gesture.startDistance)));
    const body = bodyRef.current;
    if (body && nextZoom !== zoom) {
      const midpointX = (points[0].x + points[1].x) / 2;
      const midpointY = (points[0].y + points[1].y) / 2;
      const rect = body.getBoundingClientRect();
      const ratio = nextZoom / zoom;
      const localX = midpointX - rect.left + body.scrollLeft;
      const localY = midpointY - rect.top + body.scrollTop;
      setZoom(nextZoom);
      if (zoomFrameRef.current) cancelAnimationFrame(zoomFrameRef.current);
      zoomFrameRef.current = requestAnimationFrame(() => {
        if (!bodyRef.current) return;
        bodyRef.current.scrollLeft = Math.max(0, localX * ratio - (midpointX - rect.left));
        bodyRef.current.scrollTop = Math.max(0, localY * ratio - (midpointY - rect.top));
      });
    }
    event.preventDefault();
  };

  const handlePointerEnd = (event) => {
    if (event.pointerType !== "touch") return;
    const gesture = gestureRef.current;
    gesture.pointers.delete(event.pointerId);
    if (gesture.pointers.size < 2) {
      gesture.active = false;
      gesture.startDistance = 0;
    }
  };

  const attachmentUrl = fileUrl.includes("/upload/")
    ? fileUrl.replace("/upload/", "/upload/fl_attachment/")
    : fileUrl;

  if (!doc) return null;

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  const uploadDate = doc.createdAt?.seconds
    ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString()
    : "Today";

  const getIcon = () => {
    if (isPDF) return <FaFilePdf className="pdf-icon" />;
    if (isWord) return <FaFileWord className="word-icon" />;
    if (isImage) return <FaFileImage className="image-icon" />;
    return <FaFileAlt className="file-icon" />;
  };

  const handleDownload = () => {
    if (attachmentUrl) window.open(attachmentUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${doc.fileName}" ?`)) return;
    onDelete(doc);
    onClose();
  };

  const pdfLoadError = (error) => {
    console.error("PDF preview failed:", error);
    setPdfError("This PDF could not be rendered in the preview. Use Open or Download to access the original file.");
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(event) => event.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">
            <div className="preview-file-icon">{getIcon()}</div>
            <div>
              <h2>{doc.fileName}</h2>
              <span>{doc.category}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close preview"><FaTimes /></button>
        </div>

        <div className="preview-info">
          <div><FaFolderOpen /><span>{doc.category}</span></div>
          <div><FaWeightHanging /><span>{formatSize(doc.size)}</span></div>
          <div><FaCalendarAlt /><span>{uploadDate}</span></div>
        </div>

        {isImage && (
          <div className="zoom-toolbar">
            <button onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} aria-label="Zoom out"><FaSearchMinus /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((value) => Math.min(3, value + 0.25))} aria-label="Zoom in"><FaSearchPlus /></button>
            <button onClick={() => setZoom(1)} aria-label="Reset zoom"><FaUndo /></button>
          </div>
        )}

        {isPDF && !pdfError && (
          <div className="pdf-page-toolbar">
            <button onClick={() => setPdfPage((page) => Math.max(1, page - 1))} disabled={pdfPage <= 1} aria-label="Previous page"><FaChevronLeft /></button>
            <span>Page {pdfPage} of {pdfPages || "…"}</span>
            <button onClick={() => setPdfPage((page) => Math.min(pdfPages || page + 1, page + 1))} disabled={!pdfPages || pdfPage >= pdfPages} aria-label="Next page"><FaChevronRight /></button>
            <button onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))} aria-label="Zoom out"><FaSearchMinus /></button>
            <strong>{Math.round(zoom * 100)}%</strong>
            <button onClick={() => setZoom((value) => Math.min(2, value + 0.25))} aria-label="Zoom in"><FaSearchPlus /></button>
            <button onClick={() => setZoom(1)} aria-label="Reset zoom"><FaUndo /></button>
          </div>
        )}

        <div
          className="preview-body"
          ref={bodyRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
        >
          {isImage ? (
            <div className="image-zoom-viewport" aria-label="Image zoom area">
              <div
                className="image-zoom-stage"
                style={{
                  width: imageMetrics.width
                    ? Math.max(1, Math.round(imageMetrics.width * imageMetrics.fitScale * zoom))
                    : "100%",
                  height: imageMetrics.height
                    ? Math.max(1, Math.round(imageMetrics.height * imageMetrics.fitScale * zoom))
                    : "100%",
                }}
              >
                <img
                  ref={imageRef}
                  src={fileUrl}
                  alt={doc.fileName}
                  className="preview-image"
                  onLoad={() => {
                    const body = bodyRef.current;
                    const image = imageRef.current;
                    if (!body || !image?.naturalWidth || !image?.naturalHeight) return;
                    const maxW = Math.max(160, body.clientWidth - 32);
                    const maxH = Math.max(120, body.clientHeight - 32);
                    const fitScale = Math.min(1, maxW / image.naturalWidth, maxH / image.naturalHeight);
                    setImageMetrics({
                      width: image.naturalWidth,
                      height: image.naturalHeight,
                      fitScale: Math.max(0.05, fitScale),
                    });
                  }}
                />
              </div>
            </div>
          ) : isPDF ? (
            pdfError ? (
              <div className="unsupported-file">
                <FaExclamationTriangle className="pdf-error-icon" />
                <h3>PDF Preview Unavailable</h3>
                <p>{pdfError}</p>
                <button className="open-btn inline-action" onClick={() => window.open(fileUrl, "_blank", "noopener,noreferrer")}><FaExternalLinkAlt /> Open PDF</button>
              </div>
            ) : (
              <div className="pdf-viewer-shell">
                <Document
                  file={fileUrl}
                  options={PDF_OPTIONS}
                  onLoadSuccess={({ numPages }) => {
                    setPdfPages(numPages);
                    setPdfPage((page) => Math.min(page, numPages));
                  }}
                  onLoadError={pdfLoadError}
                  loading={<div className="pdf-loading">Loading PDF…</div>}
                  error={<div className="pdf-loading">Unable to load PDF.</div>}
                  noData={<div className="pdf-loading">No PDF file selected.</div>}
                >
                  <div className="pdf-zoom-stage" style={{ "--preview-zoom": zoom }}>
                    <Page
                      pageNumber={pdfPage}
                      width={Math.round(pageWidth * zoom)}
                      renderTextLayer
                    renderAnnotationLayer
                    loading={<div className="pdf-loading">Rendering page…</div>}
                      onRenderError={pdfLoadError}
                    />
                  </div>
                </Document>
              </div>
            )
          ) : isVideo ? (
            <video src={fileUrl} controls playsInline className="preview-video" />
          ) : isWord ? (
            <iframe src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`} title={doc.fileName} className="preview-frame" />
          ) : (
            <div className="unsupported-file">
              {getIcon()}
              <h3>Preview Not Available</h3>
              <p>This file type cannot be previewed in the browser. Download the original file to open it.</p>
            </div>
          )}
        </div>

        <div className="preview-footer">
          <button className="download-btn" onClick={handleDownload} disabled={!fileUrl}><FaDownload /> Download</button>
          <button className="open-btn" onClick={() => fileUrl && window.open(fileUrl, "_blank", "noopener,noreferrer")} disabled={!fileUrl}><FaExternalLinkAlt /> Open</button>
          <button className="delete-btn" onClick={handleDelete}><FaTrash /> Delete</button>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
