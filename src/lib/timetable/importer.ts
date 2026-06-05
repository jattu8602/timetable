import { prisma } from "@/lib/prisma";
import { ParsedTimetable, ParsedCourse, ParsedSlot, ParsedMetadata } from "./parser";

export async function importTimetable(parsed: ParsedTimetable) {
  const { metadata, courses, slots } = parsed;

  const dept = await prisma.department.upsert({
    where: { shortCode: metadata.department },
    update: {},
    create: { name: metadata.department, shortCode: metadata.department },
  });

  const branchKey = `${metadata.program}|${metadata.branch}`;
  let branch = await prisma.branch.findFirst({
    where: { name: metadata.branch, program: metadata.program, departmentId: dept.id },
  });
  if (!branch) {
    branch = await prisma.branch.create({
      data: { name: metadata.branch, program: metadata.program, departmentId: dept.id },
    });
  }

  const wefDate = metadata.wefDate ? new Date(metadata.wefDate) : new Date();

  const timetable = await prisma.timetable.create({
    data: {
      institution: metadata.institution,
      academicTerm: metadata.academicTerm,
      departmentId: dept.id,
      program: metadata.program,
      branchId: branch.id,
      semesterName: metadata.semester,
      wefDate,
    },
  });

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
    } else {
      course = await prisma.course.create({
        data: {
          code: c.code,
          name: c.name,
          credits: c.credits,
          type: c.type.toLowerCase().includes("lab") ? "lab" : "lecture",
          courseType: c.type,
          branchId: branch.id,
          semester: metadata.semester,
          departmentId: dept.id,
        },
      });
    }

    if (c.teacher && c.teacher !== "TBA") {
      const emailPart = c.teacher.toLowerCase().replace(/[^a-z]/g, ".");
      const email = `${emailPart}@bitmesra.ac.in`;

      const faculty = await prisma.faculty.upsert({
        where: { email },
        update: { name: c.teacher, departmentId: dept.id },
        create: { name: c.teacher, email, departmentId: dept.id },
      });

      await prisma.courseFaculty.upsert({
        where: { courseId_facultyId: { courseId: course.id, facultyId: faculty.id } },
        update: {},
        create: { courseId: course.id, facultyId: faculty.id },
      });
    }
  }

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

    const roomNumbers = s.subjectDetails.match(/\b\d{3}[A-Z]?\b/g);
    if (roomNumbers) {
      for (const num of roomNumbers) {
        await prisma.room.upsert({
          where: { number_departmentId: { number: num, departmentId: dept.id } },
          update: {},
          create: {
            number: num,
            name: `Room ${num}`,
            capacity: 60,
            type: "classroom",
            departmentId: dept.id,
          },
        });
      }
    }
  }

  return timetable;
}
