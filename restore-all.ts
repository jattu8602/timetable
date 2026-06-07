import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.department.updateMany({ data: { deletedAt: null } });
  await prisma.branch.updateMany({ data: { deletedAt: null } });
  await prisma.room.updateMany({ data: { deletedAt: null } });
  await prisma.course.updateMany({ data: { deletedAt: null } });
  await prisma.faculty.updateMany({ data: { deletedAt: null } });
  await prisma.user.updateMany({ data: { deletedAt: null } });
  console.log("All records have been restored from soft-delete.");
}
main().then(() => prisma.$disconnect());
