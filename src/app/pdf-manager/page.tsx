/**
 * PDF Manager Dashboard
 *
 * A fully client-side PDF management tool. All operations (merge, split, arrange)
 * run entirely in the browser using pdf-lib — no data ever leaves the user's device.
 *
 * Tabs:
 *   - Merge: Combine multiple PDFs into one
 *   - Split: Extract pages from a PDF into separate files (single range → one PDF,
 *            multiple ranges → ZIP)
 *   - Arrange: Reorder pages within a PDF (compact grid)
 *
 * Download behavior: All operations only download files — they never auto-open.
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
  FileText,
  Upload,
  Trash2,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Download,
  Plus,
  ArrowLeft,
  Check,
  AlertCircle,
  File,
  SplitSquareVertical,
  MoveVertical,
  Merge,
  X,
  ArrowDownToLine,
  ShieldCheck,
  Minimize2,
  Eraser,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              TYPE DEFINITIONS                              */
/* -------------------------------------------------------------------------- */

/** Metadata for a loaded PDF file, used across all operations */
interface PDFFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  data: Uint8Array;
  /** Blob URL of a one-page subset PDF (first page) used as a preview thumbnail */
  thumbUrl?: string;
}

/** Operation tabs available in the PDF manager */
type Operation = "merge" | "split" | "arrange" | "compress";

/* -------------------------------------------------------------------------- */
/*                              HELPER UTILITIES                              */
/* -------------------------------------------------------------------------- */

/** Generate a short unique ID for tracking files */
const uid = () => Math.random().toString(36).slice(2, 9);

/** Format bytes into human-readable size (KB, MB, etc.) */
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

/** Read a File object into a Uint8Array */
const readFileBuffer = (file: File): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

/** Convert Uint8Array to Blob safely for TypeScript compatibility */
const uint8ToBlob = (data: Uint8Array, type: string): Blob =>
  new Blob([data.buffer as ArrayBuffer], { type });

/**
 * Build a lightweight one-page PDF containing only the first page of a larger
 * PDF, then return a blob URL for it. Browsers render this natively inside
 * <object> tags, giving a real first-page preview without any extra dependency.
 */
const makeThumbnail = async (data: Uint8Array): Promise<string> => {
  const src = await PDFDocument.load(data, { ignoreEncryption: true });
  const thumb = await PDFDocument.create();
  if (src.getPageCount() > 0) {
    const [page] = await thumb.copyPages(src, [0]);
    thumb.addPage(page);
  }
  const bytes = await thumb.save({ useObjectStreams: true });
  return URL.createObjectURL(uint8ToBlob(bytes, "application/pdf"));
};

/**
 * Trigger a browser download for a Blob. Only downloads — never auto-opens.
 * Uses a hidden <a> element with the `download` attribute set.
 */
const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/* -------------------------------------------------------------------------- */
/*                           SHARED UI COMPONENTS                              */
/* -------------------------------------------------------------------------- */

/** Consistent success / error banner with a dismiss button. */
function StatusBanner({ kind, children, onClose }: {
  kind: "error" | "success";
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const isError = kind === "error";
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
      isError
        ? "bg-destructive/10 text-destructive border-destructive/20"
        : "bg-success/10 text-success border-success/20"
    }`}>
      {isError ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Check className="h-4 w-4 flex-shrink-0" />
      )}
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto cursor-pointer" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Gradient hero header shown at the top of every tool with a privacy chip. */
function ViewHero({ icon: Icon, title, subtitle }: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.12] via-card to-card p-5 sm:p-6">
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-card border border-primary/20 text-primary flex items-center justify-center shadow-sm shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold sm:text-lg leading-tight">{title}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{subtitle}</p>
          </div>
        </div>
        <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-medium border border-success/20 flex-shrink-0">
          <ShieldCheck className="h-3.5 w-3.5" />
          100% in-browser
        </span>
      </div>
    </div>
  );
}

/**
 * Unified drag-&-drop upload zone. Owns its file input (or uses the one you
 * pass in via `inputRef`), handles drag-state highlighting and keyboard access.
 */
function DropZone({ onFiles, multiple = false, title, subtitle, inputRef }: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? internalRef;
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const pick = (list: FileList | null) => {
    if (list && list.length > 0) onFiles(Array.from(list));
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ref.current?.click();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDragging(false);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);
        pick(e.dataTransfer.files);
      }}
      className={`relative flex flex-col items-center justify-center gap-3 p-10 sm:p-14 min-h-[220px] rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer outline-none ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
      }`}
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
        isDragging ? "bg-primary/15 text-primary scale-110" : "bg-card text-primary border border-border shadow-sm"
      }`}>
        <Upload className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">
          {isDragging ? "Drop it here" : (title ?? "Drag & drop PDF files here")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle ?? (
            <>
              <span className="text-primary font-medium underline underline-offset-2">Click to browse</span>{" "}
              or drop — files never leave this device
            </>
          )}
        </p>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".pdf,application/pdf"
        multiple={multiple}
        onChange={(e) => pick(e.target.files)}
        className="hidden"
      />
    </div>
  );
}

