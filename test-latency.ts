import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing DB latency...');
  
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const end = Date.now();
  
  console.log(`Simple SELECT 1 took: ${end - start}ms`);
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
