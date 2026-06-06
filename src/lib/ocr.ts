const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;

interface OcrSpaceResponse {
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds?: number;
  ParsedResults?: {
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails?: string;
  }[];
  ErrorMessage?: string | string[];
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (buffer.length === 0) return "";
  return extractViaOcrSpace(buffer);
}

async function extractViaOcrSpace(buffer: Buffer): Promise<string> {
  try {
    const pages = await renderPdfPages(buffer);
    if (pages.length === 0) return "";

    const allText: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const text = await ocrImage(pages[i]);
      if (text.trim()) {
        allText.push(text);
      }
    }

    return allText.join("\n\n---PAGE BREAK---\n\n");
  } catch (err) {
    console.warn("OCR.space failed:", err);
    return "";
  }
}

async function ocrImage(imageBuffer: Buffer): Promise<string> {
  const base64 = imageBuffer.toString("base64");
  const payload = new URLSearchParams();
  payload.append("apikey", OCR_API_KEY!);
  payload.append("base64Image", `data:image/png;base64,${base64}`);
  payload.append("language", "eng");
  payload.append("OCREngine", "2");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OCR.space error (${res.status}): ${err.slice(0, 300)}`);
  }

  const data: OcrSpaceResponse = await res.json();

  if (data.IsErroredOnProcessing) {
    const msg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join("; ")
      : data.ErrorMessage || "Unknown error";
    console.warn(`OCR.space processing error: ${msg}`);
    return "";
  }

  const parsedText = data.ParsedResults?.[0]?.ParsedText ?? "";
  return parsedText;
}

async function renderPdfPages(buffer: Buffer): Promise<Buffer[]> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createCanvas } = await import("@napi-rs/canvas");

  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;
  const pages: Buffer[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    await page.render({
      canvas: null,
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;

    pages.push(canvas.toBuffer("image/png"));
  }

  return pages;
}
