const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.timetable.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'PUBLISHED' }
  });
  console.log(`Auto-published ${result.count} existing timetables.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
