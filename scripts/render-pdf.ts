import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as path from "node:path";
import * as fs from "node:fs";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs"
);

async function main() {
  const pdfPath = process.argv[2];
  const pngPath = process.argv[3];
  
  if (!pdfPath || !pngPath) {
    console.error("Usage: npx tsx scripts/render-pdf.ts <pdfPath> <pngPath>");
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  const page = await doc.getPage(1);
  const scale = 2.0; 
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context as any,
    viewport: viewport,
  }).promise;

  const pngBuffer = canvas.toBuffer("image/png");
  await doc.destroy();
  
  fs.writeFileSync(pngPath, pngBuffer);
  console.log("SUCCESS");
}

main().catch(e => {
  console.error("FAILED", e);
  process.exit(1);
});
