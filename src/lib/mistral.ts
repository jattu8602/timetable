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
    shortName: string;
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
6. Return ONLY valid JSON, no markdown, no explanation.
7. For courses, you MUST extract or generate a \`shortName\` (e.g., "AIML", "CNS", "CoI", "CD", "ES Lab") that exactly matches the abbreviation used in the timetable slots. If the PDF does not explicitly provide the abbreviation next to the course name, you MUST deduce the acronym by looking at the timetable slots and matching it to the course name! Do not leave \`shortName\` empty.
8. VERY IMPORTANT OCR CORRECTION: "Col" is almost always an OCR error for "CoI" (Constitution of India). If you see "Col / 219" or similar, parse the subject as "CoI" and the room as "219".
9. ROOM NUMBER FORMATTING: The UI only highlights room numbers if they are enclosed in parentheses. If the OCR text has a slash like "CS - II / 233A" or "EE / Room 4", you MUST convert it to "CS - II (233A)" or "EE (Room 4)". Always wrap the room portion in parentheses!`;

function getKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error("MISTRAL_API_KEY not configured");
  return key;
}

interface MistralOcrResponse {
  pages: { index: number; markdown: string }[];
}

export async function ocrPdf(buffer: Buffer, fileName: string = "document.pdf"): Promise<string> {
  const base64 = buffer.toString("base64");

  let mimeType = "application/pdf";
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".png")) mimeType = "image/png";
  else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) mimeType = "image/jpeg";
  else if (lowerName.endsWith(".webp")) mimeType = "image/webp";

  const key = getKey();
  console.log(`[mistral] sending ${mimeType} to Mistral OCR...`);
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
        document_url: `data:${mimeType};base64,${base64}`,
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

export async function analyzeTimetableImage(pngBase64: string): Promise<{ slots: { dayOfWeek: string; periodName: string; subjectDetails: string }[] }> {
  const systemPrompt = `You are a university timetable grid layout analyzer.
Analyze the provided university timetable image carefully.
Your task is to identify and extract ALL time slots in the timetable grid, matching each class slot to its correct day and time period.
IMPORTANT: You MUST identify merged cells correctly. If a cell spans multiple time periods (e.g. "AP Lab (Lab 1)" on Tuesday spans Periods I, II, III, IV, and V), you MUST return individual slots for EACH of those periods.
For example, for a Tuesday class spanning I to V, you should output 5 separate slot entries:
- Tuesday, Period I: "AP Lab (Lab 1)"
- Tuesday, Period II: "AP Lab (Lab 1)"
- Tuesday, Period III: "AP Lab (Lab 1)"
- Tuesday, Period IV: "AP Lab (Lab 1)"
- Tuesday, Period V: "AP Lab (Lab 1)"

If a cell is a LUNCH break spanning across days, do NOT output slots for it.
Periods are labeled I, II, III, IV, V, VI, VII, VIII, IX.
Days are Monday, Tuesday, Wednesday, Thursday, Friday.

Output format MUST be a valid JSON matching this schema:
{
  "slots": [
    {
      "dayOfWeek": "Monday",
      "periodName": "I",
      "subjectDetails": "OE - I"
    }
  ]
}
Return ONLY valid JSON. No explanations, no markdown blocks.`;

  const key = getKey();
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: `data:image/png;base64,${pngBase64}` }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral Vision API error (${res.status}): ${err.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Mistral Vision returned empty response");
  }

  const parsed = JSON.parse(content);
  return parsed;
}

