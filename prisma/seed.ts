import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

interface FileData {
  metadata: {
    department: string;
    program: string;
    branch: string;
    semester: string;
    wef_date: string;
    institution: string;
    academic_term: string;
  };
  courses: {
    code: string;
    type: string;
    name: string;
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

async function main() {
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

  const existingDept = await prisma.department.findFirst({ where: { shortCode: "CSE" } });
  if (existingDept) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const dataDir = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".txt")).sort();

  const allFiles: FileData[] = [];

  for (const fileName of files) {
    const content = fs.readFileSync(path.join(dataDir, fileName), "utf-8");
    const meta = parseMetadata(content);
    const courseEntries = parseCourses(content);
    const slotEntries = parseSlots(content);

    allFiles.push({
      metadata: meta,
      courses: courseEntries.map((c) => ({
        code: c.course_code,
        type: c.course_type,
        name: c.course_name,
        credits: parseFloat(c.credits) || 0,
        teacher: c.teacher,
      })),
      slots: slotEntries.map((s) => ({
        dayOfWeek: s.day_of_week,
        periodName: s.period_name,
        timeRange: s.time_range,
        subjectDetails: s.subject_details,
      })),
    });

    console.log(`${fileName}: ${courseEntries.length} courses, ${slotEntries.length} slots`);
  }

  console.log("\nSeeding database...");

  const dep = await prisma.department.create({
    data: { name: "CSE", shortCode: "CSE" },
  });

  const branchMap = new Map<string, string>();
  const branchSet = new Set<string>();

  for (const file of allFiles) {
    const key = `${file.metadata.program}|${file.metadata.branch}`;
    branchSet.add(key);
  }

  for (const key of branchSet) {
    const [program, name] = key.split("|");
    const branch = await prisma.branch.create({
      data: { name, program, departmentId: dep.id },
    });
    branchMap.set(key, branch.id);
  }

  const createdRooms = new Set<string>();
  const roomData: { number: string; name: string; capacity: number; type: "classroom" | "lab"; departmentId: string }[] = [];
  const allFacultyData: { name: string; email: string; departmentId: string }[] = [];
  const facultyEmailSet = new Set<string>();
  const courseCreateData: { code: string; name: string; credits: number; type: string; courseType: string; branchId: string; semester: string; departmentId: string }[] = [];
  const courseKeySet = new Set<string>();
  const timetableFacultyLinks: { courseCode: string; branchId: string; semester: string; teacher: string }[] = [];

  for (const file of allFiles) {
    const branchKey = `${file.metadata.program}|${file.metadata.branch}`;
    const branchId = branchMap.get(branchKey)!;

    for (const c of file.courses) {
      const courseKey = `${c.code}|${branchId}|${file.metadata.semester}`;
      if (!courseKeySet.has(courseKey)) {
        courseKeySet.add(courseKey);
        courseCreateData.push({
          code: c.code,
          name: c.name,
          credits: c.credits,
          type: c.type.toLowerCase().includes("lab") ? "lab" : "lecture",
          courseType: c.type,
          branchId,
          semester: file.metadata.semester,
          departmentId: dep.id,
        });
      }

      if (c.teacher && c.teacher !== "TBA") {
        timetableFacultyLinks.push({ courseCode: c.code, branchId, semester: file.metadata.semester, teacher: c.teacher });
        const emailPart = c.teacher.toLowerCase().replace(/[^a-z]/g, ".");
        const email = `${emailPart}@bitmesra.ac.in`;
        if (!facultyEmailSet.has(email)) {
          facultyEmailSet.add(email);
          allFacultyData.push({ name: c.teacher, email, departmentId: dep.id });
        }
      }
    }

    for (const s of file.slots) {
      const nums = [...(s.subjectDetails.match(/\b\d{3}[A-Z]?\b/g) ?? []), ...(s.subjectDetails.match(/[Ll]ab\s*\d+/g) ?? [])];
      for (const num of nums) {
        const roomKey = `${num}|${dep.id}`;
        if (!createdRooms.has(roomKey)) {
          createdRooms.add(roomKey);
          const type = num.toLowerCase().includes("lab") ? "lab" as const : "classroom" as const;
          roomData.push({ number: num, name: `Room ${num}`, capacity: 60, type, departmentId: dep.id });
        }
      }
    }
  }

  if (roomData.length > 0) {
    await prisma.room.createMany({ data: roomData });
    console.log(`  ${roomData.length} rooms`);
  }

  if (courseCreateData.length > 0) {
    await prisma.course.createMany({ data: courseCreateData as any });
    console.log(`  ${courseCreateData.length} courses`);
  }

  if (allFacultyData.length > 0) {
    await prisma.faculty.createMany({ data: allFacultyData });
    console.log(`  ${allFacultyData.length} faculty`);
  }

  const allCourses = await prisma.course.findMany({ where: { departmentId: dep.id } });
  const courseIndex = new Map<string, string>();
  for (const c of allCourses) courseIndex.set(`${c.code}|${c.branchId}|${c.semester}`, c.id);

  const facultyEmailToId = new Map<string, string>();
  const allFaculty = await prisma.faculty.findMany({ where: { departmentId: dep.id } });
  for (const f of allFaculty) facultyEmailToId.set(f.email, f.id);

  const cfSet = new Set<string>();
  const cfData: { courseId: string; facultyId: string }[] = [];
  for (const link of timetableFacultyLinks) {
    const emailPart = link.teacher.toLowerCase().replace(/[^a-z]/g, ".");
    const email = `${emailPart}@bitmesra.ac.in`;
    const facultyId = facultyEmailToId.get(email);
    if (!facultyId) continue;

    const courseId = courseIndex.get(`${link.courseCode}|${link.branchId}|${link.semester}`);
    if (courseId) {
      const cfKey = `${courseId}|${facultyId}`;
      if (!cfSet.has(cfKey)) {
        cfSet.add(cfKey);
        cfData.push({ courseId, facultyId });
      }
    }
  }

  if (cfData.length > 0) {
    await prisma.courseFaculty.createMany({ data: cfData });
    console.log(`  ${cfData.length} course-faculty links`);
  }

  let totalTimetables = 0;
  let totalSlots = 0;

  for (const file of allFiles) {
    const branchKey = `${file.metadata.program}|${file.metadata.branch}`;
    const branchId = branchMap.get(branchKey)!;

    const wefDate = file.metadata.wef_date ? new Date(file.metadata.wef_date.replace(/\./g, "-")) : new Date();

    const tt = await prisma.timetable.create({
      data: {
        institution: file.metadata.institution,
        academicTerm: file.metadata.academic_term,
        departmentId: dep.id,
        program: file.metadata.program,
        branchId,
        semesterName: file.metadata.semester,
        wefDate,
      },
    });
    totalTimetables++;

    if (file.slots.length > 0) {
      await prisma.timeSlot.createMany({
        data: file.slots.map((s) => ({
          timetableId: tt.id,
          dayOfWeek: s.dayOfWeek,
          periodName: s.periodName,
          timeRange: s.timeRange,
          subjectDetails: s.subjectDetails,
        })),
      });
      totalSlots += file.slots.length;
    }
  }

  console.log(`  ${totalTimetables} timetables`);
  console.log(`  ${totalSlots} slots`);

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

function parseMetadata(content: string) {
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

function parseCourses(content: string) {
  const entries: { course_code: string; course_type: string; course_name: string; credits: string; teacher: string }[] = [];
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

function parseSlots(content: string) {
  const entries: { day_of_week: string; period_name: string; time_range: string; subject_details: string }[] = [];
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
