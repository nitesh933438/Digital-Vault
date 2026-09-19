import { useEffect, useState } from "react";
import { FaDatabase, FaCloud, FaFolderOpen, FaCheckCircle } from "react-icons/fa";
import { getDashboardStats, formatStorage, TOTAL_STORAGE } from "../../services/dashboardService";
import "./StorageAnalytics.css";

function StorageAnalytics({ stats: incomingStats }) {
  const [stats, setStats] = useState(incomingStats || null);
  useEffect(() => {
    if (incomingStats) { setStats(incomingStats); return undefined; }
    let active = true;
    getDashboardStats().then((data) => { if (active) setStats(data); }).catch(() => {});
    return () => { active = false; };
  }, [incomingStats]);

  const used = Number(stats?.storageUsed || 0);
  const percent = Math.min(100, Math.max(0, Number(stats?.storagePercent || 0)));
  const remaining = Math.max(0, Number(stats?.storageRemaining ?? TOTAL_STORAGE - used));
  const status = stats?.storageHealth || "Healthy";
  const color = stats?.storageColor || "#22c55e";
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return <div className="storage-card">
    <div className="storage-header"><div><span className="storage-tag"><FaCloud /> Cloud Storage</span><h2>Storage Analytics</h2><p>Live usage calculated from your uploaded files.</p></div></div>
    <div className="storage-circle"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r={radius} /><circle cx="110" cy="110" r={radius} style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: circumference - (circumference * percent) / 100 }} /></svg><div className="storage-value"><h1>{percent.toFixed(1)}%</h1><span>Used</span></div></div>
    <div className="storage-grid">
      <div className="storage-box"><FaDatabase /><div><h3>{formatStorage(TOTAL_STORAGE)}</h3><p>Total Space</p></div></div>
      <div className="storage-box"><FaCloud /><div><h3>{formatStorage(used)}</h3><p>Used</p></div></div>
      <div className="storage-box"><FaFolderOpen /><div><h3>{formatStorage(remaining)}</h3><p>Available</p></div></div>
      <div className="storage-box success"><FaCheckCircle /><div><h3>{status}</h3><p>Storage Status</p></div></div>
    </div>
  </div>;
}
export default StorageAnalytics;
