import { useEffect } from "react";
import { FaCloud, FaTimes, FaDatabase, FaFileAlt, FaImages, FaVideo, FaMusic, FaArchive, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFolderOpen, FaChevronRight } from "react-icons/fa";
import "./StorageDetails.css";
import { formatStorage, TOTAL_STORAGE } from "../../services/dashboardService";

const TYPE_ICONS = { PDF: FaFileAlt, Images: FaImages, Videos: FaVideo, Audio: FaMusic, Archives: FaArchive, Documents: FaFileWord, Spreadsheets: FaFileExcel, Presentations: FaFilePowerpoint, Other: FaDatabase };
const TYPE_COLORS = { PDF: "#ef4444", Images: "#8b5cf6", Videos: "#f59e0b", Audio: "#10b981", Archives: "#64748b", Documents: "#2563eb", Spreadsheets: "#16a34a", Presentations: "#f97316", Other: "#94a3b8" };

function StorageDetails({ stats, onClose }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);

  const used = Math.max(0, Number(stats?.storageUsed) || 0);
  const remaining = Math.max(0, Number(stats?.storageRemaining) || 0);
  const percent = Math.min(100, Math.max(0, Number(stats?.storagePercent) || 0));
  const breakdown = Array.isArray(stats?.storageBreakdown) ? stats.storageBreakdown : [];
  const categories = Array.isArray(stats?.categoryBreakdown) ? stats.categoryBreakdown : [];
  const largestFiles = Array.isArray(stats?.largestFiles) ? stats.largestFiles : [];
  const status = percent >= 90 ? "Critical" : percent >= 70 ? "Warning" : "Healthy";
  const circumference = 2 * Math.PI * 58;
  const dash = circumference - (circumference * percent) / 100;

  return (
    <div className="storage-details-overlay" role="dialog" aria-modal="true" aria-label="Cloud storage details" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="storage-details-sheet">
        <header className="storage-details-header">
          <div className="storage-details-title"><div className="storage-details-icon"><FaCloud /></div><div><span>Cloud Storage</span><h2>Storage Details</h2><p>Live usage from your uploaded Digital Vault files</p></div></div>
          <button className="storage-details-close" onClick={onClose} aria-label="Close storage details"><FaTimes /></button>
        </header>
        <div className="storage-details-scroll">
          <section className="storage-overview-card">
            <div className="storage-ring-wrap"><svg className="storage-ring" viewBox="0 0 140 140" aria-hidden="true"><circle className="storage-ring-track" cx="70" cy="70" r="58" /><circle className="storage-ring-value" cx="70" cy="70" r="58" strokeDasharray={circumference} strokeDashoffset={dash} /></svg><div className="storage-ring-text"><strong>{percent.toFixed(1)}%</strong><span>Used</span></div></div>
            <div className="storage-overview-copy"><div className="storage-overview-top"><span>Storage used</span><strong>{formatStorage(used)}</strong></div><div className="storage-main-progress"><span style={{ width: `${percent}%` }} /></div><div className="storage-overview-stats"><div><span>Used</span><strong>{formatStorage(used)}</strong></div><div><span>Available</span><strong>{formatStorage(remaining)}</strong></div><div><span>Total</span><strong>{formatStorage(TOTAL_STORAGE)}</strong></div></div><div className={`storage-status ${status.toLowerCase()}`}><span /> {status} storage</div></div>
          </section>

          <section className="storage-section-block"><div className="storage-section-heading"><div><h3>Storage breakdown</h3><p>Space used by file type</p></div><strong>{stats?.fileCount || 0} files</strong></div>
            {breakdown.length ? breakdown.map((item) => { const Icon = TYPE_ICONS[item.name] || FaDatabase; const color = TYPE_COLORS[item.name] || TYPE_COLORS.Other; const share = used ? (item.bytes / used) * 100 : 0; return <div className="storage-breakdown-row" key={item.name}><div className="storage-breakdown-icon" style={{ background: `${color}18`, color }}><Icon /></div><div className="storage-breakdown-main"><div><strong>{item.name}</strong><span>{item.formatted}</span></div><div className="storage-mini-progress"><i style={{ width: `${share}%`, background: color }} /></div></div><b>{share.toFixed(1)}%</b></div>; }) : <div className="storage-empty"><FaDatabase /><p>No uploaded files yet.</p></div>}
          </section>

          <section className="storage-section-block"><div className="storage-section-heading"><div><h3>Categories</h3><p>Storage grouped by your folders/categories</p></div></div>{categories.length ? <div className="storage-category-grid">{categories.map((item) => <div className="storage-category-card" key={item.name}><FaFolderOpen /><div><strong>{item.name}</strong><span>{item.formatted}</span></div><FaChevronRight /></div>)}</div> : <div className="storage-empty"><FaFolderOpen /><p>No categories with storage yet.</p></div>}</section>

          <section className="storage-section-block"><div className="storage-section-heading"><div><h3>Largest files</h3><p>Files using the most storage</p></div></div>{largestFiles.length ? <div className="storage-files-list">{largestFiles.map((file, index) => <div className="storage-file-row" key={file.id || `${file.name}-${index}`}><div className="storage-file-rank">{index + 1}</div><div className="storage-file-info"><strong title={file.name}>{file.name}</strong><span>{file.type} • {file.formatted}</span></div></div>)}</div> : <div className="storage-empty"><FaFileAlt /><p>Your largest files will appear here.</p></div>}</section>
        </div>
        <footer className="storage-details-footer"><span><FaDatabase /> Calculated from your Firestore file metadata</span><button onClick={onClose}>Done</button></footer>
      </div>
    </div>
  );
}
export default StorageDetails;
