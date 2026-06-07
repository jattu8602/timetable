import { NextRequest, NextResponse } from "next/server";
import { importQueue } from "@/lib/bull";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  try {
    const job = await importQueue.getJob(jobId);
    
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;

    if (state === "completed") {
      return NextResponse.json({ status: "completed", result: job.returnvalue });
    } else if (state === "failed") {
      return NextResponse.json({ status: "failed", error: job.failedReason });
    } else {
      return NextResponse.json({ status: state, progress });
    }
  } catch (error) {
    console.error("Error fetching job status:", error);
    return NextResponse.json({ error: "Failed to fetch job status" }, { status: 500 });
  }
}
