"use client";

import { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Calculator,
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type Workbook = {
  fileName: string;
  sheetName: string;
  headers: string[];
  rows: string[][];
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function parseCsv(source: string) {
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", "\t", ";"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"' && value.length === 0) {
      quoted = true;
    } else if (char === delimiter) {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function columnIndex(reference: string) {
  const letters = /^([A-Z]+)/i.exec(reference)?.[1]?.toUpperCase() ?? "A";
  return [...letters].reduce((number, letter) => number * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function columnName(index: number) {
  let current = index + 1;
  let result = "";
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}

function parseXml(xml: string, label: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) throw new Error(`This workbook has an invalid ${label} file.`);
  return document;
}

function textContent(element: Element | null) {
  return element?.textContent ?? "";
}

async function readXlsx(file: File): Promise<Workbook> {
  const archive = await JSZip.loadAsync(file);
  const workbookFile = archive.file("xl/workbook.xml");
  const relationshipsFile = archive.file("xl/_rels/workbook.xml.rels");
  if (!workbookFile || !relationshipsFile) throw new Error("This file does not contain a readable Excel workbook.");

  const [workbookXml, relationshipsXml, sharedStringsXml] = await Promise.all([
    workbookFile.async("text"),
    relationshipsFile.async("text"),
    archive.file("xl/sharedStrings.xml")?.async("text") ?? Promise.resolve(""),
  ]);
  const workbookDoc = parseXml(workbookXml, "workbook");
  const relationshipsDoc = parseXml(relationshipsXml, "workbook relationships");
  const firstSheet = workbookDoc.getElementsByTagName("sheet")[0];
  if (!firstSheet) throw new Error("This workbook has no worksheets.");

  const relationId = firstSheet.getAttribute("r:id") ?? firstSheet.getAttribute("id");
  const relationship = [...relationshipsDoc.getElementsByTagName("Relationship")]
    .find((item) => item.getAttribute("Id") === relationId);
  const target = relationship?.getAttribute("Target");
  if (!target) throw new Error("The first worksheet could not be located.");
  const sheetPath = target.startsWith("/")
    ? target.slice(1)
    : `xl/${target}`.split("/").reduce<string[]>((parts, segment) => {
      if (segment === "..") parts.pop();
      else if (segment !== ".") parts.push(segment);
      return parts;
    }, []).join("/");
  const sheetFile = archive.file(sheetPath);
  if (!sheetFile) throw new Error("The first worksheet is missing from this workbook.");

  const sharedStrings = sharedStringsXml
    ? [...parseXml(sharedStringsXml, "shared strings").getElementsByTagName("si")]
        .map((item) => [...item.getElementsByTagName("t")].map((node) => node.textContent ?? "").join(""))
    : [];
  const sheetDoc = parseXml(await sheetFile.async("text"), "worksheet");
  const sheetData = sheetDoc.getElementsByTagName("sheetData")[0];
  if (!sheetData) throw new Error("The first worksheet contains no row data.");

  const rows = [...sheetData.getElementsByTagName("row")].map((rowElement) => {
    const cells: string[] = [];
    for (const cell of [...rowElement.getElementsByTagName("c")]) {
      const reference = cell.getAttribute("r") ?? "A1";
      const index = columnIndex(reference);
      const type = cell.getAttribute("t");
      let value: string;
      if (type === "inlineStr") {
        value = [...cell.getElementsByTagName("t")].map((node) => node.textContent ?? "").join("");
      } else {
        value = textContent(cell.getElementsByTagName("v")[0] ?? null);
        if (type === "s") value = sharedStrings[Number(value)] ?? "";
        if (type === "b") value = value === "1" ? "TRUE" : "FALSE";
      }
      cells[index] = value;
    }
    return cells;
  });

  return workbookFromRows(file.name, firstSheet.getAttribute("name") || "Sheet1", rows);
}

function workbookFromRows(fileName: string, sheetName: string, rows: string[][]): Workbook {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const sourceHeaders = rows[0] ?? [];
  const headers = Array.from({ length: width }, (_, index) => sourceHeaders[index]?.trim() || `Column ${index + 1}`);
  const body = rows.slice(1).map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ""));
  return { fileName, sheetName, headers, rows: body };
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function workbookXml(workbook: Workbook, headers: string[], rows: string[][]) {
  const sheetRows = [headers, ...rows];
  const rowXml = sheetRows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndexValue) => {
      if (!value) return "";
      const reference = `${columnName(columnIndexValue)}${rowIndex + 1}`;
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");
  const safeSheetName = workbook.sheetName.replace(/[\\/?*\[\]:]/g, " ").slice(0, 31) || "Sheet1";

  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEscape(safeSheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
  zip.file("xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`);
  return zip;
}

function csvEscape(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function numericValue(value: string) {
  const normalized = value.replace(/[₹$,\s]/g, "");
  if (!normalized || !/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

export function MsExcelTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const quantityColumn = useMemo(() => workbook?.headers.findIndex((header) => /\b(qty|quantity|nos|number of units)\b/i.test(header.trim())) ?? -1, [workbook]);
  const rateColumn = useMemo(() => workbook?.headers.findIndex((header) => /\b(rate|unit rate|basic rate)\b/i.test(header.trim())) ?? -1, [workbook]);
  const hasCalculatedAmount = quantityColumn >= 0 && rateColumn >= 0;
  const displayHeaders = workbook ? [...workbook.headers, ...(hasCalculatedAmount ? ["Calculated Amount"] : [])] : [];
  const filteredRows = useMemo(() => {
    if (!workbook) return [];
    const query = search.trim().toLowerCase();
    return workbook.rows.map((row, index) => ({ row, index })).filter(({ row }) =>
      !query || row.some((cell) => cell.toLowerCase().includes(query)),
    );
  }, [workbook, search]);

  const totals = useMemo(() => {
    if (!workbook) return [];
    return displayHeaders.map((_, columnIndexValue) => {
      let sum = 0;
      let count = 0;
      for (const row of workbook.rows) {
        const value = hasCalculatedAmount && columnIndexValue === workbook.headers.length
          ? (numericValue(row[quantityColumn] ?? "") ?? 0) * (numericValue(row[rateColumn] ?? "") ?? 0)
          : numericValue(row[columnIndexValue] ?? "");
        if (value !== null) {
          sum += value;
          count += 1;
        }
      }
      return count ? sum : null;
    });
  }, [workbook, displayHeaders, hasCalculatedAmount, quantityColumn, rateColumn]);

  const openFile = async (file?: File) => {
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose a workbook smaller than 25 MB.");
      return;
    }
    setBusy(true);
    try {
      const lowerName = file.name.toLowerCase();
      const rows = lowerName.endsWith(".csv")
        ? parseCsv((await file.text()).replace(/^\uFEFF/, ""))
        : null;
      const loaded = rows
        ? workbookFromRows(file.name, file.name.replace(/\.csv$/i, "").slice(0, 31), rows)
        : lowerName.endsWith(".xlsx")
          ? await readXlsx(file)
          : null;
      if (!loaded) throw new Error("Choose an Excel workbook (.xlsx) or a comma-separated file (.csv).");
      if (!loaded.headers.length) throw new Error("The selected file has no usable rows.");
      setWorkbook(loaded);
      setSearch("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The workbook could not be opened.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const editCell = (rowIndex: number, columnIndexValue: number, value: string) => {
    setWorkbook((current) => {
      if (!current) return current;
      const rows = current.rows.map((row, index) => index === rowIndex
        ? row.map((cell, cellIndex) => cellIndex === columnIndexValue ? value : cell)
        : row,
      );
      return { ...current, rows };
    });
  };

  const addRow = () => {
    setWorkbook((current) => current
      ? { ...current, rows: [...current.rows, current.headers.map(() => "")] }
      : { fileName: "New workbook.xlsx", sheetName: "BOQ", headers: ["Item Description", "Quantity", "Unit", "Rate"], rows: [["", "", "", ""]] },
    );
  };

  const removeRow = (rowIndex: number) => {
    setWorkbook((current) => current ? { ...current, rows: current.rows.filter((_, index) => index !== rowIndex) } : current);
  };

  const download = async (format: "xlsx" | "csv") => {
    if (!workbook) return;
    const headers = displayHeaders;
    const rows = workbook.rows.map((row) => hasCalculatedAmount
      ? [...row, String((numericValue(row[quantityColumn] ?? "") ?? 0) * (numericValue(row[rateColumn] ?? "") ?? 0))]
      : row,
    );
    let blob: Blob;
    let filename = workbook.fileName.replace(/\.(xlsx|csv)$/i, "");

    if (format === "csv") {
      const contents = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
      blob = new Blob(["\uFEFF", contents], { type: "text/csv;charset=utf-8" });
      filename += ".csv";
    } else {
      blob = await workbookXml(workbook, headers, rows).generateAsync({ type: "blob", mimeType: XLSX_MIME });
      filename += ".xlsx";
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-[2%] pb-10 pt-2">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Tender tools</p>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-4xl">
            <FileSpreadsheet className="h-7 w-7 text-primary sm:h-9 sm:w-9" /> MS Excel BOQ Workspace
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Open and edit Excel or CSV schedules in your browser. Search line items, review numeric totals, calculate quantity × rate, and download the processed sheet. Files stay on this device.
          </p>
        </div>
        {workbook && <span className="w-fit rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success">{workbook.sheetName}</span>}
      </header>

      <section className="glass-card flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <input ref={inputRef} type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" className="sr-only" onChange={(event) => void openFile(event.target.files?.[0])} />
          <button type="button" className={`${buttonClass} border-primary bg-primary text-white hover:bg-primary/90 hover:text-white`} onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload className="h-4 w-4" /> {busy ? "Opening workbook…" : "Open Excel or CSV"}
          </button>
          <button type="button" className={buttonClass} onClick={addRow} disabled={!workbook}>
            <Plus className="h-4 w-4" /> Add row
          </button>
          {workbook && <button type="button" className={buttonClass} onClick={() => void download("xlsx")}><Download className="h-4 w-4" /> Export .xlsx</button>}
          {workbook && <button type="button" className={buttonClass} onClick={() => void download("csv")}><Download className="h-4 w-4" /> Export .csv</button>}
        </div>
        {workbook && (
          <label className="relative block w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rows…" className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-3.5 w-3.5" /></button>}
          </label>
        )}
      </section>

      {error && <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">{error}</p>}

      {workbook ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workbook</p><p className="mt-1 truncate text-sm font-semibold" title={workbook.fileName}>{workbook.fileName}</p></div>
            <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Line items</p><p className="mt-1 text-xl font-extrabold">{workbook.rows.length}</p></div>
            <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Showing</p><p className="mt-1 text-xl font-extrabold">{filteredRows.length}<span className="ml-1 text-sm font-semibold text-muted-foreground">rows</span></p></div>
          </div>

          {hasCalculatedAmount && <p className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground/80"><Calculator className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Calculated Amount = {workbook.headers[quantityColumn]} × {workbook.headers[rateColumn]}. This value is included in both export formats.</p>}

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="max-h-[65dvh] overflow-auto">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {displayHeaders.map((header, index) => <th key={`${header}-${index}`} className="border-b border-r border-border px-3 py-3 last:border-r-0">{header}</th>)}
                    <th className="sticky right-0 border-b border-border bg-muted px-3 py-3">Row</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map(({ row, index: rowIndex }) => (
                    <tr key={rowIndex} className="group hover:bg-primary/[0.035]">
                      {workbook.headers.map((_, columnIndexValue) => (
                        <td key={columnIndexValue} className="border-b border-r border-border p-0 last:border-r-0">
                          <input aria-label={`${workbook.headers[columnIndexValue]}, row ${rowIndex + 2}`} value={row[columnIndexValue] ?? ""} onChange={(event) => editCell(rowIndex, columnIndexValue, event.target.value)} className="min-w-32 w-full bg-transparent px-3 py-2.5 outline-none focus:bg-primary/5 focus:ring-1 focus:ring-inset focus:ring-primary/40" />
                        </td>
                      ))}
                      {hasCalculatedAmount && <td className="border-b border-r border-border px-3 py-2.5 text-right font-semibold tabular-nums">{((numericValue(row[quantityColumn] ?? "") ?? 0) * (numericValue(row[rateColumn] ?? "") ?? 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>}
                      <td className="sticky right-0 border-b border-border bg-card px-2 py-1 group-hover:bg-[#fffdfa]">
                        <button type="button" aria-label={`Delete row ${rowIndex + 2}`} onClick={() => removeRow(rowIndex)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && <tr><td colSpan={displayHeaders.length + 1} className="px-4 py-12 text-center text-sm text-muted-foreground">No rows match “{search}”.</td></tr>}
                </tbody>
                <tfoot className="sticky bottom-0 bg-secondary/95 text-xs font-bold">
                  <tr>
                    {totals.map((total, index) => <td key={index} className="border-r border-t border-border px-3 py-3 text-right tabular-nums last:border-r-0">{total === null ? (index === 0 ? "Numeric totals" : "") : total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>)}
                    <td className="border-t border-border" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">Edits are held in this browser tab until you export. The original workbook is not changed.</p>
        </>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-72 w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-card/40 p-8 text-center transition hover:border-primary/50 hover:bg-primary/[0.025]">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><FileSpreadsheet className="h-7 w-7" /></span>
          <span className="text-lg font-bold">Open a workbook to begin</span>
          <span className="max-w-md text-sm leading-6 text-muted-foreground">Choose an .xlsx or .csv file. You can edit cells, add or remove rows, search items, calculate totals, then export the processed data.</span>
          <span className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"><Upload className="h-4 w-4" /> Choose file</span>
        </button>
      )}
    </div>
  );
}
