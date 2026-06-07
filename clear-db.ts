import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');

  // Delete all TimeSlots
  await prisma.timeSlot.deleteMany();
  
  // Delete all Timetables
  await prisma.timetable.deleteMany();

  // Delete all CourseFaculty
  await prisma.courseFaculty.deleteMany();

  // Delete all Courses
  await prisma.course.deleteMany();

  // Delete all Faculty
  await prisma.faculty.deleteMany();

  // Delete all Rooms
  await prisma.room.deleteMany();

  // Delete all Branches
  await prisma.branch.deleteMany();

  // Delete all Users except admins
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'admin'
      }
    }
  });

  // Delete all Departments
  await prisma.department.deleteMany();

  console.log('Database cleared. Admin users retained.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
