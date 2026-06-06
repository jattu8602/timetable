const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;

interface OcrSpaceResponse {
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ParsedResults?: {
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
  }[];
  ErrorMessage?: string | string[];
}

export async function ocrPdf(buffer: Buffer): Promise<string> {
  const text = await extractFirstPageText(buffer);
  if (text.trim()) return text;
  return ocrFallback(buffer);
}

async function extractFirstPageText(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const page = await doc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
      .join(" ");
    await doc.destroy();
    return text.trim();
  } catch {
    return "";
  }
}

async function ocrFallback(buffer: Buffer): Promise<string> {
  if (!OCR_API_KEY) throw new Error("OCR_SPACE_API_KEY not configured");

  const base64 = buffer.toString("base64");
  const payload = new URLSearchParams();
  payload.append("apikey", OCR_API_KEY);
  payload.append("base64Image", `data:application/pdf;base64,${base64}`);
  payload.append("language", "eng");
  payload.append("OCREngine", "1");
  payload.append("isCreateSearchablePdf", "false");
  payload.append("isOverlayRequired", "false");

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
    throw new Error(`OCR.space error: ${msg}`);
  }

  const parsedText = data.ParsedResults?.[0]?.ParsedText ?? "";
  return parsedText;
}
