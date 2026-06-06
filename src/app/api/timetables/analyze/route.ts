import { NextRequest, NextResponse } from "next/server";
import { getJob, analyzeOcrText } from "@/lib/upload-job";

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId required" }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "ocr_done") {
      return NextResponse.json(
        { error: `Cannot analyze job in status "${job.status}"` },
        { status: 400 },
      );
    }

    analyzeOcrText(jobId).catch(console.error);

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
