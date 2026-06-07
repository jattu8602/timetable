import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const depts = await prisma.department.count();
  const rooms = await prisma.room.count();
  const courses = await prisma.course.count();
  const faculty = await prisma.faculty.count();
  console.log(`Departments: ${depts}`);
  console.log(`Rooms: ${rooms}`);
  console.log(`Courses: ${courses}`);
  console.log(`Faculty: ${faculty}`);
}
main().then(() => prisma.$disconnect());
