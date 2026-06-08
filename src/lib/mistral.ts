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
8. COURSE NAME PRESERVATION: When extracting the \`name\` field for a course, extract the EXACT string from the PDF, including any parentheses. For example, if the PDF says "Information Retrieval (IR)", the \`name\` MUST be "Information Retrieval (IR)", and the \`shortName\` should be "IR". Do not strip the parenthesis from the \`name\`.
9. VERY IMPORTANT OCR CORRECTION: "Col" is almost always an OCR error for "CoI" (Constitution of India). If you see "Col / 219" or similar, parse the subject as "CoI" and the room as "219".
10. ROOM NUMBER FORMATTING: The UI only highlights room numbers if they are enclosed in parentheses. If the OCR text has a slash like "CS - II / 233A" or "EE / Room 4", you MUST convert it to "CS - II (233A)" or "EE (Room 4)". Always wrap the room portion in parentheses!
11. MISSING COURSE CODES: If a course (like \`OEIII/ MOOC\`) has an empty/blank Course Code cell, set the \`code\` to an empty string \`""\`.
12. VERTICAL MERGING (ROWSPANS): If a cell like \`Course Type\` or \`Credit\` spans across multiple rows vertically (e.g., grouping \`IT349\` and \`IT353\` together under \`PE III\`), you must assign that same \`type\` and \`credits\` value to BOTH course objects in the JSON array.
13. NON-CREDIT COURSES: If a course's credit is listed as "NC" (Non-Credit), output the \`credits\` field as the number \`0\`.
14. PREFIXED CODES IN GRID: If a grid cell says "MT133 CS - II (219)", do not include "MT133" in the \`shortName\` mapping for the course list. The \`shortName\` is just "CS - II". Maintain the full text "MT133 CS - II (219)" in the \`subjectDetails\` grid slot.
15. MULTI-GROUP CELLS: If a cell contains multiple class lines separated by a newline (e.g. \`CNS (219) \\n BCT (G2)\`), combine them using a slash: \`"CNS (219) / BCT (G2)"\`.
16. STRICT HORIZONTAL GRID ALIGNMENT: Pay extreme attention to the exact column a subject appears in. If a period column in the image is empty, you MUST leave the \`subjectDetails\` as an empty string \`""\` for that period. Do NOT shift subjects from later periods into earlier empty periods. Count the table columns carefully to map subjects to their exact Period (I-IX).
17. COLSPANS FOR LABS: If a lab (like 'AIML Lab (Lab 3)') visually spans multiple horizontal columns (e.g. Periods II, III, and IV), you MUST output separate JSON objects for EACH period it spans. If it spans 3 periods, output exactly 3 objects. Do not truncate it to 2 periods.
18. VERTICAL LUNCH BREAK TEXT: The words "LUNCH - BREAK" are written vertically between Period V and Period VI. Do NOT assign "LUNCH BREAK" as the subject for Period V. Period V is usually a normal class or an empty cell. Ignore the vertical lunch text entirely!

FEW-SHOT EXAMPLES FOR COMPLEX SLOTS:

Bad OCR Input: "Col / 219"
Good JSON output subjectDetails: "CoI (219)"

Bad OCR Input for a lab spanning Periods I to V:
"Tuesday | AIML Lab (Lab 3) | AIML Lab (Lab 3) | AIML Lab (Lab 3) | AIML Lab (Lab 3) | AIML Lab (Lab 3)"
Good JSON output must have 5 separate objects for Tuesday:
{ "dayOfWeek": "Tuesday", "periodName": "I", "timeRange": "08:00-08:50", "subjectDetails": "AIML Lab (Lab 3)" },
{ "dayOfWeek": "Tuesday", "periodName": "II", "timeRange": "09:00-09:50", "subjectDetails": "AIML Lab (Lab 3)" },
{ "dayOfWeek": "Tuesday", "periodName": "III", "timeRange": "10:00-10:50", "subjectDetails": "AIML Lab (Lab 3)" },
{ "dayOfWeek": "Tuesday", "periodName": "IV", "timeRange": "11:00-11:50", "subjectDetails": "AIML Lab (Lab 3)" },
{ "dayOfWeek": "Tuesday", "periodName": "V", "timeRange": "12:00-12:50", "subjectDetails": "AIML Lab (Lab 3)" }

Bad OCR Input with multiple groups: "CNS (219 / 220) BCT (G2 / G3)"
Good JSON output subjectDetails: "CNS (219/220) / BCT (G2/G3)"

**Example 4: Handling Empty Codes, NC Credits, and Vertical Rowspans**
OCR Text for courses table: 
"IT349 | PE III (Spans 2 rows) | Cryptography and Network Security (CNS) | 3 (Spans 2 rows) | Dr. Sumit"
"IT353 | Blockchain Technology (BCT) | Dr. K.S. Patnaik"
"- | OE | OEIII/ MOOC | 3 | -"
"MT204 | HSS | Constitution of India | NC | Dr. Anand Kumar"
Output in courses array:
{ "code": "IT349", "type": "PE III", "name": "Cryptography and Network Security", "shortName": "CNS", "credits": 3, "teacher": "Dr. Sumit" },
{ "code": "IT353", "type": "PE III", "name": "Blockchain Technology", "shortName": "BCT", "credits": 3, "teacher": "Dr. K.S. Patnaik" },
{ "code": "", "type": "OE", "name": "OEIII/ MOOC", "shortName": "OEIII", "credits": 3, "teacher": "" },
{ "code": "MT204", "type": "HSS", "name": "Constitution of India", "shortName": "CoI", "credits": 0, "teacher": "Dr. Anand Kumar" }`;

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


