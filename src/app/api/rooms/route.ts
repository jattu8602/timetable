import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.room.findMany({ orderBy: { createdAt: "desc" } });
  const departments = await prisma.department.findMany();
  const result = data.map((r) => ({
    ...r,
    department: departments.find((d) => d.id === r.departmentId) ?? null,
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { number, name, capacity, type, departmentId } = body;
  if (!number || !capacity || !departmentId) {
    return NextResponse.json({ error: "number, capacity, departmentId required" }, { status: 400 });
  }
  const data = await prisma.room.create({ data: { number, name, capacity, type, departmentId } });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, number, name, capacity, type, departmentId } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.room.update({ where: { id }, data: { number, name, capacity, type, departmentId } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.room.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
