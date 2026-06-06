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
  const base64 = buffer.toString("base64");
  const payload = new URLSearchParams();
  payload.append("apikey", OCR_API_KEY!);
  payload.append("base64Image", `data:application/pdf;base64,${base64}`);
  payload.append("language", "eng");
  payload.append("OCREngine", "2");
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
    throw new Error(`OCR processing error: ${msg}`);
  }

  const parsedText = data.ParsedResults?.[0]?.ParsedText ?? "";
  return parsedText;
}
