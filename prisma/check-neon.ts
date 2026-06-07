import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("NEON_USERS:", users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
  const timetables = await prisma.timetable.count();
  const slots = await prisma.timeSlot.count();
  console.log("NEON_STATS:", { timetables, slots });
}

main().catch(console.error).finally(() => prisma.$disconnect());
