import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface FileMetadata {
  department: string;
  program: string;
  branch: string;
  semester: string;
  wef_date: string;
  institution: string;
  academic_term: string;
}

interface CourseEntry {
  course_code: string;
  course_type: string;
  course_name: string;
  credits: string;
  teacher: string;
}

interface SlotEntry {
  day_of_week: string;
  period_name: string;
  time_range: string;
  subject_details: string;
}

async function main() {
  const dataDir = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".txt")).sort();

  const existingDept = await prisma.department.findFirst({ where: { shortCode: "CSE" } });
  if (existingDept) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  for (const fileName of files) {
    const filePath = path.join(dataDir, fileName);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(`Processing ${fileName}...`);

    const metadata = parseMetadata(content);

    const dep = await prisma.department.upsert({
      where: { shortCode: metadata.department },
      update: {},
      create: { name: metadata.department, shortCode: metadata.department },
    });

    let branch = await prisma.branch.findFirst({
      where: { name: metadata.branch, program: metadata.program, departmentId: dep.id },
    });
    if (!branch) {
      branch = await prisma.branch.create({
        data: { name: metadata.branch, program: metadata.program, departmentId: dep.id },
      });
    }

    const courseEntries = parseCourses(content);
    for (const entry of courseEntries) {
      const existingCourse = await prisma.course.findFirst({
        where: { code: entry.course_code, branchId: branch.id, semester: metadata.semester },
      });
      if (!existingCourse) {
        await prisma.course.create({
          data: {
            code: entry.course_code,
            name: entry.course_name,
            credits: parseFloat(entry.credits) || 0,
            type: entry.course_type.toLowerCase().includes("lab") ? "lab" : "lecture",
            courseType: entry.course_type,
            branchId: branch.id,
            semester: metadata.semester,
            departmentId: dep.id,
          },
        });
      }

      if (entry.teacher && entry.teacher !== "TBA") {
        const emailPart = entry.teacher.toLowerCase().replace(/[^a-z]/g, ".");
        const email = `${emailPart}@bitmesra.ac.in`;
        await prisma.faculty.upsert({
          where: { email },
          update: { name: entry.teacher, departmentId: dep.id },
          create: { name: entry.teacher, email, departmentId: dep.id },
        });
      }
    }

    const slotEntries = parseSlots(content);
    for (const s of slotEntries) {
      const roomNumbers: string[] = [];
      const roomMatch = s.subject_details.match(/\b\d{3}[A-Z]?\b/g);
      if (roomMatch) roomNumbers.push(...roomMatch);
      const labMatch = s.subject_details.match(/[Ll]ab\s*\d+/g);
      if (labMatch) roomNumbers.push(...labMatch);

      for (const num of roomNumbers) {
        const existingRoom = await prisma.room.findFirst({
          where: { number: num, departmentId: dep.id },
        });
        if (!existingRoom) {
          const type = num.toLowerCase().includes("lab") ? "lab" : "classroom";
          await prisma.room.create({
            data: { number: num, name: `Room ${num}`, capacity: 60, type, departmentId: dep.id },
          });
        }
      }
    }

    const slots = slotEntries.map((s) => ({
      dayOfWeek: s.day_of_week,
      periodName: s.period_name,
      timeRange: s.time_range,
      subjectDetails: s.subject_details,
    }));

    if (slots.length > 0) {
      const wefDate = metadata.wef_date
        ? new Date(metadata.wef_date.replace(/\./g, "-"))
        : new Date();

      const timetable = await prisma.timetable.create({
        data: {
          institution: metadata.institution,
          academicTerm: metadata.academic_term,
          departmentId: dep.id,
          program: metadata.program,
          branchId: branch.id,
          semesterName: metadata.semester,
          wefDate,
        },
      });

      for (const slot of slots) {
        await prisma.timeSlot.create({
          data: {
            timetableId: timetable.id,
            dayOfWeek: slot.dayOfWeek,
            periodName: slot.periodName,
            timeRange: slot.timeRange,
            subjectDetails: slot.subjectDetails,
          },
        });
      }
    }

    console.log(`  → ${courseEntries.length} courses, ${slots.length} slots`);
  }

  const adminEmail = "admin@samayak.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const { createHash } = await import("node:crypto");
    const password = createHash("sha256").update("admin123").digest("hex");
    await prisma.user.create({
      data: { name: "Admin", email: adminEmail, password, role: "admin" },
    });
    console.log("Created admin user: admin@samayak.com / admin123");
  }

  const counts = {
    departments: await prisma.department.count(),
    branches: await prisma.branch.count(),
    courses: await prisma.course.count(),
    faculty: await prisma.faculty.count(),
    rooms: await prisma.room.count(),
    timetables: await prisma.timetable.count(),
    slots: await prisma.timeSlot.count(),
    users: await prisma.user.count(),
  };
  console.log("\nSeed complete:", counts);
}

function parseMetadata(content: string): FileMetadata {
  const dep = match(content, /Department\s*:\s*(.+)/);
  const program = match(content, /Program\s*:\s*(.+)/);
  const branch = match(content, /Branch\s*:\s*(.+)/);
  const semester = match(content, /Semester\s*:\s*(.+)/);
  const wefRaw = match(content, /W\.?\s*E\.?\s*F\.?\s*Date\s*:\s*(.+)/);
  const academic = match(content, /Academic\s*:\s*(.+)/) || "SPRING 2026";
  return {
    department: dep?.trim() ?? "Unknown",
    program: program?.trim() ?? "Unknown",
    branch: branch?.trim() ?? "Unknown",
    semester: semester?.trim() ?? "Unknown",
    wef_date: wefRaw?.trim() ?? "",
    institution: "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI",
    academic_term: academic.trim(),
  };
}

function parseCourses(content: string): CourseEntry[] {
  const entries: CourseEntry[] = [];
  const regex = /INSERT\s+INTO\s+courses[\s\S]*?VALUES\s*\((.+?)\)\s*;/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const vals = parseSQLValues(m[1]);
    if (vals.length >= 5) {
      entries.push({
        course_code: clean(vals[0]),
        course_type: clean(vals[1]),
        course_name: clean(vals[2]),
        credits: clean(vals[3]),
        teacher: clean(vals[4]),
      });
    }
  }
  return entries;
}

function parseSlots(content: string): SlotEntry[] {
  const entries: SlotEntry[] = [];
  const regex = /INSERT\s+INTO\s+timetable_slots[\s\S]*?VALUES\s*\((.+?)\)\s*;/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const vals = parseSQLValues(m[1]);
    if (vals.length >= 4) {
      entries.push({
        day_of_week: clean(vals[1]),
        period_name: clean(vals[2]),
        time_range: clean(vals[3]),
        subject_details: clean(vals[4]),
      });
    }
  }
  return entries;
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
    } else if (ch === "(" && !inQuotes) { parenDepth++; current += ch; }
    else if (ch === ")" && !inQuotes) { parenDepth--; current += ch; }
    else if (ch === "," && !inQuotes && parenDepth === 0) {
      result.push(current.trim());
      current = "";
    } else { current += ch; }
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
