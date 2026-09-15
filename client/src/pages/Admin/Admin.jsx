import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaUsers, FaFileAlt, FaDatabase, FaUserShield, FaSearch, FaBan,
  FaCheckCircle, FaTrash, FaUserPlus, FaUserMinus, FaHome, FaSyncAlt,
  FaSignOutAlt, FaChartPie, FaBars, FaTimes, FaEye, FaDownload, FaBell, FaEnvelope, FaInbox, FaExternalLinkAlt, FaCopy
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { getAllUsers, getAllDocuments, updateUserStatus, updateUserRole, deleteUserProfile, deleteDocumentAsAdmin, getAllNewsletterSubscribers, deleteNewsletterSubscriber, getAllContactMessages, updateContactMessageStatus, deleteContactMessage } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_EMAIL } from "../../services/authService";
import { createAdminNotification } from "../../services/notificationService";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import "./Admin.css";

const fmt = (bytes) => {
  const n = Number(bytes || 0);
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), u.length - 1);
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
};
const isPrimary = (u) => String(u?.email || "").trim().toLowerCase() === ADMIN_EMAIL;

export default function Admin() {
  const { isAdmin, isRootAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [notificationTarget, setNotificationTarget] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [replyBody, setReplyBody] = useState("");

  const load = async () => {
    try {
      setBusy(true);
      const results = await Promise.allSettled([getAllUsers(), getAllDocuments(), getAllNewsletterSubscribers(), getAllContactMessages()]);
      const [u, d, subs, messages] = results;
      if (u.status === "fulfilled") setUsers(u.value); else console.error("Users load failed", u.reason);
      if (d.status === "fulfilled") setDocs(d.value); else console.error("Documents load failed", d.reason);
      if (subs.status === "fulfilled") setSubscribers(subs.value); else console.error("Subscribers load failed", subs.reason);
      if (messages.status === "fulfilled") setContactMessages(messages.value); else console.error("Contact messages load failed", messages.reason);
      if (results.some((item) => item.status === "rejected")) {
        toast.error("Some admin data could not be loaded. Please check Firestore rules and refresh.");
      }
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Unable to load admin data. Check Firestore rules.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setReplyMessage(null);
      setSelectedMessage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const storage = useMemo(() => docs.reduce((sum, d) => sum + Number(d.size || d.fileSize || 0), 0), [docs]);
  const unreadMessages = contactMessages.filter((m) => m.status === "new").length;
  const adminCount = users.filter((u) => u.role === "admin" || isPrimary(u)).length;
  const activeUsers = users.filter((u) => u.status !== "disabled").length;
  const disabledUsers = users.filter((u) => u.status === "disabled").length;
  const filteredUsers = users.filter((u) =>
    `${u.name || ""} ${u.email || ""} ${u.role || ""} ${u.status || ""}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.uid, u])), [users]);
  const userNameById = useMemo(() => Object.fromEntries(users.map((u) => [u.uid, u.name || u.email || u.uid])), [users]);
  const filteredDocs = docs.filter((d) =>
    `${d.fileName || d.name || ""} ${d.category || ""} ${d.fileType || d.type || ""} ${d.format || ""} ${d.uid || ""} ${userNameById[d.uid] || ""}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  const changeStatus = async (u) => {
    if (isPrimary(u)) return toast.error("The primary Google administrator is protected.");
    try {
      await updateUserStatus(u.uid, u.status === "disabled" ? "active" : "disabled");
      toast.success(u.status === "disabled" ? "User enabled" : "User disabled");
      await load();
    } catch (e) { toast.error(e.message || "Status update failed"); }
  };

  const changeRole = async (u) => {
    if (isPrimary(u)) return toast.error("The primary Google administrator is protected.");
    const next = u.role === "admin" ? "user" : "admin";
    if (!window.confirm(next === "admin" ? `Make ${u.email || "this user"} an Admin?` : `Remove Admin access from ${u.email || "this user"}?`)) return;
    try {
      await updateUserRole(u.uid, next);
      toast.success(next === "admin" ? "User is now an Admin" : "Admin access removed");
      await load();
    } catch (e) { toast.error(e.message || "Role update failed"); }
  };

  const removeUser = async (u) => {
    if (isPrimary(u)) return toast.error("The primary Google administrator cannot be deleted.");
    if (!window.confirm(`Delete ${u.name || u.email || "this user profile"}? This removes the Firestore profile only; Firebase Authentication remains separate.`)) return;
    try {
      await deleteUserProfile(u.uid);
      toast.success("User profile deleted");
      await load();
    } catch (e) { toast.error(e.message || "Delete failed"); }
  };

  const removeDoc = async (d) => {
    if (!window.confirm(`Remove ${d.fileName || d.name || "this document"}? ${isRootAdmin && d.publicId ? "The Cloudinary file and its record will be deleted." : "Only the document record will be removed."}`)) return;
    try {
      await deleteDocumentAsAdmin(d, isRootAdmin && Boolean(d.publicId));
      toast.success(isRootAdmin && d.publicId ? "Document deleted from Cloudinary and Digital Vault" : "Document record removed");
      await load();
    } catch (e) { toast.error(e.message || "Delete failed"); }
  };

  const openReplyComposer = (message) => {
    if (!message?.email) return toast.error("This message has no sender email.");
    setReplyMessage(message);
    setReplyBody(
      `\n\n--- Original message ---\nFrom: ${message.name || ""} <${message.email}>\nSubject: ${message.subject || "Digital Vault Contact"}\n\n${message.message || ""}`
    );
  };

  const sendReplyByEmail = async () => {
    if (!replyMessage?.email) return toast.error("This message has no sender email.");

    const recipient = String(replyMessage.email).trim();
    const subject = `Re: ${replyMessage.subject || "Digital Vault Contact"}`;
    const body = replyBody.trim();

    // Gmail web compose is used for Gmail recipients because it is reliable
    // in browsers and PWAs. It is opened directly from this click.
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1&tf=1` +
      `&to=${encodeURIComponent(recipient)}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const mailtoUrl =
      `mailto:${recipient}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    const isGmail = /@gmail\.com$/i.test(recipient);
    let opened = false;

    if (isGmail) {
      // Direct navigation is a user-gesture-safe way to open Gmail in browsers
      // and installed PWAs; it avoids popup blockers entirely.
      window.location.assign(gmailUrl);
      opened = true;
    }

    if (!opened) {
      window.location.assign(mailtoUrl);
      opened = true;
    }

    try {
      await updateContactMessageStatus(replyMessage.id, "replied");
      setContactMessages((prev) =>
        prev.map((item) => item.id === replyMessage.id ? { ...item, status: "replied" } : item)
      );
      setSelectedMessage((prev) =>
        prev?.id === replyMessage.id ? { ...prev, status: "replied" } : prev
      );
      setReplyMessage(null);
      toast.success(`Reply opened for ${replyMessage.name || recipient}`);
    } catch (e) {
      toast.error(`Email opened, but status could not be updated: ${e.message || "unknown error"}`);
    }
  };

const copyText = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value || "");
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy is not available in this browser.");
    }
  };

  const sendAdminNotification = async (event) => {
    event.preventDefault();
    const message = notificationText.trim();
    if (!message) return toast.error("Write a notification message first.");
    const recipients = notificationTarget === "all"
      ? users.filter((u) => u.status !== "disabled" && u.uid)
      : users.filter((u) => u.uid === notificationTarget);
    if (!recipients.length) return toast.error("No active recipient found.");
    try {
      setBusy(true);
      await Promise.all(recipients.map((u) => createAdminNotification(u.uid, message, u)));
      setNotificationText("");
      toast.success(`Notification sent to ${recipients.length} user${recipients.length === 1 ? "" : "s"}.`);
    } catch (e) {
      toast.error(e.message || "Could not send notification.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (authLoading) return <div className="admin-loading"><FaUserShield /><span>Checking administrator access…</span></div>;
  if (!isAdmin) return <div className="admin-denied"><FaUserShield /><h2>Admin access required</h2><p>This area is available only to authorized administrators.</p><button onClick={() => navigate("/dashboard")}>Back to Dashboard</button></div>;

  return (
    <div className="admin-layout">
      <div className={`admin-mobile-overlay ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="admin-brand" onClick={() => navigate("/admin")}>
          <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" />
          <div><strong>Digital Vault</strong><span>Admin Center</span></div>
        </div>
        <nav className="admin-nav">
          <button className={tab === "overview" ? "active" : ""} onClick={() => { setTab("overview"); setSearch(""); setMobileOpen(false); }}><FaChartPie /> Overview</button>
          <button className={tab === "users" ? "active" : ""} onClick={() => { setTab("users"); setSearch(""); setMobileOpen(false); }}><FaUsers /> Users</button>
          <button className={tab === "documents" ? "active" : ""} onClick={() => { setTab("documents"); setSearch(""); setMobileOpen(false); }}><FaFileAlt /> Documents</button>
          <button className={tab === "subscribers" ? "active" : ""} onClick={() => { setTab("subscribers"); setSearch(""); setMobileOpen(false); }}><FaEnvelope /> Subscribers</button>
          <button className={tab === "notifications" ? "active" : ""} onClick={() => { setTab("notifications"); setSearch(""); setMobileOpen(false); }}><FaBell /> Notifications</button>
          <button className={tab === "messages" ? "active" : ""} onClick={() => { setTab("messages"); setSearch(""); setMobileOpen(false); }}><FaInbox /> Messages {unreadMessages > 0 && <span className="admin-nav-count">{unreadMessages}</span>}</button>
        </nav>
        <div className="admin-sidebar-bottom">
          <button onClick={() => navigate("/dashboard")}><FaHome /> User Dashboard</button>
          <button onClick={logout}><FaSignOutAlt /> Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Open admin menu">{mobileOpen ? <FaTimes /> : <FaBars />}</button>
            <div><h1>{tab === "overview" ? "Admin Dashboard" : tab === "users" ? "User Management" : tab === "documents" ? "Document Management" : tab === "subscribers" ? "Subscribers" : tab === "messages" ? "Contact Messages" : "Notifications"}</h1><p>Digital Vault administration</p></div>
          </div>
          <div className="admin-account">
            <span className="admin-avatar">{(user?.displayName || "A").charAt(0).toUpperCase()}</span>
            <div><strong>{isRootAdmin ? "Primary Admin" : "Admin"}</strong><small>{user?.email}</small></div>
            <ThemeToggle />
            <button onClick={load} disabled={busy} title="Refresh data" aria-label="Refresh data"><FaSyncAlt className={busy ? "spin" : ""} /></button>
          </div>
        </header>

        <div className="admin-content">
          {tab === "overview" && (
            <>
              <section className="admin-welcome">
                <div><span className="eyebrow">CONTROL CENTER</span><h2>Welcome back, Admin 👋</h2><p>Manage users, documents and access from one dedicated dashboard.</p></div>
                <button onClick={load} disabled={busy}><FaSyncAlt /> {busy ? "Refreshing…" : "Refresh data"}</button>
              </section>
              <section className="admin-stats">
                <div><FaUsers /><span>Total Users</span><b>{users.length}</b><small>{activeUsers} active · {disabledUsers} disabled</small></div>
                <div><FaFileAlt /><span>Total Documents</span><b>{docs.length}</b><small>Across all users</small></div>
                <div><FaDatabase /><span>Vault Storage</span><b>{fmt(storage)}</b><small>Actual uploaded file metadata</small></div>
                <div><FaUserShield /><span>Administrators</span><b>{adminCount}</b><small>1 primary · delegated admins</small></div>
                <div><FaEnvelope /><span>Subscribers</span><b>{subscribers.length}</b><small>Website update subscriptions</small></div>
                <div><FaInbox /><span>Contact Messages</span><b>{contactMessages.length}</b><small>{unreadMessages} new message{unreadMessages === 1 ? "" : "s"}</small></div>
              </section>
              <section className="admin-grid">
                <div className="admin-card"><div className="card-title"><h3>Admin permissions</h3><FaUserShield /></div><p><strong>{ADMIN_EMAIL}</strong> is the protected primary administrator and must use Google Login. Authorized admins can promote or demote other users, manage status, and manage document records.</p></div>
                <div className="admin-card"><div className="card-title"><h3>Quick actions</h3><FaChartPie /></div><div className="quick-actions"><button onClick={() => setTab("users")}><FaUsers /> Manage Users</button><button onClick={() => setTab("documents")}><FaFileAlt /> Manage Documents</button><button onClick={() => setTab("notifications")}><FaBell /> Send Notification</button><button onClick={() => setTab("subscribers")}><FaEnvelope /> View Subscribers</button><button onClick={() => setTab("messages")}><FaInbox /> Contact Messages</button><button onClick={() => navigate("/dashboard")}><FaHome /> Open User App</button></div></div>
              </section>
              <section className="admin-card recent-card"><div className="card-title"><h3>Recent users</h3><button onClick={() => setTab("users")}>View all</button></div>
                {users.slice(0, 5).map(u => <div className="recent-row" key={u.uid}><span className="mini-avatar">{(u.name || u.email || "U").charAt(0).toUpperCase()}</span><div><strong>{u.name || "Unnamed user"}</strong><small>{u.email || "No email"}</small></div><span className={`badge ${u.role === "admin" || isPrimary(u) ? "admin" : ""}`}>{isPrimary(u) ? "Primary Admin" : u.role === "admin" ? "Admin" : "User"}</span></div>)}
                {!users.length && <p className="empty">No users found.</p>}
              </section>
            </>
          )}

          {tab === "users" && (
            <section className="admin-card table-card">
              <div className="section-head"><div><h2>All Users</h2><p>Promote users, control account status, or remove profiles.</p></div><label><FaSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, role…" /></label></div>
              <div className="admin-table-wrap"><table><thead><tr><th>User</th><th>Access</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
                {filteredUsers.map(u => <tr key={u.uid}><td><strong>{u.name || "Unnamed"}</strong><small>{u.email || "—"}</small></td><td><span className={`badge ${u.role === "admin" || isPrimary(u) ? "admin" : ""}`}>{isPrimary(u) ? "Primary Admin" : u.role === "admin" ? "Admin" : "User"}</span></td><td><span className={`badge ${u.status === "disabled" ? "disabled" : ""}`}>{u.status === "disabled" ? "Disabled" : "Active"}</span></td><td>{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td><td className="actions">{!isPrimary(u) && <button onClick={() => changeRole(u)}>{u.role === "admin" ? <FaUserMinus /> : <FaUserPlus />} {u.role === "admin" ? "Remove Admin" : "Make Admin"}</button>}<button disabled={isPrimary(u)} onClick={() => changeStatus(u)}>{u.status === "disabled" ? <FaCheckCircle /> : <FaBan />} {u.status === "disabled" ? "Enable" : "Disable"}</button>{!isPrimary(u) && <button className="danger" onClick={() => removeUser(u)}><FaTrash /> Delete</button>}</td></tr>)}
              </tbody></table>{!filteredUsers.length && <p className="empty">No users found.</p>}</div>
            </section>
          )}

          {tab === "documents" && (
            <section className="admin-card table-card">
              <div className="section-head"><div><h2>All Documents</h2><p>Monitor files stored through Cloudinary.</p></div><label><FaSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search file, owner, category or type…" /></label></div>
              <div className="admin-table-wrap"><table><thead><tr><th>File</th><th>Owner</th><th>Type</th><th>Size</th><th>Actions</th></tr></thead><tbody>
                {filteredDocs.map(d => <tr key={d.id}><td><strong title={d.fileName || d.name || "Untitled"}>{d.fileName || d.name || "Untitled"}</strong><small>{d.category || "Uncategorized"} · {d.resourceType || "cloud"}</small></td><td className="owner-cell">{(() => { const owner = userById[d.uid]; const ownerName = owner?.name || owner?.email || "Unknown user"; const avatar = owner?.photoURL || owner?.photoUrl || ""; return <><span className="owner-avatar">{avatar ? <img src={avatar} alt="" loading="lazy" /> : ownerName.charAt(0).toUpperCase()}</span><div className="owner-copy"><strong>{ownerName}</strong><small>{owner?.email || "No email on profile"}</small><small className="uid">UID: {d.uid || "—"}</small></div></>; })()}</td><td>{d.fileType || d.type || d.format || "—"}</td><td>{fmt(d.size || d.fileSize)}</td><td className="actions"><button disabled={!d.fileUrl && !d.fileURL && !d.url} onClick={() => window.open(d.fileUrl || d.fileURL || d.url, "_blank", "noopener,noreferrer")}><FaEye /> View</button><button disabled={!d.fileUrl && !d.fileURL && !d.url} onClick={() => { const a=document.createElement("a"); a.href=d.fileUrl || d.fileURL || d.url; a.target="_blank"; a.rel="noopener noreferrer"; a.download=d.fileName || "document"; document.body.appendChild(a); a.click(); a.remove(); }}><FaDownload /> Download</button><button className="danger" onClick={() => removeDoc(d)}><FaTrash /> {isRootAdmin && d.publicId ? "Delete" : "Remove Record"}</button></td></tr>)}
              </tbody></table>{!filteredDocs.length && <p className="empty">No documents found.</p>}</div>
            </section>
          )}

          {tab === "subscribers" && (
            <section className="admin-card table-card">
              <div className="section-head"><div><h2>Newsletter Subscribers</h2><p>Manage email addresses submitted through “Stay Updated”.</p></div><label><FaSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscriber email…" /></label></div>
              <div className="admin-table-wrap"><table><thead><tr><th>Email</th><th>Status</th><th>Source</th><th>Subscribed</th><th>Actions</th></tr></thead><tbody>
                {subscribers.filter(s => `${s.email || ""} ${s.status || ""}`.toLowerCase().includes(search.trim().toLowerCase())).map(s => <tr key={s.id}><td><a className="admin-action-link subscriber-email" href={`mailto:${s.email}`}><FaEnvelope /> {s.email}</a></td><td><span className="badge">{s.status || "active"}</span></td><td>{s.source || "website"}</td><td>{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : "—"}</td><td className="actions"><button className="danger" onClick={async () => { if (!window.confirm(`Remove ${s.email} from subscribers?`)) return; try { await deleteNewsletterSubscriber(s.id); toast.success("Subscriber removed"); await load(); } catch (e) { toast.error(e.message || "Could not remove subscriber"); } }}><FaTrash /> Remove</button></td></tr>)}
              </tbody></table>{!subscribers.length && <p className="empty">No newsletter subscribers yet.</p>}</div>
            </section>
          )}

          {replyMessage && (
            <div className="admin-modal-backdrop" onClick={() => setReplyMessage(null)}>
              <div className="admin-modal reply-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-head">
                  <div><span className="eyebrow">Reply to Contact</span><h2>Compose Reply</h2></div>
                  <button type="button" className="icon-btn" onClick={() => setReplyMessage(null)}><FaTimes /></button>
                </div>
                <div className="reply-meta">
                  <div><span>To</span><strong>{replyMessage.name || "Unknown sender"}</strong><a href={`mailto:${replyMessage.email}`}>{replyMessage.email}</a></div>
                  <div><span>Subject</span><strong>Re: {replyMessage.subject || "Digital Vault Contact"}</strong></div>
                </div>
                <label className="reply-editor-label">Your reply<textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={9} placeholder="Write your reply…" /></label>
                <p className="reply-note">Send Reply opens your installed email/Gmail app with the recipient, subject and message pre-filled. The message is marked Replied after the email composer is opened.</p>
                <div className="modal-actions">
                  <button type="button" onClick={sendReplyByEmail} disabled={!replyBody.trim()}><FaEnvelope /> Open Email & Reply</button>
                  <button type="button" className="secondary" onClick={() => copyText(replyMessage.email, "Sender email")}><FaCopy /> Copy Email</button>
                  <button type="button" className="secondary" onClick={() => setReplyMessage(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {selectedMessage && (
            <div className="admin-modal-backdrop" onClick={() => setSelectedMessage(null)}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-head">
                  <div><span className="eyebrow">Contact Message</span><h2>{selectedMessage.subject || "Digital Vault Contact"}</h2></div>
                  <button type="button" className="icon-btn" onClick={() => setSelectedMessage(null)}><FaTimes /></button>
                </div>
                <div className="message-sender-card">
                  <div className="mini-avatar">{(selectedMessage.name || selectedMessage.email || "U").charAt(0).toUpperCase()}</div>
                  <div><strong>{selectedMessage.name || "Unknown sender"}</strong><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></div>
                </div>
                <div className="message-full">{selectedMessage.message || "No message content."}</div>
                <div className="modal-actions">
                  <button type="button" onClick={() => openReplyComposer(selectedMessage)}><FaEnvelope /> Reply by Email</button>
                  <button type="button" onClick={async () => { try { await updateContactMessageStatus(selectedMessage.id, "read"); setSelectedMessage({ ...selectedMessage, status: "read" }); setContactMessages(prev => prev.map(x => x.id === selectedMessage.id ? { ...x, status: "read" } : x)); toast.success("Marked as read"); } catch (e) { toast.error(e.message || "Could not update message"); } }}><FaCheckCircle /> Mark Read</button>
                  <button type="button" className="secondary" onClick={() => setSelectedMessage(null)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {tab === "messages" && (
            <section className="admin-card table-card">
              <div className="section-head"><div><h2>Contact Messages</h2><p>Messages submitted from the public Contact Us form.</p></div><span className="badge admin">{unreadMessages} new</span></div>
              <div className="admin-table-wrap"><table><thead><tr><th>Sender</th><th>Subject & Message</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead><tbody>
                {contactMessages.filter(m => `${m.name || ""} ${m.email || ""} ${m.subject || ""} ${m.message || ""} ${m.status || ""}`.toLowerCase().includes(search.trim().toLowerCase())).map(m => <tr key={m.id}>
                  <td><strong>{m.name || "Unknown"}</strong><small><a href={`mailto:${m.email}`}>{m.email}</a></small></td>
                  <td><strong>{m.subject || "Digital Vault Contact"}</strong><small className="message-preview">{m.message}</small></td>
                  <td><select className="message-status-select" value={m.status || "new"} onChange={async (e) => { try { await updateContactMessageStatus(m.id, e.target.value); setContactMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: e.target.value } : x)); toast.success("Message status updated"); } catch (err) { toast.error(err.message || "Could not update status"); } }}><option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option></select></td>
                  <td>{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "—"}</td>
                  <td className="actions"><button className="admin-action-link" type="button" onClick={async () => { setSelectedMessage(m); if (m.status === "new") { try { await updateContactMessageStatus(m.id, "read"); setContactMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: "read" } : x)); } catch (e) { console.error(e); } } }}><FaEye /> View</button><button className="admin-action-link" type="button" onClick={() => openReplyComposer(m)}><FaEnvelope /> Reply</button><a className="admin-action-link" href={`mailto:${m.email}`} title={`Email ${m.email}`}><FaExternalLinkAlt /> Email</a><button className="danger" type="button" onClick={async () => { if (!window.confirm("Delete this contact message?")) return; try { await deleteContactMessage(m.id); setContactMessages(prev => prev.filter(x => x.id !== m.id)); toast.success("Message deleted"); } catch (e) { toast.error(e.message || "Could not delete message"); } }}><FaTrash /> Delete</button></td>
                </tr>)}
              </tbody></table>{!contactMessages.length && <p className="empty">No contact messages yet.</p>}</div>
            </section>
          )}

          {tab === "notifications" && (
            <section className="admin-card notification-admin-card">
              <div className="section-head"><div><h2>Send System Notification</h2><p>Send an in-app notification to one user or every active user.</p></div><FaBell /></div>
              <form className="admin-notification-form" onSubmit={sendAdminNotification}>
                <label>Recipient<select value={notificationTarget} onChange={(e) => setNotificationTarget(e.target.value)} disabled={busy}>
                  <option value="all">All active users ({activeUsers})</option>
                  {users.filter((u) => u.status !== "disabled").map((u) => <option key={u.uid} value={u.uid}>{u.name || "Unnamed User"} — {u.email || "No email"}</option>)}
                </select></label>
                {notificationTarget !== "all" && (() => {
                  const recipient = users.find((u) => u.uid === notificationTarget);
                  if (!recipient) return null;
                  return <div className="notification-recipient-card">
                    <span className="notification-recipient-avatar">{(recipient.name || recipient.email || "U").charAt(0).toUpperCase()}</span>
                    <div><strong>{recipient.name || "Unnamed User"}</strong><a href={`mailto:${recipient.email || ""}`}>{recipient.email || "No email available"}</a></div>
                    {recipient.email && <button type="button" className="icon-copy-btn" onClick={() => copyText(recipient.email, "Email")} title="Copy email"><FaCopy /></button>}
                  </div>;
                })()}
                <label>Message<textarea value={notificationText} onChange={(e) => setNotificationText(e.target.value)} maxLength={500} rows={6} placeholder="Write an important message for the selected user(s)…" disabled={busy} /></label>
                <p className="notification-note">In-app notifications appear instantly in the user’s Digital Vault notification center. For a direct Gmail/email message, select one user and use “Email User”.</p>
                <div className="notification-form-footer"><small>{notificationText.length}/500</small><div className="notification-admin-actions"><button type="submit" disabled={busy || !notificationText.trim()}><FaBell /> {busy ? "Sending…" : "Send Notification"}</button>{notificationTarget !== "all" && (() => { const recipient = users.find((u) => u.uid === notificationTarget); if (!recipient?.email) return null; const href = `mailto:${recipient.email}?subject=${encodeURIComponent("Digital Vault Notification")}&body=${encodeURIComponent(notificationText.trim())}`; return <button type="button" className="admin-email-user-btn" onClick={() => { window.location.assign(href); }}><FaEnvelope /> Email {recipient.name || recipient.email}</button>; })()}</div></div>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
