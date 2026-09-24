/**
 * Ghostscript WASM compression worker (classic worker).
 *
 * Heavy Ghostscript processing runs on this dedicated thread so the UI stays
 * responsive. The PDF bytes are transferred into the virtual filesystem and
 * never leave the browser. The bundled WASM + module are served statically
 * from /wasm/.
 */

const modulePromise = import("/wasm/gs.js").then((m) => m.default);

/** The compiled Ghostscript instance is cached and reused across runs, so the
 *  heavy WASM module is only downloaded + compiled once per page load. */
let gsInstance = null;

const ensureEngine = async () => {
  if (!gsInstance) {
    const createGhostscript = await modulePromise;
    gsInstance = await createGhostscript();
  }
  return gsInstance;
};

self.onmessage = async (event) => {
  const req = event.data;
  if (!req) return;

  const postResponse = (msg) => self.postMessage({ id: req.id, ...msg });

  // A warm-up request does nothing but compile the engine in the background so
  // the first real compress is fast. Errors are ignored — real runs surface them.
  if (req.type === "warmup") {
    try {
      await ensureEngine();
    } catch {
      /* ignore */
    }
    return;
  }

  if (req.type !== "compress") return;

  try {
    const mod = await ensureEngine();
    const FS = mod.FS;

    try {
      FS.mkdir("/work");
    } catch {
      /* already exists */
    }
    FS.chdir("/work");

    FS.writeFile("/work/in.pdf", new Uint8Array(req.data));

    const settingsMap = { screen: "/screen", ebook: "/ebook", printer: "/printer" };
    const pdfSetting = settingsMap[req.settings] || "/ebook";

    postResponse({ type: "progress", message: "Compressing pages..." });

    const exitStatus = await mod.callMain([
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-dQUIET",
      "-sDEVICE=pdfwrite",
      `-dPDFSETTINGS=${pdfSetting}`,
      "-dCompatibilityLevel=1.5",
      "-dEmbedAllFonts=true",
      "-dSubsetFonts=true",
      "-dAutoRotatePages=/None",
      "-dColorImageDownsampleType=/Bicubic",
      "-sOutputFile=/work/out.pdf",
      "/work/in.pdf",
    ]);

    if (exitStatus !== 0) {
      postResponse({ type: "error", message: `Ghostscript exited with status ${exitStatus}` });
      return;
    }

    const outBytes = FS.readFile("/work/out.pdf");
    const outBuffer = outBytes.buffer.slice(
      outBytes.byteOffset,
      outBytes.byteOffset + outBytes.byteLength
    );

    try {
      FS.unlink("/work/in.pdf");
      FS.unlink("/work/out.pdf");
    } catch {
      /* ignore */
    }

    postResponse({ type: "result", data: outBuffer });
  } catch (err) {
    postResponse({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};