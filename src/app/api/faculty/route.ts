import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.faculty.findMany({ orderBy: { createdAt: "desc" } });
  const departments = await prisma.department.findMany();
  const result = data.map((f) => ({
    ...f,
    department: departments.find((d) => d.id === f.departmentId) ?? null,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, departmentId } = body;
  if (!name || !email || !departmentId) {
    return NextResponse.json({ error: "name, email, departmentId required" }, { status: 400 });
  }
  const data = await prisma.faculty.create({ data: { name, email, departmentId } });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, email, departmentId } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.faculty.update({ where: { id }, data: { name, email, departmentId } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.faculty.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
