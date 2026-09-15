import "./ImageViewer.css";

function ImageViewer({ imageUrl, onClose }) {

  return (

    <div className="viewer-overlay">

      <div className="image-box">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✖
        </button>

        <img
          src={imageUrl}
          alt="Preview"
        />

      </div>

    </div>

  );

}

export default ImageViewer;