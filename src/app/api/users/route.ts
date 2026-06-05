import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role ?? "admin",
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return Response.json(user, { status: 201 });
}
