import { structureWithOpenAI } from "@/lib/openai-timetable";
import { importTimetable } from "@/lib/timetable/importer";
import { ocrImage, renderPdfPages } from "@/lib/ocr";

export interface UploadJob {
  id: string;
  fileName: string;
  status: "ocr" | "structuring" | "completed" | "error";
  totalPages?: number;
  currentPage?: number;
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

export async function processPdf(jobId: string, buffer: Buffer) {
  try {
    const pageImages = await renderPdfPages(buffer);
    const totalPages = pageImages.length;

    const job = jobs.get(jobId);
    if (!job) return;
    job.totalPages = totalPages;
    job.updatedAt = Date.now();

    const ocrTexts: string[] = [];

    for (let i = 0; i < totalPages; i++) {
      job.currentPage = i + 1;
      job.updatedAt = Date.now();
      const text = await ocrImage(pageImages[i]);
      if (text.trim()) {
        ocrTexts.push(text);
      }
    }

    const combinedText = ocrTexts.join("\n\n");

    if (!combinedText.trim()) {
      job.status = "error";
      job.error = "No text could be extracted from any page.";
      job.updatedAt = Date.now();
      return;
    }

    job.status = "structuring";
    job.text = combinedText;
    job.updatedAt = Date.now();

    const parsed = await structureWithOpenAI(combinedText);

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
