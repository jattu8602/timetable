import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const rooms = await prisma.room.findMany();
  console.log("Rooms:", rooms.map(r => r.number));
  
  const depts = await prisma.department.findMany();
  console.log("Depts:", depts.map(d => d.shortCode));
}
main().then(() => prisma.$disconnect());
