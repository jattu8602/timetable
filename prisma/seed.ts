import { PrismaClient, RoomType, CourseType, UserRole } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const prisma = new PrismaClient();

interface ParsedTXT {
  metadata: {
    institution: string;
    academic_term: string;
    department: string;
    program: string;
    branch: string;
    semester: string;
    wef_date: string;
  };
  courses: Array<{
    course_code: string;
    course_type: string;
    course_name: string;
    credits: string;
    teacher: string;
  }>;
  slots: Array<{
    day_of_week: string;
    period_name: string;
    time_range: string;
    subject_details: string;
  }>;
}

function parseTXTFile(filePath: string): ParsedTXT {
  const content = fs.readFileSync(filePath, "utf-8");

  const metadata: ParsedTXT["metadata"] = {
    institution: "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI",
    academic_term: "SPRING 2026",
    department: "CSE",
    program: "B.Tech",
    branch: "CS",
    semester: "VI A",
    wef_date: "2026-01-08",
  };

  const deptMatch = content.match(/Department\s*:\s*(\w+)/);
  const progMatch = content.match(/Program\s*:\s*([\w.]+)/);
  const branchMatch = content.match(/Branch\s*:\s*([\w\s]+)/);
  const semMatch = content.match(/Semester\s*:\s*([\w\s]+)/);
  const wefMatch = content.match(/W\.E\.F\s*Date\s*:\s*([\d.]+)/);

  if (deptMatch) metadata.department = deptMatch[1].trim();
  if (progMatch) metadata.program = progMatch[1].trim();
  if (branchMatch) metadata.branch = branchMatch[1].trim();
  if (semMatch) metadata.semester = semMatch[1].trim();
  if (wefMatch) metadata.wef_date = wefMatch[1].replace(/\./g, "-");

  const courses: ParsedTXT["courses"] = [];
  const courseRegex =
    /INSERT INTO courses[\s\S]*?VALUES\s*\((.*?)\);/g;
  let match;
  while ((match = courseRegex.exec(content)) !== null) {
    const values = match[1];
    const parts = parseSQLValues(values);
    if (parts.length >= 6) {
      courses.push({
        course_code: parts[0].replace(/'/g, ""),
        course_type: parts[1].replace(/'/g, ""),
        course_name: parts[2].replace(/'/g, ""),
        credits: parts[3].replace(/'/g, ""),
        teacher: parts[4].replace(/'/g, ""),
      });
    }
  }

  const slots: ParsedTXT["slots"] = [];
  const slotRegex =
    /INSERT INTO timetable_slots[\s\S]*?VALUES\s*\((.*?)\);/g;
  while ((match = slotRegex.exec(content)) !== null) {
    const values = match[1];
    const parts = parseSQLValues(values);
    if (parts.length >= 5) {
      slots.push({
        day_of_week: parts[1].replace(/'/g, ""),
        period_name: parts[2].replace(/'/g, ""),
        time_range: parts[3].replace(/'/g, ""),
        subject_details: parts[4].replace(/'/g, ""),
      });
    }
  }

  return { metadata, courses, slots };
}

function parseSQLValues(values: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let parenDepth = 0;

  for (let i = 0; i < values.length; i++) {
    const ch = values[i];
    if (ch === "'" && (i === 0 || values[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "," && !inQuotes && parenDepth === 0) {
      result.push(current.trim());
      current = "";
    } else if (ch === "(" && !inQuotes) {
      parenDepth++;
      current += ch;
    } else if (ch === ")" && !inQuotes) {
      parenDepth--;
      current += ch;
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function parseCredits(credits: string): number {
  if (credits === "NC" || credits === "-" || credits === "") return 0;
  return parseFloat(credits) || 0;
}

function getCourseType(type: string): CourseType {
  const t = type.toLowerCase();
  if (t.includes("lab")) return CourseType.lab;
  if (t.includes("tutorial") || t === "t") return CourseType.tutorial;
  if (t.includes("project") || t === "proj.") return CourseType.project;
  if (t.includes("activity") || t === "activity (any one)")
    return CourseType.activity;
  if (t.includes("elective") || t === "oe" || t === "pe iii")
    return CourseType.elective;
  return CourseType.lecture;
}

function determineRoomType(roomNum: string): RoomType {
  const lower = roomNum.toLowerCase();
  if (lower.startsWith("lab")) return RoomType.lab;
  return RoomType.classroom;
}

function extractRoomNumbers(subjectDetails: string): string[] {
  const rooms: string[] = [];
  const roomRegex = /(\d{3}[A-Z]?|[Ll]ab\s*\d+)/g;
  let match;
  while ((match = roomRegex.exec(subjectDetails)) !== null) {
    const room = match[1];
    if (!rooms.includes(room)) rooms.push(room);
  }
  return rooms;
}

async function main() {
  console.log("Seeding database...");

  const dept = await prisma.department.upsert({
    where: { shortCode: "CSE" },
    update: {},
    create: { name: "Computer Science & Engineering", shortCode: "CSE" },
  });
  console.log(`Department: ${dept.name}`);

  const adminPassword = crypto
    .createHash("sha256")
    .update("admin123")
    .digest("hex");

  await prisma.user.upsert({
    where: { email: "admin@samayak.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@samayak.com",
      password: adminPassword,
      role: UserRole.admin,
      departmentId: dept.id,
    },
  });
  console.log("Admin user created (admin@samayak.com / admin123)");

  const files = fs
    .readdirSync(path.join(__dirname, "../data"))
    .filter((f) => f.startsWith("txt") && f.endsWith(".txt"))
    .sort((a, b) => {
      const na = parseInt(a.replace("txt", "").replace(".txt", ""));
      const nb = parseInt(b.replace("txt", "").replace(".txt", ""));
      return na - nb;
    });

  const branchCache = new Map<string, string>();
  const roomCache = new Map<string, string>();
  const facultyCache = new Map<string, string>();
  const courseCache = new Map<string, string>();

  for (const fileName of files) {
    const filePath = path.join(__dirname, "../data", fileName);
    console.log(`Processing: ${fileName}`);
    const parsed = parseTXTFile(filePath);

    const branchKey = `${parsed.metadata.program}|${parsed.metadata.branch}`;
    if (!branchCache.has(branchKey)) {
      const branch = await prisma.branch.create({
        data: {
          name: parsed.metadata.branch,
          program: parsed.metadata.program,
          departmentId: dept.id,
        },
      });
      branchCache.set(branchKey, branch.id);
    }
    const branchId = branchCache.get(branchKey)!;

    for (const course of parsed.courses) {
      if (course.course_code === "-" || course.course_code === "") continue;

      const courseName = course.course_name.split("(")[0].trim();
      const courseKey = `${course.course_code}|${branchId}|${parsed.metadata.semester}`;

      if (!courseCache.has(courseKey)) {
        const created = await prisma.course.create({
          data: {
            code: course.course_code,
            name: courseName,
            credits: parseCredits(course.credits),
            type: getCourseType(course.course_type),
            courseType: course.course_type,
            branchId: branchId,
            semester: parsed.metadata.semester,
            departmentId: dept.id,
          },
        });
        courseCache.set(courseKey, created.id);
      }
    }

    for (const slot of parsed.slots) {
      const rooms = extractRoomNumbers(slot.subject_details);
      for (const roomNum of rooms) {
        const roomKey = `${roomNum}|${dept.id}`;
        if (!roomCache.has(roomKey)) {
          const created = await prisma.room.upsert({
            where: { number_departmentId: { number: roomNum, departmentId: dept.id } },
            update: {},
            create: {
              number: roomNum,
              name: roomNum,
              departmentId: dept.id,
              capacity: roomNum.toLowerCase().startsWith("lab") ? 30 : 60,
              type: determineRoomType(roomNum),
            },
          });
          roomCache.set(roomKey, created.id);
        }
      }
    }

    for (const course of parsed.courses) {
      if (course.teacher === "-" || course.teacher === "") continue;
      const teachers = course.teacher.split("&").map((t) => t.trim());
      for (const teacher of teachers) {
        const emailKey = teacher.toLowerCase().replace(/\s+/g, ".");
        if (!facultyCache.has(emailKey)) {
          const created = await prisma.faculty.upsert({
            where: { email: `${emailKey}@bitmesra.ac.in` },
            update: {},
            create: {
              name: teacher,
              email: `${emailKey}@bitmesra.ac.in`,
              departmentId: dept.id,
            },
          });
          facultyCache.set(emailKey, created.id);
        }
      }
    }

    const timetable = await prisma.timetable.create({
      data: {
        institution: parsed.metadata.institution,
        academicTerm: parsed.metadata.academic_term,
        departmentId: dept.id,
        program: parsed.metadata.program,
        branchId: branchId,
        semesterName: parsed.metadata.semester,
        wefDate: new Date(parsed.metadata.wef_date),
      },
    });

    for (const slot of parsed.slots) {
      await prisma.timeSlot.create({
        data: {
          timetableId: timetable.id,
          dayOfWeek: slot.day_of_week,
          periodName: slot.period_name,
          timeRange: slot.time_range,
          subjectDetails: slot.subject_details,
        },
      });
    }

    for (const course of parsed.courses) {
      if (course.course_code === "-" || course.course_code === "") continue;
      const courseKey = `${course.course_code}|${branchId}|${parsed.metadata.semester}`;
      const courseId = courseCache.get(courseKey);
      if (!courseId) continue;

      const teachers = course.teacher.split("&").map((t) => t.trim());
      for (const teacher of teachers) {
        if (teacher === "-") continue;
        const emailKey = teacher.toLowerCase().replace(/\s+/g, ".");
        const facultyId = facultyCache.get(emailKey);
        if (facultyId) {
          await prisma.courseFaculty
            .create({
              data: { courseId, facultyId },
            })
            .catch(() => {});
        }
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