/** Card showing the currently loaded file + optional actions. */
function FileInfoBar({ file, actions }: {
  file: PDFFile;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/15 shrink-0">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span>{file.pageCount} page{file.pageCount !== 1 ? "s" : ""}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{formatSize(file.size)}</span>
          </p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

/** Small secondary button used for toolbar actions (sort, clear, add…). */
function SmallAction({ onClick, disabled, children }: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

/** Primary call-to-action button with a built-in spinner state. */
function PrimaryButton({ onClick, disabled, processing, icon: Icon = Download, children, progressText, className = "" }: {
  onClick: () => void;
  disabled?: boolean;
  processing?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  progressText?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || processing}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer ${className}`}
    >
      {processing ? (
        <>
          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          {progressText}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          {children}
        </>
      )}
    </button>
  );
}

/** Circular gauge showing how much a file was shrunk. */
function SavingsRing({ percent }: { percent: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative h-16 w-16 shrink-0" aria-label={`${percent}% smaller`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" stroke="var(--muted)" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke="var(--success)"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold text-success">
        {percent}%
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MAIN PAGE                                  */
/* -------------------------------------------------------------------------- */

export default function PDFManagerPage() {
  // Track which operation tab is active (defaults to merge)
  const [activeTab, setActiveTab] = useState<Operation>("merge");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---- Top navigation bar with back link, branding and operation tabs ---- */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Left: back link + brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/"
                aria-label="Back to home"
                className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-md shadow-primary/30 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">PDF Manager</p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                  Merge · Split · Arrange · Compress
                </p>
              </div>
            </div>

            {/* Right: operation tabs */}
            <nav className="flex items-center gap-0.5 bg-muted/60 border border-border rounded-xl p-1 overflow-x-auto">
              {([
                { id: "merge" as Operation, label: "Merge", icon: Merge },
                { id: "split" as Operation, label: "Split", icon: SplitSquareVertical },
                { id: "arrange" as Operation, label: "Arrange", icon: MoveVertical },
                { id: "compress" as Operation, label: "Compress", icon: Minimize2 },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ---- Render the active operation view ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {activeTab === "merge" && <MergeView />}
        {activeTab === "split" && <SplitView />}
        {activeTab === "arrange" && <ArrangeView />}
        {activeTab === "compress" && <CompressView />}
      </main>
    </div>
  );
}

/* ========================================================================== */
/*                                MERGE VIEW                                  */
/* ========================================================================== */

/**
 * MergeView - Combine multiple PDF files into a single document.
 *
 * Features:
 *   - Drag & drop zone for adding PDF files
 *   - File input button for manual selection
 *   - Sort files alphabetically (A-Z or Z-A)
 *   - Remove individual files from the list
 *   - Merge all added files into one downloadable PDF
 */
function MergeView() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Load PDF files and extract metadata (page count, name, size) */
  const loadFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    const newFiles: PDFFile[] = [];

    for (const file of Array.from(fileList)) {
      // Only accept PDF files
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError(`"${file.name}" is not a PDF file.`);
        continue;
      }

      try {
        const data = await readFileBuffer(file);
        const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
        newFiles.push({
          id: uid(),
          name: file.name,
          size: file.size,
          pageCount: pdfDoc.getPageCount(),
          data,
          thumbUrl: await makeThumbnail(data),
        });
      } catch {
        setError(`Failed to read "${file.name}". It may be corrupted.`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  /** Remove a file from the list by its ID */
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.thumbUrl) URL.revokeObjectURL(target.thumbUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  /** Free all remaining thumbnail URLs (used by Clear All and on unmount) */
  const clearAll = () => {
    setFiles((prev) => {
      prev.forEach((f) => f.thumbUrl && URL.revokeObjectURL(f.thumbUrl));
      return [];
    });
  };

  // Revoke any leftover thumbnails when the view unmounts
  const filesRef = useRef<PDFFile[]>([]);
  filesRef.current = files;
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => f.thumbUrl && URL.revokeObjectURL(f.thumbUrl));
    };
  }, []);

  /** Get the display list — either sorted or in original order */
  const displayFiles = (() => {
    if (sortOrder === "asc") return [...files].sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "desc") return [...files].sort((a, b) => b.name.localeCompare(a.name));
    return files;
  })();

  /** Toggle between A-Z, Z-A, and original order */
  const cycleSort = () => {
    setSortOrder((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
    setDragFileIndex(null);
    setDragOverFileIndex(null);
  };

  /** Drag-reorder the file list (only in original order) */
  const [dragFileIndex, setDragFileIndex] = useState<number | null>(null);
  const [dragOverFileIndex, setDragOverFileIndex] = useState<number | null>(null);

  const handleFileDragStart = (index: number) => {
    if (sortOrder !== "none") return;
    setDragFileIndex(index);
  };
  const handleFileDragEnter = (index: number) => {
    if (dragFileIndex === null || sortOrder !== "none") return;
    setDragOverFileIndex(index);
  };
  const handleFileDragEnd = () => {
    if (dragFileIndex !== null && dragOverFileIndex !== null && dragFileIndex !== dragOverFileIndex && sortOrder === "none") {
      setFiles((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragFileIndex, 1);
        next.splice(dragOverFileIndex, 0, moved);
        return next;
      });
    }
    setDragFileIndex(null);
    setDragOverFileIndex(null);
  };

  /** Merge all loaded PDFs into a single file and trigger download */
  const handleMerge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        const srcDoc = await PDFDocument.load(file.data);
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedBytes = await mergedDoc.save({ useObjectStreams: true });
      const blob = uint8ToBlob(mergedBytes, "application/pdf");
      triggerDownload(blob, "merged.pdf");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to merge PDFs. One or more files may be corrupted or encrypted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <ViewHero
        icon={Merge}
        title="Merge PDFs"
        subtitle="Combine multiple PDF files into a single document. Drag files to set the exact merge order."
      />

      {/* Status messages */}
      {error && (
        <StatusBanner kind="error" onClose={() => setError(null)}>{error}</StatusBanner>
      )}
      {success && (
        <StatusBanner kind="success">Merged PDF downloaded successfully!</StatusBanner>
      )}

      {/* Drop zone */}
      <DropZone
        inputRef={fileInputRef}
        multiple
        onFiles={loadFiles}
        title="Drag & drop PDF files here"
      />

      {/* File list + merge controls */}
      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <FileText className="h-3 w-3" />
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-muted-foreground">
                {files.reduce((acc, f) => acc + f.pageCount, 0)} pages ·{" "}
                {formatSize(files.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <SmallAction onClick={clearAll}>
                <Eraser className="h-3 w-3" />
                <span className="hidden sm:inline">Clear All</span>
              </SmallAction>

              <SmallAction onClick={cycleSort}>
                {sortOrder === "asc" ? (
                  <ArrowDown className="h-3 w-3" />
                ) : sortOrder === "desc" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowUpDown className="h-3 w-3" />
                )}
                {sortOrder === "asc" ? "A-Z" : sortOrder === "desc" ? "Z-A" : "Sort"}
              </SmallAction>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Files
              </button>
            </div>
          </div>

          {/* Preview grid — drag to reorder merge order */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between px-1 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Merge order
              </p>
              {sortOrder !== "none" && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <GripVertical className="h-3 w-3" />
                  Sorting by name — set Sort to Off to drag files into position
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayFiles.map((file, index) => (
                <div
                  key={file.id}
                  draggable={sortOrder === "none"}
                  onDragStart={() => handleFileDragStart(index)}
                  onDragEnter={() => handleFileDragEnter(index)}
                  onDragEnd={handleFileDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  title={sortOrder === "none" ? "Drag to reorder" : undefined}
                  className={`group relative rounded-xl border bg-card shadow-sm transition-all ${
                    dragFileIndex === index
                      ? "border-primary bg-primary/5 opacity-60 scale-[0.98]"
                      : dragOverFileIndex === index
                      ? "border-primary border-dashed bg-primary/5"
                      : "border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                  } ${sortOrder === "none" ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  {/* Position badge (merge order) */}
                  <span className="absolute top-2 left-2 z-10 h-5 w-5 flex items-center justify-center rounded-md bg-card/90 text-[10px] font-bold text-primary border border-primary/20 shadow-sm">
                    {index + 1}
                  </span>

                  {/* Drag handle */}
                  {sortOrder === "none" && (
                    <GripVertical className="absolute top-2 right-2 z-10 h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  )}

                  {/* Remove */}
                  <button
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove ${file.name}`}
                    className="absolute -top-1.5 -right-1.5 z-20 h-6 w-6 rounded-full grid place-items-center bg-danger text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  {/* First-page preview */}
                  <div className="h-44 rounded-t-xl overflow-hidden bg-muted/30 border-b border-border">
                    {file.thumbUrl ? (
                      <object
                        data={file.thumbUrl}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none select-none"
                        aria-label={`${file.name} first page preview`}
                      >
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <File className="h-5 w-5" />
                        </div>
                      </object>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <File className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {file.pageCount} page{file.pageCount !== 1 ? "s" : ""} · {formatSize(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merge action bar */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-muted/40 to-transparent border border-primary/15">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Drag files to arrange the order — files are merged top-left first.
            </p>
            <PrimaryButton
              onClick={handleMerge}
              disabled={files.length < 2}
              processing={processing}
              progressText="Merging..."
            >
              Merge {files.length} Files
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

/* ========================================================================== */
/*                                SPLIT VIEW                                  */
/* ========================================================================== */

/**
 * SplitView - Extract specific pages from a PDF.
 *
 * Download logic:
 *   - Parses selected pages into contiguous ranges (e.g. 1-3,5,8-10)
 *   - If only ONE contiguous group → downloads a single PDF
 *   - If MULTIPLE groups → bundles each group into a separate PDF inside a ZIP
 */
function SplitView() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /** Load a single PDF file for splitting */
  const handleFileLoad = useCallback(async (file: File) => {
    setError(null);
    setSelectedPages(new Set());
    setRangeInput("");

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    try {
      const data = await readFileBuffer(file);
      const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
      setPdfFile({
        id: uid(),
        name: file.name,
        size: file.size,
        pageCount: pdfDoc.getPageCount(),
        data,
      });
    } catch {
      setError("Failed to read the PDF file.");
    }
  }, []);

  /** Toggle selection of a single page */
  const togglePage = (pageIndex: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageIndex)) next.delete(pageIndex);
      else next.add(pageIndex);
      return next;
    });
  };

  /** Select all pages at once */
  const selectAll = () => {
    if (!pdfFile) return;
    setSelectedPages(new Set(Array.from({ length: pdfFile.pageCount }, (_, i) => i)));
  };

  /** Parse a range string like "1-3,5,8-10" into a set of 0-indexed page numbers */
  const parseRange = (input: string): Set<number> => {
    const pages = new Set<number>();
    if (!pdfFile) return pages;

    const parts = input.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(pdfFile.pageCount, end); i++) {
            pages.add(i - 1);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= pdfFile.pageCount) {
          pages.add(num - 1);
        }
      }
    }
    return pages;
  };

  /** Apply the range input string to the selected pages */
  const applyRange = () => {
    setSelectedPages(parseRange(rangeInput));
  };

  /**
   * Given a sorted array of 0-indexed page numbers, group them into
   * contiguous ranges. Example: [0,1,2,4,7,8,9] → [[0,1,2],[4],[7,8,9]]
   */
  const groupContiguous = (pages: number[]): number[][] => {
    if (pages.length === 0) return [];
    const groups: number[][] = [[pages[0]]];
    for (let i = 1; i < pages.length; i++) {
      const lastGroup = groups[groups.length - 1];
      if (pages[i] === lastGroup[lastGroup.length - 1] + 1) {
        lastGroup.push(pages[i]);
      } else {
        groups.push([pages[i]]);
      }
    }
    return groups;
  };

  /**
   * Handle the split + download:
   *   - One contiguous group → single PDF download
   *   - Multiple groups → ZIP containing one PDF per group
   */
  const handleSplit = async () => {
    if (!pdfFile || selectedPages.size === 0) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const srcDoc = await PDFDocument.load(pdfFile.data);
      const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
      const groups = groupContiguous(sortedPages);
      const baseName = pdfFile.name.replace(/\.pdf$/i, "");

      if (groups.length === 1) {
        // Single contiguous range → one PDF
        const newDoc = await PDFDocument.create();
        const copiedPages = await newDoc.copyPages(srcDoc, groups[0]);
        copiedPages.forEach((page) => newDoc.addPage(page));

        const newBytes = await newDoc.save({ useObjectStreams: true });
        const blob = uint8ToBlob(newBytes, "application/pdf");
        const start = groups[0][0] + 1;
        const end = groups[0][groups[0].length - 1] + 1;
        const fileName = groups[0].length === 1
          ? `${baseName}_page_${start}.pdf`
          : `${baseName}_pages_${start}-${end}.pdf`;
        triggerDownload(blob, fileName);
      } else {
        // Multiple groups → ZIP file
        const zip = new JSZip();
        for (let g = 0; g < groups.length; g++) {
          const group = groups[g];
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, group);
          copiedPages.forEach((page) => newDoc.addPage(page));

const newBytes = await newDoc.save({ useObjectStreams: true });
          const start = group[0] + 1;
          const end = group[group.length - 1] + 1;
          const fileName = group.length === 1
            ? `${baseName}_page_${start}.pdf`
            : `${baseName}_pages_${start}-${end}.pdf`;
          zip.file(fileName, newBytes);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        triggerDownload(zipBlob, `${baseName}_split.zip`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to split the PDF. The file may be corrupted or encrypted.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      <ViewHero
        icon={SplitSquareVertical}
        title="Split PDF"
        subtitle="Extract pages from a PDF. One contiguous range downloads as a single PDF; multiple ranges are bundled into a ZIP."
      />

      {error && (
        <StatusBanner kind="error" onClose={() => setError(null)}>{error}</StatusBanner>
      )}
      {success && (
        <StatusBanner kind="success">Downloaded successfully!</StatusBanner>
      )}

      {/* Upload zone — shown when no file is loaded */}
      {!pdfFile ? (
        <DropZone
          onFiles={(files) => files[0] && handleFileLoad(files[0])}
          title="Drop or click to select a PDF"
          subtitle="One file at a time — then pick the pages to keep"
        />
      ) : (
        <>
          {/* Loaded file info bar */}
          <FileInfoBar
            file={pdfFile}
            actions={
              <button
                onClick={() => { setPdfFile(null); setSelectedPages(new Set()); setRangeInput(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Replace
              </button>
            }
          />

          {/* Range input for quick page selection */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyRange()}
                  placeholder="e.g. 1-3,5,8-10"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <SmallAction onClick={applyRange}>Apply</SmallAction>
                <SmallAction onClick={selectAll}>All</SmallAction>
              </div>
              <p className="text-[11px] text-muted-foreground sm:text-right">
                {selectedPages.size} of {pdfFile.pageCount} pages selected
              </p>
            </div>

            {/* Page grid — clickable page boxes */}
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-3">
              {Array.from({ length: pdfFile.pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => togglePage(i)}
                  aria-pressed={selectedPages.has(i)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    selectedPages.has(i)
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/30 bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {selectedPages.has(i) && (
                    <span className="absolute -top-1.5 -right-1.5 z-10 h-4 w-4 rounded-full bg-primary text-primary-foreground grid place-items-center">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <FileText className="h-3.5 w-3.5 mb-1" />
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Download button */}
          <div className="flex justify-end">
            <PrimaryButton
              onClick={handleSplit}
              disabled={selectedPages.size === 0}
              processing={processing}
              progressText="Splitting..."
              icon={ArrowDownToLine}
            >
              Download {selectedPages.size} Page{selectedPages.size !== 1 ? "s" : ""}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

/* ========================================================================== */
/*                               ARRANGE VIEW                                 */
/* ========================================================================== */

/**
 * ArrangeView - Reorder pages within a PDF using drag-and-drop.
 *
 * Pages are shown in a compact grid. Each cell is draggable and also has
 * arrow buttons for precise reordering.
 */
function ArrangeView() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /** Load a PDF and initialize page order array [0, 1, 2, ...] */
  const handleFileLoad = useCallback(async (file: File) => {
    setError(null);
    setSuccess(false);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    try {
      const data = await readFileBuffer(file);
      const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPdfFile({
        id: uid(),
        name: file.name,
        size: file.size,
        pageCount: count,
        data,
      });
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    } catch {
      setError("Failed to read the PDF file.");
    }
  }, []);

  /** Move a page from one position to another via drag-and-drop */
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragEnterItem = (index: number) => setDragOverIndex(index);

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      setPageOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dragOverIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  /** Move a page up or down by one position using arrow buttons */
  const movePage = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= pageOrder.length) return;

    setPageOrder((prev) => {
      const next = [...prev];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  };

  /** Reset page order to the original sequence */
  const resetOrder = () => {
    if (pdfFile) setPageOrder(Array.from({ length: pdfFile.pageCount }, (_, i) => i));
  };

  /** Save the rearranged PDF with the new page order */
  const handleSave = async () => {
    if (!pdfFile) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const srcDoc = await PDFDocument.load(pdfFile.data);
      const newDoc = await PDFDocument.create();

      // Copy pages in the user-defined order
      const copiedPages = await newDoc.copyPages(srcDoc, pageOrder);
      copiedPages.forEach((page) => newDoc.addPage(page));

      const newBytes = await newDoc.save({ useObjectStreams: true });
      const blob = uint8ToBlob(newBytes, "application/pdf");
      const baseName = pdfFile.name.replace(/\.pdf$/i, "");
      triggerDownload(blob, `${baseName}_arranged.pdf`);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to rearrange the PDF.");
    } finally {
      setProcessing(false);
    }
  };

  /** Check if current order is the same as original */
  const isOriginalOrder = pageOrder.every((val, i) => val === i);

  return (
    <div className="space-y-5">
      <ViewHero
        icon={MoveVertical}
        title="Arrange Pages"
        subtitle="Reorder pages within a PDF with drag-and-drop, or use the arrow buttons for precise control."
      />

      {error && (
        <StatusBanner kind="error" onClose={() => setError(null)}>{error}</StatusBanner>
      )}
      {success && (
        <StatusBanner kind="success">Arranged PDF downloaded successfully!</StatusBanner>
      )}

      {/* Upload zone — shown when no file is loaded */}
      {!pdfFile ? (
        <DropZone
          onFiles={(files) => files[0] && handleFileLoad(files[0])}
          title="Drop or click to select a PDF"
          subtitle="Then drag pages into your preferred order"
        />
      ) : (
        <>
          {/* File info bar */}
          <FileInfoBar
            file={pdfFile}
            actions={
              <>
                <SmallAction onClick={resetOrder} disabled={isOriginalOrder}>
                  <ArrowDownToLine className="h-3 w-3 rotate-180" />
                  Reset Order
                </SmallAction>
                <SmallAction onClick={() => { setPdfFile(null); setPageOrder([]); }}>
                  Replace
                </SmallAction>
              </>
            }
          />

          {/* Compact draggable page grid */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center justify-between px-1 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Page order
              </p>
              <p className="text-[11px] text-muted-foreground">
                {pageOrder.length} page{pageOrder.length !== 1 ? "s" : ""} · drag to reorder
              </p>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {pageOrder.map((originalPageIndex, currentIndex) => (
              <div
                key={`${originalPageIndex}-${currentIndex}`}
                draggable
                onDragStart={() => handleDragStart(currentIndex)}
                onDragEnter={() => handleDragEnterItem(currentIndex)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`group relative flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all cursor-grab active:cursor-grabbing ${
                  dragIndex === currentIndex
                    ? "border-primary bg-primary/5 opacity-60 scale-95"
                    : dragOverIndex === currentIndex
                    ? "border-primary border-dashed bg-primary/5"
                    : "border-border hover:border-primary/30 bg-card hover:bg-muted/50 hover:shadow-sm"
                }`}
              >
                {/* New position number (top-left badge) */}
                <span className="absolute top-1 left-1.5 h-4 w-4 flex items-center justify-center rounded bg-muted text-[9px] font-bold text-muted-foreground">
                  {currentIndex + 1}
                </span>

                {/* Drag handle (top-right) */}
                <GripVertical className="absolute top-1 right-1.5 h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />

                {/* Page icon + original page number */}
                <FileText className="h-4 w-4 text-danger mt-2" />
                <span className="text-[10px] text-muted-foreground">
                  Pg {originalPageIndex + 1}
                </span>

                {/* Arrow buttons for precise reorder */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); movePage(currentIndex, "up"); }}
                    disabled={currentIndex === 0}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ArrowUp className="h-2.5 w-2.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); movePage(currentIndex, "down"); }}
                    disabled={currentIndex === pageOrder.length - 1}
                    className="p-0.5 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ArrowDown className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Save button */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-muted/40 to-transparent border border-primary/15">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Drag pages anywhere — the badge shows each page&rsquo;s new position.
            </p>
            <PrimaryButton
              onClick={handleSave}
              disabled={isOriginalOrder}
              processing={processing}
              progressText="Processing..."
            >
              Download Arranged PDF
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

/* ========================================================================== */
/*                               COMPRESS VIEW                                */
/* ========================================================================== */

/**
 * CompressView - Reduce the file size of a single PDF.
 *
 * Runs entirely in the browser using pdf-lib. It strips unused/redundant
 * objects and re-packs everything into object streams, which typically
 * produces a smaller file. Files never leave the device.
 */
function CompressView() {
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [settings, setSettings] = useState<"screen" | "ebook" | "printer">("ebook");
  const [mode, setMode] = useState<"fast" | "deep">("fast");
  const workerRef = useRef<Worker | null>(null);
  const [download, setDownload] = useState<{ blob: Blob; name: string } | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  /** Lazily create the Ghostscript worker and keep it alive between runs so the
   *  heavy WASM engine (16 MB) is only downloaded + compiled once per page load. */
  const getWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = new Worker("/gs-compress.worker.js");
    workerRef.current = worker;
    return worker;
  }, []);

  /** Kick off a warm-up request as soon as the view mounts so the engine is
   *  already downloaded + compiled by the time the user hits "Compress PDF". */
  useEffect(() => {
    try {
      getWorker().postMessage({ type: "warmup", id: -1 });
    } catch {
      /* non-blocking */
    }
  }, [getWorker]);

  const handleFileLoad = useCallback(async (file: File) => {
    setError(null);
    setSuccess(false);
    setResult(null);
    setDownload(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are accepted.");
      return;
    }

    try {
      const data = await readFileBuffer(file);
      const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
      setPdfFile({
        id: uid(),
        name: file.name,
        size: file.size,
        pageCount: pdfDoc.getPageCount(),
        data,
      });
    } catch {
      setError("Failed to read the PDF file.");
    }
  }, []);

  /** Run the Ghostscript engine in the worker and resolve with the compressed
   *  bytes. The engine instance is cached in the worker, so only the PDF
   *  processing happens per call. */
  const runDeep = useCallback(() => {
    if (!pdfFile) throw new Error("No file selected");
    const id = Math.floor(Math.random() * 1e9);
    let worker: Worker;
    try {
      worker = getWorker();
    } catch {
      throw new Error("Compression engine is not available in this browser.");
    }

    const buffer = pdfFile.data.buffer.slice(
      pdfFile.data.byteOffset,
      pdfFile.data.byteOffset + pdfFile.data.byteLength
    ) as ArrayBuffer;

    return new Promise<Uint8Array>((resolve, reject) => {
      const onMessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.id !== id) return;
        if (msg.type === "progress") {
          setProgress(msg.message);
        } else if (msg.type === "result") {
          worker.removeEventListener("message", onMessage);
          worker.onerror = null;
          resolve(new Uint8Array(msg.data));
        } else if (msg.type === "error") {
          worker.removeEventListener("message", onMessage);
          worker.onerror = null;
          worker.terminate();
          workerRef.current = null;
          reject(new Error(msg.message || "Failed to compress the PDF."));
        }
      };
      const onError = () => {
        worker.removeEventListener("message", onMessage);
        worker.terminate();
        workerRef.current = null;
        reject(new Error("Compression engine failed to load. Please try again."));
      };
      worker.addEventListener("message", onMessage);
      worker.onerror = onError;
      worker.postMessage({ type: "compress", id, data: buffer, settings }, [buffer]);
    });
  }, [pdfFile, settings, getWorker]);

  const handleCompress = useCallback(async () => {
    if (!pdfFile) return;
    setProcessing(true);
    setError(null);
    setSuccess(false);
    setResult(null);

    const showResult = (bytes: Uint8Array) => {
      setProcessing(false);
      setProgress(null);
      setResult({ originalSize: pdfFile.size, compressedSize: bytes.length });
      if (bytes.length < pdfFile.size) {
        const baseName = pdfFile.name.replace(/\.pdf$/i, "");
        const blob = uint8ToBlob(bytes, "application/pdf");
        triggerDownload(blob, `${baseName}_compressed.pdf`);
        setDownload({ blob, name: `${baseName}_compressed.pdf` });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    };

    try {
      if (mode === "deep") {
        setProgress("Running Ghostscript…");
        const bytes = await runDeep();
        showResult(bytes);
        return;
      }

      // Fast path: instant pdf-lib repack.
      setProgress("Repacking…");
      const doc = await PDFDocument.load(pdfFile.data, { ignoreEncryption: true });
      const packed = await doc.save({ useObjectStreams: true });

      // If the repack already shrank the file, we're done.
      if (packed.length < pdfFile.size) {
        showResult(packed);
        return;
      }

      // Otherwise fall through to the real engine (preloaded on mount) which
      // downsamples embedded images — this is where the actual savings come from.
      setProgress("Running Ghostscript…");
      const bytes = await runDeep();
      showResult(bytes);
      return;
    } catch (err) {
      setProcessing(false);
      setProgress(null);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Failed to compress the PDF. Please try again."
      );
    }
  }, [pdfFile, mode, runDeep]);

  const savingsPct =
    result && result.originalSize > 0
      ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
      : 0;

  return (
    <div className="space-y-5">
      <ViewHero
        icon={Minimize2}
        title="Compress PDF"
        subtitle="Shrink file size without leaving your browser. Text stays selectable and image-heavy (scanned) files are downsampled."
      />

      {error && (
        <StatusBanner kind="error" onClose={() => setError(null)}>{error}</StatusBanner>
      )}
      {success && result && (
        <StatusBanner kind="success">Compressed PDF downloaded successfully!</StatusBanner>
      )}

      {!pdfFile ? (
        <DropZone
          onFiles={(files) => files[0] && handleFileLoad(files[0])}
          title="Drop or click to select a PDF"
          subtitle="Reduces file size by removing redundant data and downsampling images"
        />
      ) : (
        <>
          <FileInfoBar
            file={pdfFile}
            actions={
              <button
                onClick={() => { setPdfFile(null); setResult(null); setDownload(null); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Replace
              </button>
            }
          />

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Method
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "fast" as const, label: "Fast", desc: "Instant, auto-upgrades" },
                { id: "deep" as const, label: "Maximum", desc: "Ghostscript engine" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  aria-pressed={mode === opt.id}
                  className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    mode === opt.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Compression level
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "screen" as const, label: "Smallest", desc: "For viewing" },
                { id: "ebook" as const, label: "Recommended", desc: "For reading" },
                { id: "printer" as const, label: "High quality", desc: "For printing" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSettings(opt.id)}
                  aria-pressed={settings === opt.id}
                  className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    settings === opt.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <PrimaryButton
            onClick={handleCompress}
            disabled={processing}
            processing={processing}
            progressText={progress ?? "Compressing..."}
            icon={Minimize2}
            className="w-full sm:w-auto"
          >
            Compress PDF
          </PrimaryButton>

          {result && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <SavingsRing percent={savingsPct} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {savingsPct > 0 ? `${savingsPct}% smaller` : "No size reduction possible"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {savingsPct > 0
                        ? "Your file was compressed — ready to download."
                        : "This PDF is already well compressed."}
                    </p>
                  </div>
                </div>
                {savingsPct > 0 && download && (
                  <PrimaryButton
                    onClick={() => triggerDownload(download.blob, download.name)}
                    className="flex-shrink-0"
                  >
                    Download
                  </PrimaryButton>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Original</p>
                  <p className="text-sm font-bold mt-1">{formatSize(result.originalSize)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Compressed</p>
                  <p className="text-sm font-bold mt-1">{formatSize(result.compressedSize)}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-[10px] uppercase tracking-wide text-success">Saved</p>
                  <p className="text-sm font-bold mt-1 text-success">
                    {formatSize(Math.max(0, result.originalSize - result.compressedSize))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Fast</span> instantly re-packs the PDF; if the file cannot be
            shrunk that way it automatically switches to the <span className="font-semibold text-foreground">Maximum</span> engine, which
            runs a browser build of Ghostscript in the background — your PDF never leaves this device. Text stays
            selectable and searchable, and image-heavy (scanned) files are downsampled to shrink significantly.
          </p>
        </>
      )}
    </div>
  );
}
