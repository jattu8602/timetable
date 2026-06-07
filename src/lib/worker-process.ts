import { timetableWorker } from "./worker";

console.log("[BullMQ Worker Process] Timetable ingestion worker is listening for jobs...");

// Keep process alive and handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[BullMQ Worker Process] SIGTERM received. Closing worker...");
  await timetableWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[BullMQ Worker Process] SIGINT received. Closing worker...");
  await timetableWorker.close();
  process.exit(0);
});
