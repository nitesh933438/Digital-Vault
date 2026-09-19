import "./PdfViewer.css";

function PdfViewer({ fileUrl, onClose }) {

  return (

    <div className="viewer-overlay">

      <div className="viewer-box">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✖
        </button>

        <iframe
          src={fileUrl}
          title="PDF Preview"
          width="100%"
          height="600"
        />

      </div>

    </div>

  );

}

export default PdfViewer;