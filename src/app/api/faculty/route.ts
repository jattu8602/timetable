import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.faculty.findMany({
    where: { deletedAt: null },
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.rows) {
    let created = 0;
    const errors: string[] = [];
    for (let i = 0; i < body.rows.length; i++) {
      const r = body.rows[i];
      const name = r.name || r.Name || "";
      const email = r.email || r.Email || "";
      if (!name || !email) { errors.push(`Row ${i + 1}: missing name or email`); continue; }
      try {
        await prisma.faculty.upsert({
          where: { email },
          update: { name, departmentId: r.departmentId || "" },
          create: { name, email, departmentId: r.departmentId || "" },
        });
        created++;
      } catch (e: any) { errors.push(`Row ${i + 1}: ${e.message}`); }
    }
    return NextResponse.json({ created, errors }, { status: 201 });
  }
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
  await prisma.faculty.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.faculty.update({
    where: { id },
    data: { deletedAt: null },
  });
  return NextResponse.json(data);
}
