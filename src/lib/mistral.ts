import type { ParsedTimetable, ParsedCourse, ParsedSlot } from "./timetable/parser";

const BASE = "https://api.mistral.ai/v1";

const SYSTEM_PROMPT = `You are a timetable data extraction assistant. Given OCR text from an academic timetable PDF (BIT Mesra format), extract all information into valid JSON matching this TypeScript interface:

interface ParsedTimetable {
  metadata: {
    department: string;
    program: string;
    branch: string;
    semester: string;
    wefDate: string;
    institution: string;
    academicTerm: string;
  };
  courses: {
    code: string;
    name: string;
    type: string;
    credits: number;
    teacher: string;
  }[];
  slots: {
    dayOfWeek: string;
    periodName: string;
    timeRange: string;
    subjectDetails: string;
  }[];
}

RULES:
1. Extract ALL courses and ALL time slots from the text.
2. subjectDetails must be a plain string like "CS333 (Room 219)" or "LUNCH BREAK". Do NOT use an object.
3. Period time ranges (BIT Mesra): I=08:00-08:50, II=09:00-09:50, III=10:00-10:50, IV=11:00-11:50, V=12:00-12:50, VI=13:30-14:20, VII=14:30-15:20, VIII=15:30-16:20, IX=16:30-17:20.
4. Clean up OCR artifacts.
5. If metadata fields are missing, infer from context or use reasonable defaults.
6. Return ONLY valid JSON, no markdown, no explanation.`;

function getKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY not configured");
  return key;
}

interface MistralOcrResponse {
  pages: { index: number; markdown: string }[];
}

export async function ocrPdf(buffer: Buffer): Promise<string> {
  const base64 = buffer.toString("base64");

  const key = getKey();
  console.log("[mistral] sending PDF to Mistral OCR...");
  const ocrRes = await fetch(`${BASE}/ocr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        document_url: `data:application/pdf;base64,${base64}`,
      },
    }),
  });

  if (!ocrRes.ok) {
    const err = await ocrRes.text();
    throw new Error(`Mistral OCR error (${ocrRes.status}): ${err.slice(0, 500)}`);
  }

  const ocrData: MistralOcrResponse = await ocrRes.json();
  if (!ocrData.pages?.length) {
    throw new Error("Mistral OCR returned no pages");
  }

  const text = ocrData.pages[0].markdown;
  console.log(`[mistral] OCR done, got ${text.length} chars`);
  return text;
}

export async function structureWithMistral(text: string): Promise<ParsedTimetable> {
  const chatBody = {
    model: "mistral-small-latest",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Extract the complete timetable from this OCR text:\n\n${text}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  };

  const key = getKey();
  console.log("[mistral] structuring with Mistral Chat...");
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatBody),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral Chat error (${res.status}): ${err.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Mistral returned empty response");
  }

  const parsed = JSON.parse(content) as ParsedTimetable;
  console.log(`[mistral] structured: ${parsed.courses?.length} courses, ${parsed.slots?.length} slots`);

  if (!parsed.metadata || !parsed.courses || !parsed.slots) {
    throw new Error("Mistral response missing required fields");
  }

  parsed.metadata.institution =
    parsed.metadata.institution || "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI";
  parsed.metadata.academicTerm =
    parsed.metadata.academicTerm || "SPRING 2026";

  parsed.courses = parsed.courses.map((c: ParsedCourse) => ({
    ...c,
    credits: typeof c.credits === "string" ? parseFloat(c.credits as unknown as string) || 0 : c.credits || 0,
    teacher: c.teacher || "TBA",
  }));

  return parsed;
}
