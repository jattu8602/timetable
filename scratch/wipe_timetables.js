const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Wiping all timetables and their relations...');
  
  // Due to cascade deletes, deleting Timetables deletes TimeSlots
  const deleteTimetables = await prisma.timetable.deleteMany({});
  console.log(`Deleted ${deleteTimetables.count} timetables.`);
  
  const deleteCourses = await prisma.course.deleteMany({});
  console.log(`Deleted ${deleteCourses.count} courses.`);
  
  console.log('Database wipe complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
