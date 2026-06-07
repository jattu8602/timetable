import { NextRequest, NextResponse } from "next/server";
import { importQueue } from "@/lib/bull";

export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    const { entity } = params;
    const allowedEntities = ["departments", "rooms", "courses", "faculty", "users"];
    
    if (!allowedEntities.includes(entity)) {
      return NextResponse.json({ error: "Invalid entity for import" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const duplicateAction = (formData.get("duplicateAction") as string) || "merge";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const fileName = file.name;

    const job = await importQueue.add("import-jobs", {
      entity,
      fileName,
      fileData: base64Data,
      duplicateAction
    });

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to queue import job" }, { status: 500 });
  }
}
