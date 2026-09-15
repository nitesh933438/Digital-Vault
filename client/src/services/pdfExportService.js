import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatSize = (bytes = 0) => {
  const n = Math.max(0, Number(bytes) || 0);
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(2)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
};

const dateValue = (value) => {
  if (!value) return "—";
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value, withTime = false) => {
  const date = dateValue(value);
  return date ? date.toLocaleString(undefined, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }) : "—";
};

const fileType = (doc = {}) => {
  const raw = String(doc.fileType || doc.mimeType || doc.type || doc.fileName || "").toLowerCase();
  const name = String(doc.fileName || "").toLowerCase();
  if (raw.includes("pdf") || name.endsWith(".pdf")) return "PDF";
  if (raw.includes("image") || /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)$/.test(name)) return "Images";
  if (raw.includes("video") || /\.(mp4|mov|avi|mkv|webm|m4v)$/.test(name)) return "Videos";
  if (raw.includes("audio") || /\.(mp3|wav|aac|m4a|ogg|flac)$/.test(name)) return "Audio";
  if (raw.includes("word") || raw.includes("document") || /\.(doc|docx|odt|rtf|txt)$/.test(name)) return "Documents";
  if (raw.includes("sheet") || raw.includes("excel") || /\.(xls|xlsx|csv|ods)$/.test(name)) return "Spreadsheets";
  if (raw.includes("presentation") || raw.includes("powerpoint") || /\.(ppt|pptx|odp)$/.test(name)) return "Presentations";
  if (raw.includes("zip") || raw.includes("archive") || /\.(zip|rar|7z|tar|gz)$/.test(name)) return "Archives";
  return "Other";
};

const cleanUser = (user = {}) => ({
  name: user.displayName || user.name || user.email?.split("@")[0] || "Vault User",
  email: user.email || "—",
  uid: user.uid || "—",
  role: user.role || "User",
  createdAt: user.metadata?.creationTime || user.createdAt,
});

export const exportPDF = (documents = [], user = null) => {
  if (!documents.length) throw new Error("There are no documents to export.");

  const owner = cleanUser(user || {});
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const pageWidth = 210;
  const primary = [37, 99, 235];
  const dark = [25, 35, 55];
  const muted = [100, 110, 125];
  const totalSize = documents.reduce((sum, d) => sum + Math.max(0, Number(d.size) || 0), 0);
  const favorites = documents.filter((d) => d.favorite).length;
  const categoryMap = {};
  const typeMap = {};
  documents.forEach((d) => {
    const size = Math.max(0, Number(d.size) || 0);
    const category = String(d.category || "General").trim() || "General";
    const type = fileType(d);
    categoryMap[category] = (categoryMap[category] || 0) + size;
    typeMap[type] = (typeMap[type] || 0) + size;
  });

  pdf.setFillColor(...primary);
  pdf.rect(0, 0, pageWidth, 39, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Digital Vault", margin, 15);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Secure personal document report", margin, 23);
  pdf.text(`Generated ${formatDate(new Date(), true)}`, pageWidth - margin, 23, { align: "right" });
  pdf.setFontSize(8);
  pdf.text(`Report scope: ${owner.name}`, margin, 31);

  pdf.setTextColor(...dark);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Account Details", margin, 51);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text(`Name: ${owner.name}`, margin, 59);
  pdf.text(`Email: ${owner.email}`, margin, 66);
  pdf.text(`User ID: ${owner.uid}`, margin, 73);
  pdf.text(`Role: ${owner.role}`, margin, 80);
  pdf.text(`Account created: ${formatDate(owner.createdAt)}`, margin + 95, 59);
  pdf.text(`Report generated: ${formatDate(new Date(), true)}`, margin + 95, 66);
  pdf.text(`App version: ${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "—"}`, margin + 95, 73);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Vault Summary", margin, 94);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text(`Total documents: ${documents.length}`, margin, 102);
  pdf.text(`Favorites: ${favorites}`, margin + 48, 102);
  pdf.text(`Total size: ${formatSize(totalSize)}`, margin + 90, 102);

  let y = 111;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Storage by file type", margin, y);
  pdf.setFont("helvetica", "normal");
  y += 6;
  Object.entries(typeMap).sort((a,b)=>b[1]-a[1]).forEach(([type, bytes]) => {
    pdf.text(`${type}: ${formatSize(bytes)}`, margin, y);
    y += 5;
  });
  pdf.text("Storage by category", margin + 75, 117);
  y = 123;
  Object.entries(categoryMap).sort((a,b)=>b[1]-a[1]).slice(0, 8).forEach(([category, bytes]) => {
    pdf.text(`${category}: ${formatSize(bytes)}`, margin + 75, y);
    y += 5;
  });

  const tableStart = Math.max(y + 7, 151);
  const rows = documents.map((doc) => [
    doc.fileName || "Untitled",
    owner.name,
    doc.category || "General",
    fileType(doc),
    formatSize(doc.size),
    formatDate(doc.createdAt),
    doc.favorite ? "Yes" : "No",
  ]);

  autoTable(pdf, {
    startY: tableStart,
    margin: { left: margin, right: margin },
    head: [["File Name", "Owner", "Category", "Type", "Size", "Uploaded", "Favorite"]],
    body: rows,
    theme: "grid",
    styles: { font: "helvetica", fontSize: 7.2, cellPadding: 2.4, overflow: "linebreak", textColor: dark },
    headStyles: { fillColor: primary, textColor: 255, fontStyle: "bold", fontSize: 7.4 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 43 }, 1: { cellWidth: 28 }, 2: { cellWidth: 25 }, 3: { cellWidth: 21 },
      4: { cellWidth: 18 }, 5: { cellWidth: 30 }, 6: { cellWidth: 18 },
    },
  });

  const pageCount = pdf.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...muted);
    pdf.text(`Digital Vault • v${typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "—"}`, margin, 290);
    pdf.text(`Private report • Page ${page} of ${pageCount}`, pageWidth - margin, 290, { align: "right" });
  }

  pdf.save(`Digital-Vault-${owner.name.replace(/[^a-z0-9]+/gi, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
};
