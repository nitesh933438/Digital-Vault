import { saveAs } from "file-saver";

const escapeCSV = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const formatSize = (bytes = 0) => {
  const n = Math.max(0, Number(bytes) || 0);
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
};

export const exportCSV = (documents = [], user = null) => {
  if (!documents.length) throw new Error("There are no documents to export.");
  const ownerName = user?.displayName || user?.name || user?.email?.split("@")[0] || "Vault User";
  const ownerEmail = user?.email || "";
  const ownerUid = user?.uid || "";
  const headers = ["File Name", "Owner", "Owner Email", "Owner UID", "Category", "Type", "Size", "Uploaded", "Favorite"];
  const rows = documents.map((item) => [
    item.fileName || "Untitled", ownerName, ownerEmail, ownerUid,
    item.category || "General", item.fileType || item.type || item.format || "Unknown",
    formatSize(item.size), item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString() : "",
    item.favorite ? "Yes" : "No",
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\r\n");
  saveAs(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `Digital-Vault-${new Date().toISOString().slice(0,10)}.csv`);
};
