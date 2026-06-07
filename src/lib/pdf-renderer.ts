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
  // @napi-rs/canvas is known to cause silent C++ segfaults on Apple Silicon Macs
  if (process.env.NODE_ENV === "development") {
    console.log("[pdf-renderer] Using Mac-native 'sips' command for PDF rendering to bypass Canvas segfaults...");
    const { execSync } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");
    
    const tempPdfPath = path.join(process.cwd(), "public", "uploads", `temp_${Date.now()}.pdf`);
    const tempPngPath = path.join(process.cwd(), "public", "uploads", `temp_${Date.now()}.png`);
    
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    
    try {
      // Mac-native CLI tool that converts PDF to PNG flawlessly without Node modules!
      execSync(`sips -s format png "${tempPdfPath}" --out "${tempPngPath}"`, { stdio: "ignore" });
      const pngBuffer = fs.readFileSync(tempPngPath);
      
      // Cleanup temp files
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath);
      
      return pngBuffer;
    } catch (e) {
      console.error("[pdf-renderer] sips failed:", e);
      if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
      if (fs.existsSync(tempPngPath)) fs.unlinkSync(tempPngPath);
      return Buffer.from("");
    }
  }

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
