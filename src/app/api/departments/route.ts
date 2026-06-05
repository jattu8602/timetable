import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.department.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, shortCode } = body;
  if (!name || !shortCode) {
    return NextResponse.json({ error: "name and shortCode required" }, { status: 400 });
  }
  const data = await prisma.department.create({ data: { name, shortCode } });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name, shortCode } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.department.update({
    where: { id },
    data: { name, shortCode },
  });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await prisma.department.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
