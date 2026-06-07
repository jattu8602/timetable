import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeDeleted = searchParams.get("includeDeleted") === "true";

  const users = await prisma.user.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      role: true, 
      departmentId: true,
      createdAt: true, 
      deletedAt: true,
      department: { select: { name: true, shortCode: true } }
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle Bulk Import
    if (body.rows) {
      const duplicateAction = body.duplicateAction || "merge"; // "skip" or "merge"
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      const { createHash } = await import("node:crypto");
      const defaultPassword = createHash("sha256").update("changeMe123").digest("hex");

      for (let i = 0; i < body.rows.length; i++) {
        const r = body.rows[i];
        const name = r.name || r.Name || "";
        const email = r.email || r.Email || "";
        const role = (r.role || r.Role || "professor").toLowerCase();
        const departmentId = r.departmentId || r.DepartmentId || null;

        if (!name || !email) {
          errors.push(`Row ${i + 1}: missing name or email`);
          continue;
        }

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            if (duplicateAction === "skip") {
              skipped++;
              continue;
            } else {
              // Merge: update fields
              await prisma.user.update({
                where: { email },
                data: {
                  name,
                  role: role as any,
                  departmentId: departmentId || null,
                  deletedAt: null, // Undelete if soft-deleted
                },
              });
              updated++;
            }
          } else {
            // Create new user with default hashed password
            const passwordVal = r.password || r.Password || "changeMe123";
            const hashedPassword = createHash("sha256").update(passwordVal).digest("hex");

            await prisma.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                role: role as any,
                departmentId: departmentId || null,
              },
            });
            created++;
          }
        } catch (e: any) {
          errors.push(`Row ${i + 1}: ${e.message}`);
        }
      }

      return NextResponse.json(
        { created, updated, skipped, errors },
        { status: 201 }
      );
    }

    // Handle Single Creation
    const { name, email, password, role, departmentId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, and password required" }, { status: 400 });
    }

    const { createHash } = await import("node:crypto");
    const hashedPassword = createHash("sha256").update(password).digest("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ?? "admin",
        departmentId: departmentId || null,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, password, role, departmentId } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const data: any = {
      name,
      email,
      role,
      departmentId: departmentId || null,
    };

    if (password) {
      const { createHash } = await import("node:crypto");
      data.password = createHash("sha256").update(password).digest("hex");
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");
  
  if (ids) {
    const idArray = ids.split(",");
    await prisma.user.updateMany({ where: { id: { in: idArray } }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  
  // Soft delete
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    
    // Restore soft-deleted user
    const user = await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

