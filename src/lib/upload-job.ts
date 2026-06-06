import type { ParsedTimetable } from "@/lib/timetable/parser";
import { structureWithOpenAI } from "@/lib/openai-timetable";
import { importTimetable } from "@/lib/timetable/importer";
import { ocrImage, renderPdfPages } from "@/lib/ocr";

export interface PageJob {
  pageNum: number;
  status: "pending" | "rendering" | "ocr" | "structuring" | "done" | "error";
  text?: string;
  result?: Partial<ParsedTimetable>;
  error?: string;
}

export interface UploadJob {
  id: string;
  fileName: string;
  totalPages: number;
  pages: PageJob[];
  overallStatus: "processing" | "completed" | "error";
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
  createdAt: number;
  updatedAt: number;
}

const jobs = new Map<string, UploadJob>();

const CONCURRENCY = 3;

export function createJob(fileName: string, totalPages: number): string {
  const id = crypto.randomUUID();
  const pages: PageJob[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNum: i, status: "pending" });
  }
  jobs.set(id, {
    id,
    fileName,
    totalPages,
    pages,
    overallStatus: "processing",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  return id;
}

export function getJob(jobId: string): UploadJob | undefined {
  return jobs.get(jobId);
}

function updatePage(jobId: string, pageNum: number, updates: Partial<PageJob>) {
  const job = jobs.get(jobId);
  if (!job) return;
  const page = job.pages.find((p) => p.pageNum === pageNum);
  if (!page) return;
  Object.assign(page, updates);
  job.updatedAt = Date.now();
}

export async function processPdf(jobId: string, buffer: Buffer) {
  try {
    const job = jobs.get(jobId);
    if (!job) return;

    const pageImages = await renderPdfPages(buffer);

    job.totalPages = pageImages.length;
    job.pages = pageImages.map((_, i) => ({
      pageNum: i + 1,
      status: "pending" as const,
    }));

    const allResults: { pageNum: number; result: ParsedTimetable }[] = [];

    for (let i = 0; i < pageImages.length; i += CONCURRENCY) {
      const batch = pageImages.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (img, idx) => {
          const pageNum = i + idx + 1;
          updatePage(jobId, pageNum, { status: "ocr" });
          const text = await ocrImage(img);
          if (!text.trim()) {
            updatePage(jobId, pageNum, { status: "error", error: "No text extracted" });
            return null;
          }
          updatePage(jobId, pageNum, { status: "structuring", text });
          try {
            const result = await structureWithOpenAI(text);
            updatePage(jobId, pageNum, { status: "done", result: result as Partial<ParsedTimetable> });
            return { pageNum, result };
          } catch (e) {
            const msg = e instanceof Error ? e.message : "AI structuring failed";
            updatePage(jobId, pageNum, { status: "error", error: msg });
            return null;
          }
        })
      );
      for (const r of batchResults) {
        if (r) allResults.push(r);
      }
    }

    if (allResults.length === 0) {
      job.overallStatus = "error";
      job.updatedAt = Date.now();
      return;
    }

    const merged: ParsedTimetable = mergeResults(allResults.map((r) => r.result));

    if (merged.slots.length === 0 && merged.courses.length === 0) {
      job.overallStatus = "error";
      job.updatedAt = Date.now();
      return;
    }

    const timetable = await importTimetable(merged);

    job.overallStatus = "completed";
    job.finalTimetableId = timetable.id;
    job.finalSlotCount = merged.slots.length;
    job.finalCourseCount = merged.courses.length;
    job.updatedAt = Date.now();
  } catch (err) {
    const job = jobs.get(jobId);
    if (job) {
      job.overallStatus = "error";
      job.updatedAt = Date.now();
    }
  }
}

function mergeResults(results: Partial<ParsedTimetable>[]): ParsedTimetable {
  const coursesMap = new Map<string, { code: string; name: string; type: string; credits: number; teacher: string }>();
  const slotsSet = new Set<string>();
  const allSlots: ParsedTimetable["slots"] = [];

  let metadata: ParsedTimetable["metadata"] = {
    department: "Unknown",
    program: "Unknown",
    branch: "Unknown",
    semester: "Unknown",
    wefDate: "",
    institution: "BIRLA INSTITUTE OF TECHNOLOGY MESRA, RANCHI",
    academicTerm: "SPRING 2026",
  };

  for (const r of results) {
    if (!r) continue;
    if (r.metadata) {
      if (r.metadata.department && r.metadata.department !== "Unknown") metadata.department = r.metadata.department;
      if (r.metadata.program && r.metadata.program !== "Unknown") metadata.program = r.metadata.program;
      if (r.metadata.branch && r.metadata.branch !== "Unknown") metadata.branch = r.metadata.branch;
      if (r.metadata.semester && r.metadata.semester !== "Unknown") metadata.semester = r.metadata.semester;
      if (r.metadata.wefDate) metadata.wefDate = r.metadata.wefDate;
      if (r.metadata.institution) metadata.institution = r.metadata.institution;
      if (r.metadata.academicTerm) metadata.academicTerm = r.metadata.academicTerm;
    }
    if (r.courses) {
      for (const c of r.courses) {
        if (!coursesMap.has(c.code)) {
          coursesMap.set(c.code, c);
        }
      }
    }
    if (r.slots) {
      for (const s of r.slots) {
        const key = `${s.dayOfWeek}|${s.periodName}`;
        if (!slotsSet.has(key)) {
          slotsSet.add(key);
          allSlots.push(s);
        }
      }
    }
  }

  return {
    metadata,
    courses: Array.from(coursesMap.values()),
    slots: allSlots,
  };
}
