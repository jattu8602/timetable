import { importTimetable } from "@/lib/timetable/importer";
import { ocrPdf, structureWithMistral } from "@/lib/mistral";

export interface UploadJob {
  id: string;
  fileName: string;
  status: "ocr" | "ocr_done" | "structuring" | "completed" | "error";
  text?: string;
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const jobs = new Map<string, UploadJob>();

export function createJob(fileName: string): string {
  const id = crypto.randomUUID();
  jobs.set(id, {
    id,
    fileName,
    status: "ocr",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return id;
}

export function getJob(jobId: string): UploadJob | undefined {
  return jobs.get(jobId);
}

export async function processOcr(jobId: string, buffer: Buffer) {
  try {
    const job = jobs.get(jobId);
    if (!job) return;

    const text = await ocrPdf(buffer);
    const current = jobs.get(jobId);
    if (!current) return;

    current.text = text;
    current.status = "ocr_done";
    current.updatedAt = Date.now();
  } catch (err) {
    const job = jobs.get(jobId);
    if (job) {
      job.status = "error";
      job.error = err instanceof Error ? err.message : "Unknown error";
      job.updatedAt = Date.now();
    }
  }
}

export async function analyzeOcrText(jobId: string) {
  try {
    const job = jobs.get(jobId);
    if (!job || !job.text) {
      throw new Error("No OCR text available");
    }

    job.status = "structuring";
    job.updatedAt = Date.now();

    const parsed = await structureWithMistral(job.text);

    if (parsed.slots.length === 0 && parsed.courses.length === 0) {
      job.status = "error";
      job.error = "Could not parse a valid timetable from the document.";
      job.updatedAt = Date.now();
      return;
    }

    const timetable = await importTimetable(parsed);

    job.status = "completed";
    job.finalTimetableId = timetable.id;
    job.finalSlotCount = parsed.slots.length;
    job.finalCourseCount = parsed.courses.length;
    job.updatedAt = Date.now();
  } catch (err) {
    const job = jobs.get(jobId);
    if (job) {
      job.status = "error";
      job.error = err instanceof Error ? err.message : "Unknown error";
      job.updatedAt = Date.now();
    }
  }
}
