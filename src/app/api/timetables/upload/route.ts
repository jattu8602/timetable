import { NextRequest, NextResponse } from "next/server";
import { createJob, getJob } from "@/lib/upload-job";
import { timetableQueue, getRedisConnection } from "@/lib/bull";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const jobId = crypto.randomUUID();

    // 1. Store raw PDF buffer bytes in Redis temporarily for worker retrieval
    const redis = getRedisConnection();
    await redis.set(`pdf:${jobId}`, buffer, "EX", 3600); // 1 hour expiry

    // 2. Initialize job state in Redis (queued status)
    await createJob(jobId, file.name);

    // 3. Enqueue the task into BullMQ
    await timetableQueue.add("ingest-pdf", { jobId });

    return NextResponse.json({ jobId, fileName: file.name }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }
  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json(job);
}

