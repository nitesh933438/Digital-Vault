import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Topbar from "../../components/Topbar/Topbar";
import DashboardHero from "../../components/DashboardHero/DashboardHero";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import UploadDocument from "../../components/UploadDocument/UploadDocument";
import RecentDocuments from "../../components/RecentDocuments/RecentDocuments";
import UploadChart from "../../components/Charts/UploadChart";
import CategoryChart from "../../components/CategoryChart/CategoryChart";
import AIAssistant from "../../components/AIAssistant/AIAssistant";
import StorageDetails from "../../components/StorageDetails/StorageDetails";
import Loading from "../../components/Loading/Loading";

import {
FaFileAlt,
FaStar,
FaDatabase,
FaFolderOpen
} from "react-icons/fa";

import {
collection,
query,
where,
onSnapshot
} from "firebase/firestore";

import {
auth,
db
} from "../../firebase/firebase";

import {
  getDashboardStats,
  formatStorage,
  calculateStorage,
  TOTAL_STORAGE
} from "../../services/dashboardService";

function Dashboard(){

const navigate = useNavigate();
const location = useLocation();

const [loading,setLoading]=useState(true);
const [showStorageDetails,setShowStorageDetails]=useState(false);

const openStorageDetails = () => setShowStorageDetails(true);
const closeStorageDetails = () => setShowStorageDetails(false);

// Dashboard is a landing route: never reopen it at the previous page's scroll position.
useLayoutEffect(() => {
  const reset = () => {
    try { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); } catch {}
    try { document.scrollingElement && (document.scrollingElement.scrollTop = 0); } catch {}
    try { document.documentElement.scrollTop = 0; } catch {}
    try { document.body.scrollTop = 0; } catch {}
  };
  reset();
  const frame = window.requestAnimationFrame(reset);
  const timer = window.setTimeout(reset, 120);
  return () => {
    window.cancelAnimationFrame(frame);
    window.clearTimeout(timer);
  };
}, []);

// Open/scroll to the assistant when launched from the Topbar or Quick Actions.
useEffect(() => {
  if (new URLSearchParams(location.search).get("assistant") !== "1") return;
  const timer = window.setTimeout(() => {
    document.getElementById("ai-assistant")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 120);
  return () => window.clearTimeout(timer);
}, [location.search]);

const [stats,setStats]=useState({

totalDocuments:0,

favorites:0,

categories:0,

storageUsed:0,

storageRemaining:0,

storagePercent:0,

storageHealth:"Healthy",

storageColor:"#22c55e",

formattedStorage:"0 B",

formattedRemaining:"5 GB",

weeklyUploads:[0,0,0,0,0,0,0],

monthlyUploads:[0,0,0,0,0,0,0,0,0,0,0,0],

categoryStats:{},

fileTypes:{},

recentDocuments:[],

recentActivity:[],

documents:[]

});

/* ==========================================
   LOAD DASHBOARD
========================================== */

const loadDashboard = useCallback(async () => {

  try {

    setLoading(true);

    const data = await getDashboardStats();

    if (data) {

      setStats(data);

    }

  }

  catch (error) {

    console.error(
      "Dashboard Error :",
      error
    );

  }

  finally {

    setLoading(false);

  }

}, []);

/* ==========================================
   REALTIME LISTENER
========================================== */

useEffect(() => {

  loadDashboard();

  const user = auth.currentUser;

  if (!user) {

    setLoading(false);

    return;

  }

  const documentsQuery = query(

    collection(db, "documents"),

    where("uid", "==", user.uid)

  );

  let refreshTimer = null;
  const refreshDashboard = () => {
    // Coalesce rapid Firebase/local events into one refresh.
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      loadDashboard();
    }, 180);
  };

  const unsubscribe = onSnapshot(

    documentsQuery,

    refreshDashboard,

    (error) => {

      console.error(
        "Realtime Error :",
        error
      );

    }

  );

  /* Refresh after Upload/Delete/Favorite */

  window.addEventListener(
    "documentsUpdated",
    refreshDashboard
  );

  const handleStorageDetails = () => setShowStorageDetails(true);
  window.addEventListener("openStorageDetails", handleStorageDetails);

  return () => {

    unsubscribe();
    window.clearTimeout(refreshTimer);

    window.removeEventListener(
      "documentsUpdated",
      refreshDashboard
    );
    window.removeEventListener("openStorageDetails", handleStorageDetails);

  };

}, [loadDashboard]);

/* ==========================================
   LOADING
========================================== */

if (loading) {

  return <Loading />;

}

