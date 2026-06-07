import { getRedisConnection } from "@/lib/bull";

export interface UploadJob {
  id: string;
  fileName: string;
  status: "queued" | "parsing" | "integrating" | "completed" | "error";
  text?: string;
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
  error?: string;
  summary?: any;
  createdAt: number;
  updatedAt: number;
}

const redis = getRedisConnection();

export async function createJob(id: string, fileName: string): Promise<UploadJob> {
  const job: UploadJob = {
    id,
    fileName,
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const jobKey = `job:${id}`;
  await redis.set(jobKey, JSON.stringify(job), "EX", 86400); // Expires in 24 hours
  return job;
}

export async function getJob(jobId: string): Promise<UploadJob | undefined> {
  const jobKey = `job:${jobId}`;
  const data = await redis.get(jobKey);
  if (!data) return undefined;
  return JSON.parse(data) as UploadJob;
}

