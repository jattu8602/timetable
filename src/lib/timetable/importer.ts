import { prisma } from "@/lib/prisma";
import { ParsedTimetable } from "./parser";

export interface ImportSummary {
  departments: { created: number; matched: number };
  branches: { created: number; matched: number };
  rooms: { created: number; matched: number };
  courses: { created: number; matched: number };
  faculty: { created: number; matched: number };
  slots: { created: number; matched: number };
  warnings: string[];
}

export async function importTimetable(parsed: ParsedTimetable, originalFileName?: string) {
  const { metadata, courses, slots } = parsed;

  const summary: ImportSummary = {
    departments: { created: 0, matched: 0 },
    branches: { created: 0, matched: 0 },
    rooms: { created: 0, matched: 0 },
    courses: { created: 0, matched: 0 },
    faculty: { created: 0, matched: 0 },
    slots: { created: 0, matched: 0 },
    warnings: [],
  };

  // 1. Department
  const existingDept = await prisma.department.findUnique({
    where: { shortCode: metadata.department },
  });

  const dept = await prisma.department.upsert({
    where: { shortCode: metadata.department },
    update: { deletedAt: null },
    create: { name: metadata.department, shortCode: metadata.department },
  });

  if (existingDept) {
    summary.departments.matched++;
  } else {
    summary.departments.created++;
  }

  // 2. Branch
  const branchKey = `${metadata.program}|${metadata.branch}`;
  let branch = await prisma.branch.findFirst({
    where: { name: metadata.branch, program: metadata.program, departmentId: dept.id },
  });

  if (branch) {
    if ((branch as any).deletedAt) {
      branch = await prisma.branch.update({ where: { id: branch.id }, data: { deletedAt: null } });
    }
    summary.branches.matched++;
  } else {
    branch = await prisma.branch.create({
      data: { name: metadata.branch, program: metadata.program, departmentId: dept.id },
    });
    summary.branches.created++;
  }

  const wefDate = metadata.wefDate ? new Date(metadata.wefDate) : new Date();

  // Create Timetable record
  const timetable = await prisma.timetable.create({
    data: {
      institution: metadata.institution,
      academicTerm: metadata.academicTerm,
      departmentId: dept.id,
      program: metadata.program,
      branchId: branch.id,
      semesterName: metadata.semester,
      wefDate,
      originalFileName,
    },
  });

  // 3. Courses & Faculty Links
  for (const c of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        code: c.code,
        branchId: branch.id,
        semester: metadata.semester,
      },
    });

    let course;
    if (existingCourse) {
      course = existingCourse;
      if (course.deletedAt) {
        course = await prisma.course.update({ where: { id: course.id }, data: { deletedAt: null } });
      }
      summary.courses.matched++;
    } else {
      if (c.credits === 0) {
        summary.warnings.push(`Course ${c.code} (${c.name}) has zero credits.`);
      }
      course = await prisma.course.create({
        data: {
          code: c.code,
          name: c.name,
          shortName: c.shortName || null,
          credits: c.credits,
          type: c.type.toLowerCase().includes("lab") ? "lab" : "lecture",
          courseType: c.type,
          branchId: branch.id,
          semester: metadata.semester,
          departmentId: dept.id,
        },
      });
      summary.courses.created++;
    }

    if (c.teacher && c.teacher !== "TBA") {
      const emailPart = c.teacher.toLowerCase().replace(/[^a-z]/g, ".");
      const email = `${emailPart}@bitmesra.ac.in`;

      const existingFac = await prisma.faculty.findUnique({
        where: { email },
      });

      const faculty = await prisma.faculty.upsert({
        where: { email },
        update: { name: c.teacher, departmentId: dept.id, deletedAt: null },
        create: { name: c.teacher, email, departmentId: dept.id },
      });

      if (existingFac) {
        summary.faculty.matched++;
      } else {
        summary.faculty.created++;
      }

      await prisma.courseFaculty.upsert({
        where: { courseId_facultyId: { courseId: course.id, facultyId: faculty.id } },
        update: {},
        create: { courseId: course.id, facultyId: faculty.id },
      });
    }
  }

  // 4. Slots & Room Mapping
  for (const s of slots) {
    await prisma.timeSlot.create({
      data: {
        timetableId: timetable.id,
        dayOfWeek: s.dayOfWeek,
        periodName: s.periodName,
        timeRange: s.timeRange,
        subjectDetails: s.subjectDetails,
      },
    });
    summary.slots.created++;

    const roomNumbers = s.subjectDetails.match(/\b\d{3}[A-Z]?\b/g);
    if (roomNumbers) {
      for (const num of roomNumbers) {
        const existingRoom = await prisma.room.findUnique({
          where: { number_departmentId: { number: num, departmentId: dept.id } },
        });

        if (existingRoom) {
          if (existingRoom.deletedAt) {
            await prisma.room.update({ where: { id: existingRoom.id }, data: { deletedAt: null } });
          }
          summary.rooms.matched++;
        } else {
          // Flag default room creation warning
          summary.warnings.push(`Room ${num} was automatically created with a default capacity of 60. Please verify.`);
          await prisma.room.create({
            data: {
              number: num,
              name: `Room ${num}`,
              capacity: 60,
              type: "classroom",
              departmentId: dept.id,
            },
          });
          summary.rooms.created++;
        }
      }
    }
  }

  return {
    timetable,
    summary,
  };
}

