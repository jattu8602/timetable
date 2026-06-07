import { Worker, Job } from "bullmq";
import { getRedisConnection } from "./bull";
import { ocrPdf, structureWithMistral } from "./mistral";
import { importTimetable } from "./timetable/importer";

interface JobData {
  jobId: string;
}

const redis = getRedisConnection();

export const timetableWorker = new Worker<JobData>(
  "timetable-ingestion",
  async (job: Job<JobData>) => {
    const { jobId } = job.data;
    console.log(`[worker] Starting job ${jobId}...`);

    const jobKey = `job:${jobId}`;
    const pdfKey = `pdf:${jobId}`;

    try {
      // 1. Check job exists
      const jobDataRaw = await redis.get(jobKey);
      if (!jobDataRaw) {
        throw new Error("Job state not found in Redis");
      }
      const jobData = JSON.parse(jobDataRaw);

      // 2. Transition to "parsing" (OCR phase)
      jobData.status = "parsing";
      jobData.updatedAt = Date.now();
      await redis.set(jobKey, JSON.stringify(jobData), "EX", 86400);

      // Fetch PDF bytes from Redis
      const buffer = await redis.getBuffer(pdfKey);
      if (!buffer) {
        throw new Error("PDF file buffer not found in Redis");
      }

      console.log(`[worker] Running OCR for job ${jobId}...`);
      const text = await ocrPdf(buffer);

      // Update text in job state
      jobData.text = text;
      jobData.status = "integrating"; // Transitioning to structuring & database integration
      jobData.updatedAt = Date.now();
      await redis.set(jobKey, JSON.stringify(jobData), "EX", 86400);

      console.log(`[worker] Structuring OCR text with AI for job ${jobId}...`);
      const parsed = await structureWithMistral(text);

      if (parsed.slots.length === 0 && parsed.courses.length === 0) {
        throw new Error("Could not parse any courses or slots from the uploaded timetable PDF.");
      }

      console.log(`[worker] Importing structured timetable into DB for job ${jobId}...`);
      const { timetable, summary } = await importTimetable(parsed);

      // Render first page of PDF to PNG and save in public/uploads/${timetable.id}.png
      try {
        const { renderPdfToPng } = await import("./pdf-renderer");
        const fs = await import("node:fs");
        const path = await import("node:path");

        console.log(`[worker] Rendering PDF first page to PNG for timetable ${timetable.id}...`);
        const pngBuffer = await renderPdfToPng(buffer);
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, `${timetable.id}.png`), pngBuffer);
        console.log(`[worker] Saved visual PNG of timetable to public/uploads/${timetable.id}.png`);
      } catch (renderErr) {
        console.error(`[worker] Error rendering PDF visual snapshot:`, renderErr);
      }

      // Upload PDF asynchronously to ImageKit if credentials are configured
      try {
        const { uploadToImageKit } = await import("./imagekit");
        uploadToImageKit(buffer, `${timetable.id}.pdf`).then((url) => {
          if (url) {
            console.log(`[worker] Timetable PDF uploaded to ImageKit: ${url}`);
          }
        }).catch((err) => {
          console.error(`[worker] ImageKit upload promise rejected:`, err);
        });
      } catch (uploadErr) {
        console.error(`[worker] Error during ImageKit upload setup:`, uploadErr);
      }

      // 3. Mark completed
      jobData.status = "completed";
      jobData.finalTimetableId = timetable.id;
      jobData.finalSlotCount = parsed.slots.length;
      jobData.finalCourseCount = parsed.courses.length;
      jobData.summary = summary;
      jobData.updatedAt = Date.now();
      await redis.set(jobKey, JSON.stringify(jobData), "EX", 86400);

      console.log(`[worker] Job ${jobId} completed successfully!`);
    } catch (err: any) {
      console.error(`[worker] Error processing job ${jobId}:`, err);

      // Load existing job details to append error
      const jobDataRaw = await redis.get(jobKey);
      if (jobDataRaw) {
        const jobData = JSON.parse(jobDataRaw);
        jobData.status = "error";
        jobData.error = err instanceof Error ? err.message : "Unknown processing error";
        jobData.updatedAt = Date.now();
        await redis.set(jobKey, JSON.stringify(jobData), "EX", 86400);
      }
    } finally {
      // Always cleanup raw PDF buffer bytes to conserve Redis memory
      await redis.del(pdfKey);
    }
  },
  {
    connection: redis as any,
    concurrency: 1, // process 1 file at a time to prevent rate-limit hits on Mistral/OpenAI APIs
  }
);

timetableWorker.on("failed", (job, err) => {
  console.error(`[worker] Job failed:`, job?.id, err);
});
