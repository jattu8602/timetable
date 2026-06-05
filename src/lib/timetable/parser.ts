export interface ParsedMetadata {
  department: string;
  program: string;
  branch: string;
  semester: string;
  wefDate: string;
  institution: string;
  academicTerm: string;
}

export interface ParsedSlot {
  dayOfWeek: string;
  periodName: string;
  timeRange: string;
  subjectDetails: string;
}

export interface ParsedCourse {
  code: string;
  name: string;
  type: string;
  credits: number;
  teacher: string;
}

export interface ParsedTimetable {
  metadata: ParsedMetadata;
  slots: ParsedSlot[];
  courses: ParsedCourse[];
}

const PERIODS: Record<string, string> = {
  I: "08:00-08:50",
  II: "09:00-09:50",
  III: "10:00-10:50",
  IV: "11:00-11:50",
  V: "12:00-12:50",
  VI: "13:30-14:20",
  VII: "14:30-15:20",
  VIII: "15:30-16:20",
  IX: "16:30-17:20",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function parseTimetableText(text: string): ParsedTimetable {
  const metadata = parseMetadata(text);
  const courses = parseCourses(text);
  const slots = parseSlots(text);

  if (slots.length === 0) {
    return { metadata, courses, slots: parseGridSlots(text, metadata) };
  }

  return { metadata, courses, slots };
}

function parseMetadata(text: string): ParsedMetadata {
  const dept = match(text, /Department\s*:\s*(.+)/);
  const program = match(text, /Program\s*:\s*(.+)/);
  const branch = match(text, /Branch\s*:\s*(.+)/);
  const semester = match(text, /Semester\s*:\s*(.+)/);
  const wefRaw = match(text, /W\.?\s*E\.?\s*F\.?\s*Date\s*:\s*(.+)/);
  const academic = match(text, /Academic\s*:\s*(.+)/) || match(text, /SPRING\s+\d+|FALL\s+\d+/i) || "SPRING 2026";

  let wefDate = wefRaw?.replace(/\./g, "-").trim() ?? "";
  if (wefDate && !/^\d{4}-\d{2}-\d{2}$/.test(wefDate)) {
    const parts = wefDate.split(/[-\/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) wefDate = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      else wefDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  return {
    department: dept?.trim() ?? "Unknown",
    program: program?.trim() ?? "Unknown",
    branch: branch?.trim() ?? "Unknown",
    semester: semester?.trim() ?? "Unknown",
    wefDate,
    institution: "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI",
    academicTerm: academic?.trim() ?? "SPRING 2026",
  };
}

function parseCourses(text: string): ParsedCourse[] {
  const courses: ParsedCourse[] = [];

  const courseRegex = /INSERT\s+INTO\s+courses\s*[^()]*VALUES\s*\((.+?)\)\s*;/gi;
  let matchCourse;
  while ((matchCourse = courseRegex.exec(text)) !== null) {
    const vals = parseSQLValues(matchCourse[1]);
    if (vals.length >= 5) {
      courses.push({
        code: clean(vals[0]),
        name: clean(vals[2]),
        type: clean(vals[1]),
        credits: parseFloat(clean(vals[3])) || 0,
        teacher: clean(vals[4]),
      });
    }
  }

  const tableRegex = /COURSE\s+LIST\s*.*?\n[-=]+\n([\s\S]*?)(?=\n[-=]+\n|\nINSERT|\n*$)/i;
  const tableMatch = text.match(tableRegex);
  if (tableMatch && courses.length === 0) {
    const lines = tableMatch[1].split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 4 && /^[A-Z]{2,}\d+/.test(parts[0])) {
        courses.push({
          code: parts[0],
          name: parts[2] ?? "",
          type: parts[1] ?? "",
          credits: parseFloat(parts[3]) || 0,
          teacher: parts[4] ?? "",
        });
      }
    }
  }

  return courses;
}

function parseSlots(text: string): ParsedSlot[] {
  const slots: ParsedSlot[] = [];
  const slotRegex = /INSERT\s+INTO\s+timetable_slots\s*[^()]*VALUES\s*\((.+?)\)\s*;/gi;
  let match;
  while ((match = slotRegex.exec(text)) !== null) {
    const vals = parseSQLValues(match[1]);
    if (vals.length >= 4) {
      slots.push({
        dayOfWeek: clean(vals[1]),
        periodName: clean(vals[2]),
        timeRange: clean(vals[3]),
        subjectDetails: clean(vals[4]),
      });
    }
  }
  return slots;
}

function parseGridSlots(text: string, metadata: ParsedMetadata): ParsedSlot[] {
  const slots: ParsedSlot[] = [];
  const lines = text.split("\n");
  let inGrid = false;
  let headerPeriods: string[] = [];
  let headerTimes: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^\+[-+]+\+/.test(line)) {
      if (!inGrid) {
        inGrid = true;
        continue;
      }
      if (headerPeriods.length > 0) break;
    }

    if (!inGrid) continue;

    if (line.startsWith("| Days") || line.startsWith("|    Days")) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
      headerPeriods = cells.slice(1);
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const timeCells = nextLine.split("|").map((c) => c.trim()).filter(Boolean);
        headerTimes = timeCells.slice(1);
      }
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      const cells = line.split("|").map((c) => c.trim());
      const dayName = cells[1];
      if (!dayName) continue;

      const dayIndex = DAYS.findIndex((d) => dayName.toLowerCase().startsWith(d.toLowerCase()));
      if (dayIndex === -1) continue;
      const dayOfWeek = DAYS[dayIndex];

      for (let j = 2; j < cells.length; j++) {
        const periodIdx = j - 2;
        if (periodIdx >= headerPeriods.length) break;

        const periodName = headerPeriods[periodIdx];
        if (periodName === "LUNCH" || periodName === "Days") continue;

        const content = cells[j]?.trim() ?? "";
        if (!content || content === "" || content === "|") continue;

        const timeRange = periodIdx < headerTimes.length && headerTimes[periodIdx]
          ? headerTimes[periodIdx]
          : (PERIODS[periodName] ?? "");

        slots.push({
          dayOfWeek,
          periodName,
          timeRange,
          subjectDetails: content,
        });
      }
    }
  }

  return slots;
}

function parseSQLValues(valuesStr: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let parenDepth = 0;

  for (let i = 0; i < valuesStr.length; i++) {
    const ch = valuesStr[i];
    if (ch === "'" && (i === 0 || valuesStr[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "(" && !inQuotes) {
      parenDepth++;
      current += ch;
    } else if (ch === ")" && !inQuotes) {
      parenDepth--;
      current += ch;
    } else if (ch === "," && !inQuotes && parenDepth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function match(text: string, regex: RegExp): string | null {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

function clean(s: string): string {
  return s.replace(/^['"]|['"]$/g, "").trim();
}