return (

<div className="dashboard">

  {/* Sidebar */}

  <Sidebar />

  {/* Main Content */}

  <main className="dashboard-content">

    {/* Topbar */}

    <Topbar />

    {/* Hero */}

    <DashboardHero stats={stats} />

    {/* ======================================
        DASHBOARD OVERVIEW
    ======================================= */}

    <section className="dashboard-section">

      <div className="section-title">

        <div>

          <h2>Dashboard Overview</h2>

          <p>
            Live overview of your Digital Vault
          </p>

        </div>

      </div>

      <div className="cards-grid">

        <DashboardCard title="Total Documents" value={stats.totalDocuments} icon={<FaFileAlt />} onClick={() => navigate("/documents")} />

        <DashboardCard title="Favorites" value={stats.favoriteDocuments} icon={<FaStar />} onClick={() => navigate("/favorites")} />

        <DashboardCard title="Storage Used" value={stats.formattedStorage} icon={<FaDatabase />} onClick={openStorageDetails} />

        <DashboardCard title="Categories" value={Object.keys(stats.categories || {}).length} icon={<FaFolderOpen />} onClick={() => navigate("/documents")} />

      </div>

    </section>

    {/* ======================================
        STORAGE CARD
    ======================================= */}

    <section className="dashboard-section">

      <div
        className="storage-card storage-card-clickable"
        role="button"
        tabIndex={0}
        aria-label="Open storage details"
        onClick={openStorageDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openStorageDetails();
          }
        }}
      >

        <div className="storage-header">

          <div>

            <h3>Cloudinary Storage</h3>

            <p>
              Storage calculated from uploaded files
            </p>

          </div>

          <span

            className="storage-badge"

            style={{

              background: stats.storageColor,

              color: "#fff"

            }}

          >

            {stats.storageHealth}

          </span>

        </div>

        <div className="storage-progress">

          <div

            className="storage-fill"

            style={{

              width: `${stats.storagePercent}%`,

              background: stats.storageColor

            }}

          />

        </div>

        <div className="storage-info">

          <span>

            Used

            <b>

              {" "}

              {stats.formattedStorage}

            </b>

          </span>

          <span>

            Remaining

            <b>

              {" "}

              {stats.formattedRemaining}

            </b>

          </span>

        </div>

        <div className="storage-percent">
          {Number(stats.storagePercent || 0).toFixed(2)}% Used
        </div>

        <div className="storage-card-action">Tap to view detailed storage</div>

      </div>

    </section>

    {/* ======================================
        UPLOAD SECTION
    ======================================= */}

    <section className="dashboard-section">

      <div className="section-title">

        <div>

          <h2>

            Upload Documents

          </h2>

          <p>

            Upload files directly to Cloudinary

          </p>

        </div>

      </div>

      <UploadDocument />

    </section>

        {/* ======================================
        ANALYTICS
    ======================================= */}

    <section className="dashboard-section">

      <div className="section-title">

        <div>

          <h2>Analytics</h2>

          <p>
            Realtime upload and category analytics
          </p>

        </div>

      </div>

      <div className="chart-grid">

        <UploadChart

          documents={stats.documents}

          weeklyUploads={stats.weeklyUploads}

          monthlyUploads={stats.monthlyUploads}

        />

        <CategoryChart

          categoryStats={stats.categoryStats}

          fileTypes={stats.fileTypes}

        />

      </div>

    </section>

    {/* ======================================
        RECENT DOCUMENTS
    ======================================= */}

    <section className="dashboard-section">

      <div className="section-title">

        <div>

          <h2>Recent Documents</h2>

          <p>
            Recently uploaded files from Cloudinary
          </p>

        </div>

      </div>

      <RecentDocuments

        documents={stats.recentDocuments}

      />

    </section>

    {/* ======================================
        AI ASSISTANT
    ======================================= */}

    <section className="dashboard-section" id="ai-assistant">

      <div className="section-title">

        <div>

          <h2>AI Assistant</h2>

          <p>
            Search and manage documents intelligently
          </p>

        </div>

      </div>

      <AIAssistant />

    </section>

    {showStorageDetails && (
      <StorageDetails
        stats={stats}
        onClose={closeStorageDetails}
      />
    )}

    {/* ======================================
        FOOTER
    ======================================= */}

    <footer className="dashboard-footer">

      <div className="footer-left">

        <h3 className="dashboard-brand">
          <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" />
          <span>Digital Vault</span>
        </h3>

        <p>

          Firebase Authentication • Firestore • Cloudinary • React • AI Assistant

        </p>

        <span className="dashboard-version" title="Application version">
          v{__APP_VERSION__}
        </span>

      </div>

      <div className="footer-right">

        <span>

          © {new Date().getFullYear()}

          {" "}

          Digital Vault

        </span>

      </div>

    </footer>

  </main>

</div>

);

}

export default Dashboard;