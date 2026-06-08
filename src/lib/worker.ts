import { Worker, Job } from "bullmq";
import { getRedisConnection } from "./bull";
import { ocrPdf, structureWithMistral } from "./mistral";
import { importTimetable } from "./timetable/importer";
import * as xlsx from "xlsx";
import { parseCSV } from "./csv";
import { prisma } from "./prisma";
import { RoomType, CourseType, UserRole } from "@prisma/client";

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
      const { ocrPdf, structureWithMistral } = await import("./mistral");
      const text = await ocrPdf(buffer, jobData.fileName);

      // Update text in job state
      jobData.text = text;
      jobData.status = "integrating"; // Transitioning to structuring & database integration
      jobData.updatedAt = Date.now();
      await redis.set(jobKey, JSON.stringify(jobData), "EX", 86400);

      console.log(`[worker] Structuring OCR text with AI for job ${jobId}...`);
      const parsed = await structureWithMistral(text);

      if (parsed.slots.length === 0 && parsed.courses.length === 0) {
        throw new Error("Could not parse any courses or slots from the uploaded timetable PDF/Image.");
      }

      console.log(`[worker] Importing structured timetable into DB for job ${jobId}...`);
      const { importTimetable } = await import("./timetable/importer");
      const { timetable, summary } = await importTimetable(parsed, jobData.fileName);

      // Render first page of PDF to PNG and upload both to ImageKit
      let pdfUrl: string | null = null;
      let imageUrl: string | null = null;
      try {
        const { renderPdfToPng } = await import("./pdf-renderer");
        const { uploadToImageKit } = await import("./imagekit");

        console.log(`[worker] Generating PNG for timetable ${timetable.id}...`);
        
        let pngBuffer: Buffer;
        const isImage = jobData.fileName.match(/\.(png|jpe?g|webp)$/i);
        if (isImage) {
          pngBuffer = buffer; // already an image!
        } else {
          pngBuffer = await renderPdfToPng(buffer);
        }

        console.log(`[worker] Uploading to ImageKit...`);
        const uploads = [uploadToImageKit(pngBuffer, `${timetable.id}.png`)];
        if (!isImage) {
          uploads.push(uploadToImageKit(buffer, `${timetable.id}.pdf`));
        }
        
        const [uploadedPng, uploadedPdf] = await Promise.all(uploads);

        pdfUrl = uploadedPdf || null;
        imageUrl = uploadedPng;
        
        if (pdfUrl || imageUrl) {
          console.log(`[worker] Updating database with ImageKit URLs...`);
          await prisma.timetable.update({
            where: { id: timetable.id },
            data: { pdfUrl, imageUrl },
          });
        }
      } catch (uploadErr) {
        console.error(`[worker] Error during ImageKit upload:`, uploadErr);
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

export const importWorker = new Worker(
  "import-jobs",
  async (job: Job) => {
    const { entity, fileName, fileData, duplicateAction } = job.data;
    const buffer = Buffer.from(fileData, "base64");
    
    let rows: Record<string, string>[] = [];
    
    if (fileName.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      rows = parseCSV(text).rows;
    } else if (fileName.endsWith(".xlsx")) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = xlsx.utils.sheet_to_json(sheet);
    } else {
      throw new Error("Unsupported file type");
    }

    if (rows.length === 0) throw new Error("No data found in file");

    let created = 0, updated = 0, skipped = 0;
    const errors: string[] = [];

    await job.updateProgress({ processed: 0, total: rows.length });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (entity === "departments" || !entity) { // fallback for older jobs
          const name = String(row["name"] || row["Name"] || "").trim();
          const shortCode = String(row["shortCode"] || row["Short Code"] || row["shortcode"] || row["departmentShortCode"] || "").trim();

          if (!name || !shortCode) throw new Error("Missing name or shortCode");

          const existing = await prisma.department.findUnique({ where: { shortCode } });
          if (existing) {
            if (duplicateAction === "merge") {
              await prisma.department.update({ where: { shortCode }, data: { name } });
              updated++;
            } else skipped++;
          } else {
            await prisma.department.create({ data: { name, shortCode } });
            created++;
          }
        } else if (entity === "rooms") {
          const number = String(row["number"] || row["Number"] || "").trim();
          const capacity = parseInt(String(row["capacity"] || row["Capacity"] || "0"), 10);
          const type = String(row["type"] || row["Type"] || "classroom").trim().toLowerCase() as RoomType;
          const deptCode = String(row["departmentId"] || row["departmentShortCode"] || row["Department"] || "").trim();

          if (!number || !deptCode) throw new Error("Missing number or department short code");
          
          const dept = await prisma.department.findUnique({ where: { shortCode: deptCode } });
          if (!dept) throw new Error(`Department ${deptCode} not found`);

          const existing = await prisma.room.findUnique({ where: { number_departmentId: { number, departmentId: dept.id } } });
          if (existing) {
            if (duplicateAction === "merge") {
              await prisma.room.update({ where: { id: existing.id }, data: { capacity, type } });
              updated++;
            } else skipped++;
          } else {
            await prisma.room.create({ data: { number, capacity, type, departmentId: dept.id } });
            created++;
          }
        } else if (entity === "courses") {
          const code = String(row["code"] || row["Code"] || "").trim();
          const name = String(row["name"] || row["Name"] || "").trim();
          const rawCredits = String(row["credits"] || row["Credits"] || "0").trim();
          let credits = parseFloat(rawCredits);
          if (isNaN(credits)) credits = 0; // Fix for "NC" non-credit courses
          
          const rawType = String(row["type"] || row["Type"] || "lecture").trim().toLowerCase();
          const courseTypeStr = String(row["type"] || row["Type"] || "Core").trim();
          
          let typeEnum: CourseType = "lecture";
          if (rawType.includes("lab") || rawType.includes("practical")) typeEnum = "lab";
          else if (rawType.includes("elective") || rawType === "pe" || rawType === "oe") typeEnum = "elective";
          else if (rawType.includes("tutorial")) typeEnum = "tutorial";
          else if (rawType.includes("project") || rawType.includes("proj")) typeEnum = "project";
          else if (rawType.includes("activity") || rawType.includes("ncc") || rawType.includes("nss")) typeEnum = "activity";
          
          const branchCode = String(row["branchId"] || row["branch"] || row["Branch"] || "").trim();
          const semester = String(row["semester"] || row["Semester"] || "").trim();
          const deptCode = String(row["departmentId"] || row["departmentShortCode"] || row["Department"] || row["department"] || "").trim();

          if (!code || !name) throw new Error("Missing course code or name");
          if (!deptCode) throw new Error("Missing department code");

          const dept = await prisma.department.findUnique({ where: { shortCode: deptCode } });
          if (!dept) throw new Error(`Department ${deptCode} not found in database`);
          const deptId = dept.id;

          let branchId: string = "";
          if (branchCode) {
             const branch = await prisma.branch.findFirst({ where: { name: branchCode } });
             if (!branch) throw new Error(`Branch ${branchCode} not found`);
             branchId = branch.id;
          }

          const existing = await prisma.course.findUnique({ where: { code_branchId_semester: { code, branchId, semester } } });
          if (existing) {
            if (duplicateAction === "merge") {
              await prisma.course.update({ where: { id: existing.id }, data: { name, credits, type: typeEnum, courseType: courseTypeStr, departmentId: deptId || existing.departmentId } });
              updated++;
            } else skipped++;
          } else {
            await prisma.course.create({ data: { code, name, credits, type: typeEnum, courseType: courseTypeStr, semester, departmentId: deptId || "", branchId } });
            created++;
          }
        } else if (entity === "faculty") {
          const name = String(row["name"] || row["Name"] || "").trim();
          const email = String(row["email"] || row["Email"] || "").trim();
          const deptCode = String(row["departmentId"] || row["departmentShortCode"] || row["Department"] || "").trim();

          if (!name || !email) throw new Error("Missing name or email");

          let deptId: string | null = null;
          if (deptCode) {
            const dept = await prisma.department.findUnique({ where: { shortCode: deptCode } });
            if (!dept) throw new Error(`Department ${deptCode} not found`);
            deptId = dept.id;
          }

          const existing = await prisma.faculty.findUnique({ where: { email } });
          if (existing) {
            if (duplicateAction === "merge") {
              await prisma.faculty.update({ where: { email }, data: { name, departmentId: deptId || existing.departmentId } });
              updated++;
            } else skipped++;
          } else {
            await prisma.faculty.create({ data: { name, email, departmentId: deptId || "" } });
            created++;
          }
        } else if (entity === "users") {
           const name = String(row["name"] || row["Name"] || "").trim();
           const email = String(row["email"] || row["Email"] || "").trim();
           const role = String(row["role"] || row["Role"] || "professor").trim().toLowerCase() as UserRole;
           const deptCode = String(row["departmentId"] || row["departmentShortCode"] || row["Department"] || "").trim();
           const rawPassword = String(row["password"] || row["Password"] || "changeMe123").trim();

           if (!name || !email) throw new Error("Missing name or email");

           let deptId: string | null = null;
           if (deptCode && deptCode.toLowerCase() !== "all_depts" && deptCode !== "") {
             const dept = await prisma.department.findUnique({ where: { shortCode: deptCode } });
             if (!dept) throw new Error(`Department ${deptCode} not found`);
             deptId = dept.id;
           }

           const existing = await prisma.user.findUnique({ where: { email } });
           if (existing) {
             if (duplicateAction === "merge") {
               const updateData: any = { name, role, departmentId: deptId };
               if (row["password"]) {
                  const { createHash } = await import("node:crypto");
                  updateData.password = createHash("sha256").update(rawPassword).digest("hex");
               }
               await prisma.user.update({ where: { email }, data: updateData });
               updated++;
             } else skipped++;
           } else {
             const { createHash } = await import("node:crypto");
             const password = createHash("sha256").update(rawPassword).digest("hex");
             await prisma.user.create({ data: { name, email, role, password, departmentId: deptId } });
             created++;
           }
        }
      } catch (e: any) {
        errors.push(`Row ${i+1}: ${e.message}`);
      }
      
      if (i % 10 === 0) {
         await job.updateProgress({ processed: i + 1, total: rows.length });
      }
    }
    await job.updateProgress({ processed: rows.length, total: rows.length });

    return { created, updated, skipped, errors };
  },
  { connection: redis as any, concurrency: 5 }
);

importWorker.on("failed", (job, err) => {
  console.error(`[import-worker] Job failed:`, job?.id, err);
});
