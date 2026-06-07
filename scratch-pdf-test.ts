import * as fs from "fs";
import * as path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Set workerSrc to absolute path of legacy pdf.worker.mjs on disk
pdfjsLib.GlobalWorkerOptions.workerSrc = path.join(
  process.cwd(),
  "node_modules",
  "pdfjs-dist",
  "legacy",
  "build",
  "pdf.worker.mjs"
);

async function main() {
  const buffer = fs.readFileSync("./Samayak_Admin_Panel_Assignment_v3 (2).pdf");
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;
  console.log("PDF loaded successfully, pages:", doc.numPages);

  const page = await doc.getPage(1);
  const scale = 2.0;
  const viewport = page.getViewport({ scale });

  console.log("Viewport size:", viewport.width, "x", viewport.height);

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  console.log("Rendering page...");
  await page.render({
    canvasContext: context as any,
    viewport: viewport,
  }).promise;

  const png = canvas.toBuffer("image/png");
  fs.writeFileSync("./public/pdf-page-1.png", png);
  console.log("PDF page rendered and saved to ./public/pdf-page-1.png");

  await doc.destroy();
}

// polyfill createCanvas since it's not imported directly in global namespace
import { createCanvas } from "@napi-rs/canvas";

main().catch(console.error);
