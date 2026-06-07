import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as path from "node:path";

// Set workerSrc to absolute path of legacy pdf.worker.mjs on disk to fix Webpack chunk loading issues in Next.js
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs"
);

export async function renderPdfToPng(pdfBuffer: Buffer): Promise<Buffer> {
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  const page = await doc.getPage(1);
  const scale = 2.0; // High resolution rendering
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context as any,
    viewport: viewport,
  }).promise;

  const pngBuffer = canvas.toBuffer("image/png");
  await doc.destroy();

  return pngBuffer;
}
