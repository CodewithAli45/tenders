"use client";

import { AlertCircle, Check, ChevronDown, CircleHelp, FileUp, Layers3, Maximize, MousePointer2, RotateCcw, Ruler, Scan, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Entity =
  | { kind: "line"; points: [Point, Point]; layer: string }
  | { kind: "polyline"; points: Point[]; closed: boolean; layer: string }
  | { kind: "circle"; center: Point; radius: number; layer: string }
  | { kind: "arc"; center: Point; radius: number; start: number; end: number; layer: string };
type Drawing = { name: string; entities: Entity[]; layers: string[]; bounds: { minX: number; minY: number; maxX: number; maxY: number } };
const palette = ["#d59563", "#77b7a0", "#7aa6dc", "#d8bd70", "#ba91d3", "#d58383", "#77c3cf", "#a9b572"];

function parseDxf(source: string, name: string): Drawing {
  const rows = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  const pairs: Array<[number, string]> = [];
  for (let i = 0; i + 1 < rows.length; i += 2) {
    const code = Number(rows[i].trim());
    if (Number.isFinite(code)) pairs.push([code, rows[i + 1].trim()]);
  }
  const records: Array<{ type: string; values: Array<[number, string]> }> = [];
  let inEntities = false; let waitingForSection = false; let current: Array<[number, string]> = [];
  for (const pair of pairs) {
    if (pair[0] === 0 && pair[1] === "SECTION") { waitingForSection = true; continue; }
    if (waitingForSection && pair[0] === 2) { inEntities = pair[1].toUpperCase() === "ENTITIES"; waitingForSection = false; continue; }
    if (pair[0] === 0 && pair[1] === "ENDSEC") {
      if (current.length) records.push({ type: current[0][1].toUpperCase(), values: current.slice(1) });
      current = []; inEntities = false; continue;
    }
    if (!inEntities) continue;
    if (pair[0] === 0) {
      if (current.length) records.push({ type: current[0][1].toUpperCase(), values: current.slice(1) });
      current = [pair];
    } else current.push(pair);
  }
  if (current.length) records.push({ type: current[0][1].toUpperCase(), values: current.slice(1) });
  const entities: Entity[] = []; const layers = new Set<string>();
  const num = (values: Array<[number, string]>, code: number, fallback = 0) => {
    const raw = values.find(([group]) => group === code)?.[1];
    const n = raw === undefined ? fallback : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  for (const { type, values: v } of records) {
    const layer = v.find(([code]) => code === 8)?.[1] || "0";
    const point = (x: number, y: number) => ({ x: num(v, x), y: num(v, y) });
    let entity: Entity | undefined;
    if (type === "LINE") entity = { kind: "line", points: [point(10, 20), point(11, 21)], layer };
    if (type === "CIRCLE") entity = { kind: "circle", center: point(10, 20), radius: Math.abs(num(v, 40)), layer };
    if (type === "ARC") entity = { kind: "arc", center: point(10, 20), radius: Math.abs(num(v, 40)), start: num(v, 50), end: num(v, 51), layer };
    if (type === "LWPOLYLINE") {
      const points: Point[] = []; let x: number | undefined;
      for (const [code, raw] of v) {
        if (code === 10) { x = Number(raw); }
        else if (code === 20 && x !== undefined) { points.push({ x, y: Number(raw) }); x = undefined; }
      }
      entity = { kind: "polyline", points, closed: (num(v, 70) & 1) === 1, layer };
    }
    if (entity && (entity.kind === "line" || entity.kind === "circle" || entity.kind === "arc" || entity.points.length > 1)) {
      if ((entity.kind !== "circle" && entity.kind !== "arc") || entity.radius > 0) { entities.push(entity); layers.add(entity.layer); }
    }
  }
  if (!entities.length) throw new Error("No supported geometry found. This viewer reads DXF LINE, CIRCLE, ARC, and LWPOLYLINE entities.");
  const points: Point[] = [];
  for (const e of entities) {
    if (e.kind === "line" || e.kind === "polyline") points.push(...e.points);
    else points.push({ x: e.center.x - e.radius, y: e.center.y - e.radius }, { x: e.center.x + e.radius, y: e.center.y + e.radius });
  }
  const bounds = points.reduce<Drawing["bounds"]>((b, p) => ({ minX: Math.min(b.minX, p.x), minY: Math.min(b.minY, p.y), maxX: Math.max(b.maxX, p.x), maxY: Math.max(b.maxY, p.y) }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  return { name, entities, layers: [...layers].sort((a, b) => a.localeCompare(b)), bounds };
}

const fmt = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);

export function AutoCadViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null); const stageRef = useRef<HTMLDivElement>(null); const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [drawing, setDrawing] = useState<Drawing | null>(null); const [visible, setVisible] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1); const [pan, setPan] = useState({ x: 0, y: 0 }); const [fitKey, setFitKey] = useState(0);
  const [draggingFile, setDraggingFile] = useState(false); const [error, setError] = useState(""); const [layersOpen, setLayersOpen] = useState(true);
  const openFile = useCallback(async (file?: File) => {
    if (!file) return; setError("");
    if (/\.dwg$/i.test(file.name)) { setError("DWG needs a CAD conversion engine. Export or save the drawing as ASCII DXF in AutoCAD or another CAD app, then open the DXF here."); return; }
    if (!/\.dxf$/i.test(file.name)) { setError("Choose a DXF drawing file to preview."); return; }
    try { const d = parseDxf(await file.text(), file.name); setDrawing(d); setVisible(new Set(d.layers)); setZoom(1); setPan({ x: 0, y: 0 }); setFitKey(k => k + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not read this drawing."); }
  }, []);
  const fitDrawing = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); setFitKey(k => k + 1); }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const stage = stageRef.current; if (!canvas || !stage || !drawing) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const draw = () => {
      const rect = stage.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = "#151719"; ctx.fillRect(0, 0, rect.width, rect.height);
      const w = drawing.bounds.maxX - drawing.bounds.minX || 1; const h = drawing.bounds.maxY - drawing.bounds.minY || 1;
      const scale = Math.max(.00001, Math.min((rect.width - 64) / w, (rect.height - 64) / h)) * zoom;
      const cx = rect.width / 2 + pan.x; const cy = rect.height / 2 + pan.y;
      const project = (p: Point) => ({ x: cx + (p.x - (drawing.bounds.minX + drawing.bounds.maxX) / 2) * scale, y: cy - (p.y - (drawing.bounds.minY + drawing.bounds.maxY) / 2) * scale });
      ctx.strokeStyle = "rgba(215,222,228,.055)"; ctx.lineWidth = 1;
      for (let x = cx % 32; x < rect.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke(); }
      for (let y = cy % 32; y < rect.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke(); }
      drawing.entities.forEach(e => {
        if (!visible.has(e.layer)) return;
        ctx.strokeStyle = palette[drawing.layers.indexOf(e.layer) % palette.length]; ctx.lineWidth = 1.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
        if (e.kind === "line") { const a = project(e.points[0]); const b = project(e.points[1]); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
        else if (e.kind === "polyline") { e.points.forEach((point, i) => { const p = project(point); if (!i) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); if (e.closed) ctx.closePath(); }
        else { const c = project(e.center); const r = Math.max(1, e.radius * scale); if (e.kind === "circle") ctx.arc(c.x, c.y, r, 0, Math.PI * 2); else { let start = e.start * Math.PI / 180; let end = e.end * Math.PI / 180; if (end < start) end += 2 * Math.PI; ctx.arc(c.x, c.y, r, -start, -end, true); } }
        ctx.stroke();
      });
      const o = project({ x: 0, y: 0 });
      if (o.x > 0 && o.x < rect.width && o.y > 0 && o.y < rect.height) {
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(220,80,80,.55)"; ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(rect.width, o.y); ctx.stroke();
        ctx.strokeStyle = "rgba(87,175,129,.55)"; ctx.beginPath(); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, rect.height); ctx.stroke();
        ctx.font = "11px ui-monospace, monospace"; ctx.fillStyle = "#e47f7f"; ctx.fillText("X", rect.width - 18, o.y - 7); ctx.fillStyle = "#75c69b"; ctx.fillText("Y", o.x + 7, 15);
      }
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(stage); return () => observer.disconnect();
  }, [drawing, visible, zoom, pan, fitKey]);

  const toggle = (layer: string) => setVisible(old => { const next = new Set(old); next.has(layer) ? next.delete(layer) : next.add(layer); return next; });
  const visibleCount = drawing?.layers.filter(layer => visible.has(layer)).length ?? 0;

  return <div className="mx-auto w-full max-w-[1600px] space-y-5 px-1 pb-8 md:px-3">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span>TOOLS</span><span className="text-border">/</span><span className="text-primary">CAD VIEWER</span></div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">AutoCAD drawing viewer</h1><p className="mt-1 text-sm text-muted-foreground">Inspect technical drawings in your browser. Files stay on your device.</p></div><div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" />Local processing <span className="mx-1 text-border">·</span> DXF</div></div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5"><div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Scan className="h-4 w-4" /></div><div className="min-w-0"><div className="truncate text-sm font-semibold">{drawing?.name || "Untitled drawing"}</div><div className="text-[11px] text-muted-foreground">{drawing ? `${drawing.entities.length.toLocaleString()} entities · ${visibleCount} of ${drawing.layers.length} layers visible` : "No drawing loaded"}</div></div></div><div className="flex items-center gap-1"><button onClick={() => setZoom(z => Math.max(.08, z / 1.2))} disabled={!drawing} aria-label="Zoom out" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"><ZoomOut className="h-4 w-4" /></button><span className="w-12 text-center font-mono text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span><button onClick={() => setZoom(z => Math.min(30, z * 1.2))} disabled={!drawing} aria-label="Zoom in" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-40"><ZoomIn className="h-4 w-4" /></button><span className="mx-1 h-5 w-px bg-border" /><button onClick={fitDrawing} disabled={!drawing} className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-40"><Maximize className="h-4 w-4" /><span className="hidden sm:inline">Fit drawing</span></button></div></div>
        <div ref={stageRef} className={`relative h-[56vh] min-h-[360px] overflow-hidden bg-[#151719] md:h-[64vh] ${drawing ? "" : "grid place-items-center"}`} onDragOver={e => { e.preventDefault(); setDraggingFile(true); }} onDragLeave={() => setDraggingFile(false)} onDrop={e => { e.preventDefault(); setDraggingFile(false); void openFile(e.dataTransfer.files[0]); }}>
          {drawing ? <canvas ref={canvasRef} onWheel={e => { e.preventDefault(); setZoom(z => Math.max(.08, Math.min(30, z * (e.deltaY < 0 ? 1.12 : .89)))); }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }; }} onPointerMove={e => { if (dragRef.current) setPan({ x: dragRef.current.panX + e.clientX - dragRef.current.x, y: dragRef.current.panY + e.clientY - dragRef.current.y }); }} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing" aria-label="Interactive CAD canvas. Drag to pan, scroll to zoom." /> : <div className={`mx-5 flex w-full max-w-lg flex-col items-center rounded-2xl border border-dashed px-7 py-10 text-center transition ${draggingFile ? "border-primary bg-primary/10" : "border-white/20 bg-white/[.025]"}`}><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary"><Layers3 className="h-7 w-7" /></div><h2 className="text-lg font-semibold text-white">Open a technical drawing</h2><p className="mt-2 max-w-sm text-sm leading-6 text-white/55">Drop an ASCII DXF file here to view geometry, inspect layers, and navigate the drawing.</p><button onClick={() => inputRef.current?.click()} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"><FileUp className="h-4 w-4" />Choose DXF file</button><div className="mt-5 flex items-center gap-2 text-[11px] text-white/40"><Check className="h-3.5 w-3.5 text-emerald-400" />Drawing is processed locally in this browser</div></div>}
          {drawing && <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-[11px] text-white/65 backdrop-blur"><MousePointer2 className="h-3.5 w-3.5" />Drag to pan <span className="text-white/30">·</span> Scroll to zoom</div>}{draggingFile && <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center border-2 border-primary bg-primary/10 text-sm font-semibold text-white">Drop DXF to open</div>}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ready</span><span>{drawing ? `X ${fmt(drawing.bounds.minX)} to ${fmt(drawing.bounds.maxX)} · Y ${fmt(drawing.bounds.minY)} to ${fmt(drawing.bounds.maxY)}` : "DXF supported · DWG requires conversion to DXF"}</span></div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold">Drawing details</h2><Ruler className="h-4 w-4 text-muted-foreground" /></div>{drawing ? <div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Format</span><span className="font-semibold">DXF</span></div><div className="flex justify-between"><span className="text-muted-foreground">Entities</span><span className="font-semibold">{drawing.entities.length.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Layers</span><span className="font-semibold">{drawing.layers.length}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Extents X</span><span className="font-mono">{fmt(drawing.bounds.maxX - drawing.bounds.minX)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Extents Y</span><span className="font-mono">{fmt(drawing.bounds.maxY - drawing.bounds.minY)}</span></div></div> : <p className="text-xs leading-5 text-muted-foreground">Load a DXF file to see drawing information and layer controls.</p>}<button onClick={() => inputRef.current?.click()} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-xs font-semibold transition hover:border-primary hover:text-primary"><Upload className="h-3.5 w-3.5" />{drawing ? "Open another drawing" : "Browse files"}</button><input ref={inputRef} type="file" accept=".dxf,.dwg,application/dxf,image/vnd.dxf" className="hidden" onChange={e => { void openFile(e.target.files?.[0]); e.currentTarget.value = ""; }} /></div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><button onClick={() => setLayersOpen(o => !o)} className="flex w-full items-center justify-between p-4 text-left"><span className="flex items-center gap-2 text-sm font-bold"><Layers3 className="h-4 w-4 text-primary" />Layers{drawing && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{visibleCount}/{drawing.layers.length}</span>}</span><ChevronDown className={`h-4 w-4 text-muted-foreground transition ${layersOpen ? "rotate-180" : ""}`} /></button>{layersOpen && <div className="border-t border-border p-2">{drawing ? drawing.layers.map((layer, i) => <button key={layer} onClick={() => toggle(layer)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-muted"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: visible.has(layer) ? palette[i % palette.length] : "#596067" }} /><span className={`min-w-0 flex-1 truncate text-xs ${visible.has(layer) ? "font-medium" : "text-muted-foreground line-through"}`}>{layer}</span><span className={`h-4 w-4 rounded border ${visible.has(layer) ? "grid place-items-center border-primary bg-primary text-white" : "border-border"}`}>{visible.has(layer) && <Check className="h-3 w-3" />}</span></button>) : <p className="px-3 pb-3 text-xs text-muted-foreground">Layers will appear here after loading a drawing.</p>}</div>}</div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4"><div className="flex gap-3"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><h3 className="text-xs font-bold">About file support</h3><p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">This lightweight viewer reads ASCII DXF geometry locally. For DWG, export or save a copy as DXF from AutoCAD first. Your drawing is not uploaded.</p></div></div></div>
        {error && <div role="alert" className="flex gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs leading-5 text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}{drawing && <button onClick={fitDrawing} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"><RotateCcw className="h-3.5 w-3.5" />Reset view</button>}
      </aside>
    </div>
  </div>;
}
