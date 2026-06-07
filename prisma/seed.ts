import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

async function main() {
  const adminEmail = "admin@samayak.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    const { createHash } = await import("node:crypto");
    const password = createHash("sha256").update("admin123").digest("hex");
    await prisma.user.create({
      data: { name: "Admin", email: adminEmail, password, role: "admin" },
    });
    console.log("Created admin user: admin@samayak.com / admin123");
  } else {
    console.log("Admin user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
