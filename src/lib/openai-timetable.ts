import type { ParsedTimetable, ParsedCourse, ParsedSlot, ParsedMetadata } from "./timetable/parser";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a timetable data extraction assistant. Given raw OCR text from an academic timetable PDF (BIT Mesra format), extract all information into valid JSON matching this TypeScript interface:

interface ParsedTimetable {
  metadata: {
    department: string;
    program: string;
    branch: string;
    semester: string;
    wefDate: string;       // format: "DD.MM.YYYY" or "YYYY-MM-DD"
    institution: string;   // default: "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI"
    academicTerm: string;  // e.g. "SPRING 2026"
  };
  courses: {
    code: string;    // e.g. "CS333"
    name: string;    // full course name
    type: string;    // e.g. "Core", "Lab", "OE", "HSS", "PE"
    credits: number; // numeric credit value (0 for NC, non-credit)
    teacher: string; // full teacher name, "TBA" if not listed
  }[];
  slots: {
    dayOfWeek: string;   // "Monday" through "Friday"
    periodName: string;  // "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
    timeRange: string;   // "08:00-08:50", "09:00-09:50", etc.
    subjectDetails: string; // e.g. "CS333 (Room 219)", "AIML Lab (Lab 3)", "LUNCH BREAK"
  }[];
}

RULES:
1. Extract ALL courses from the OCR text — course code, full name, type, credits, teacher.
2. Extract ALL time slots — every day × period combination shown in the timetable grid.
3. For subjectDetails: include the course code and room/group info as shown in the grid cell. For lunch/break periods, use "LUNCH BREAK".
4. Period time ranges (standard BIT Mesra): I=08:00-08:50, II=09:00-09:50, III=10:00-10:50, IV=11:00-11:50, V=12:00-12:50, VI=13:30-14:20, VII=14:30-15:20, VIII=15:30-16:20, IX=16:30-17:20.
5. Clean up OCR artifacts: "Artilicial" → "Artificial", "C$" → "CS", etc.
6. If metadata fields are missing, infer from context or use reasonable defaults.
7. Return ONLY valid JSON, no markdown, no explanation.`;

export async function structureWithOpenAI(rawText: string): Promise<ParsedTimetable> {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "paste-your-openai-key-here") {
    throw new Error("OPENAI_API_KEY not configured");
  }

  if (!rawText.trim()) {
    throw new Error("No OCR text to structure");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract the complete timetable from this OCR text:\n\n${rawText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  const parsed = JSON.parse(content) as ParsedTimetable;

  if (!parsed.metadata || !parsed.courses || !parsed.slots) {
    throw new Error("OpenAI response missing required fields");
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
