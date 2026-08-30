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

import { useState, useCallback, useRef } from "react";
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
  ChevronRight,
  Check,
  AlertCircle,
  File,
  SplitSquareVertical,
  MoveVertical,
  Merge,
  X,
  ArrowDownToLine,
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
}

/** Operation tabs available in the PDF manager */
type Operation = "merge" | "split" | "arrange";

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
/*                                MAIN PAGE                                  */
/* -------------------------------------------------------------------------- */

export default function PDFManagerPage() {
  // Track which operation tab is active (defaults to merge)
  const [activeTab, setActiveTab] = useState<Operation>("merge");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---- Top navigation bar with back link and operation tabs ---- */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: back button + title */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </a>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <span className="font-semibold text-sm">PDF Manager</span>
              </div>
            </div>

            {/* Right: operation tabs */}
            <nav className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {([
                { id: "merge" as Operation, label: "Merge", icon: Merge },
                { id: "split" as Operation, label: "Split", icon: SplitSquareVertical },
                { id: "arrange" as Operation, label: "Arrange", icon: MoveVertical },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ---- Render the active operation view ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "merge" && <MergeView />}
        {activeTab === "split" && <SplitView />}
        {activeTab === "arrange" && <ArrangeView />}
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
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

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
        });
      } catch {
        setError(`Failed to read "${file.name}". It may be corrupted.`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  /** Handle drag-and-drop events on the drop zone */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) loadFiles(e.dataTransfer.files);
  };

  /** Remove a file from the list by its ID */
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  /** Get the display list — either sorted or in original order */
  const displayFiles = (() => {
    if (sortOrder === "asc") return [...files].sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "desc") return [...files].sort((a, b) => b.name.localeCompare(a.name));
    return files;
  })();

  /** Toggle between A-Z, Z-A, and original order */
  const cycleSort = () => {
    setSortOrder((prev) => (prev === "none" ? "asc" : prev === "asc" ? "desc" : "none"));
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

      const mergedBytes = await mergedDoc.save();
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
      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Merged PDF downloaded successfully!</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
          isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        }`}>
          <Upload className="h-5.5 w-5.5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {isDragging ? "Drop PDF files here" : "Drag & drop PDF files here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => e.target.files && loadFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list + merge controls */}
      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{files.length} file{files.length !== 1 ? "s" : ""}</span>
              <span className="text-xs text-muted-foreground">
                ({files.reduce((acc, f) => acc + f.pageCount, 0)} total pages)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort toggle button */}
              <button
                onClick={cycleSort}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOrder === "none" && "Sort"}
                {sortOrder === "asc" && (
                  <><ArrowDown className="h-3 w-3" /> A-Z</>
                )}
                {sortOrder === "desc" && (
                  <><ArrowUp className="h-3 w-3" /> Z-A</>
                )}
              </button>

              {/* Add more files button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add Files
              </button>
            </div>
          </div>

          {/* Scrollable file list */}
          <div className="border border-border rounded-xl divide-y divide-border bg-card">
            {displayFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <File className="h-4 w-4 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.pageCount} page{file.pageCount !== 1 ? "s" : ""} · {formatSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Merge action button */}
          <div className="flex justify-end">
            <button
              onClick={handleMerge}
              disabled={files.length < 2 || processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Merge {files.length} Files
                </>
              )}
            </button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        const newBytes = await newDoc.save();
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

          const newBytes = await newDoc.save();
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
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Downloaded successfully!</span>
        </div>
      )}

      {/* Upload zone — shown when no file is loaded */}
      {!pdfFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="h-5.5 w-5.5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop or click to select a PDF</p>
            <p className="text-xs text-muted-foreground mt-1">Only one file for splitting</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Loaded file info bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pdfFile.pageCount} pages · {formatSize(pdfFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPdfFile(null); setSelectedPages(new Set()); setRangeInput(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Replace
              </button>
            </div>
          </div>

          {/* Range input for quick page selection */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-3,5,8-10"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={applyRange}
              className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Apply
            </button>
            <button
              onClick={selectAll}
              className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              All
            </button>
          </div>

          {/* Page grid — clickable page boxes */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: pdfFile.pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  selectedPages.has(i)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5 mb-1" />
                {i + 1}
              </button>
            ))}
          </div>

          {/* Selected count + download button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedPages.size} of {pdfFile.pageCount} pages selected
            </span>
            <button
              onClick={handleSplit}
              disabled={selectedPages.size === 0 || processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4" />
                  Download {selectedPages.size} Page{selectedPages.size !== 1 ? "s" : ""}
                </>
              )}
            </button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const newBytes = await newDoc.save();
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
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>Arranged PDF downloaded successfully!</span>
        </div>
      )}

      {/* Upload zone — shown when no file is loaded */}
      {!pdfFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
        >
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="h-5.5 w-5.5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop or click to select a PDF</p>
            <p className="text-xs text-muted-foreground mt-1">Reorder pages via drag-and-drop</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileLoad(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* File info bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pdfFile.pageCount} pages · {formatSize(pdfFile.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetOrder}
                disabled={isOriginalOrder}
                className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Reset Order
              </button>
              <button
                onClick={() => { setPdfFile(null); setPageOrder([]); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Replace
              </button>
            </div>
          </div>

          {/* Compact draggable page grid */}
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
                    : "border-border hover:border-primary/30 bg-card hover:bg-muted/40"
                }`}
              >
                {/* New position number (top-left badge) */}
                <span className="absolute top-1 left-1.5 h-4 w-4 flex items-center justify-center rounded bg-muted text-[9px] font-bold text-muted-foreground">
                  {currentIndex + 1}
                </span>

                {/* Drag handle (top-right) */}
                <GripVertical className="absolute top-1 right-1.5 h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />

                {/* Page icon + original page number */}
                <FileText className="h-4 w-4 text-red-500 mt-2" />
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

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isOriginalOrder || processing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Arranged PDF
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
