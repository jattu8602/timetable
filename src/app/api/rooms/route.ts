import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = await prisma.room.findMany({
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
      const number = r.number || r.Number || r.ROOM_NUMBER || "";
      const departmentId = r.departmentId || r.DepartmentId || r.DEPARTMENT_ID || "";
      const capacity = parseInt(r.capacity || r.Capacity || r.CAPACITY || "0", 10);
      if (!number) { errors.push(`Row ${i + 1}: missing room number`); continue; }
      try {
        await prisma.room.upsert({
          where: { number_departmentId: { number, departmentId } },
          update: { capacity, type: (r.type || r.Type || "classroom").toLowerCase() },
          create: { number, name: r.name || r.Name || `Room ${number}`, capacity, type: (r.type || r.Type || "classroom").toLowerCase(), departmentId },
        });
        created++;
      } catch (e: any) { errors.push(`Row ${i + 1}: ${e.message}`); }
    }
    return NextResponse.json({ created, errors }, { status: 201 });
  }
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
  await prisma.room.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const data = await prisma.room.update({
    where: { id },
    data: { deletedAt: null },
  });
  return NextResponse.json(data);
}
