export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Skip loading the worker during production build static generation/prerendering
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.log("[Instrumentation] Production build phase detected. Skipping worker start.");
      return;
    }

    try {
      const { timetableWorker, importWorker } = await import("./lib/worker");
      console.log("[Instrumentation] Background BullMQ Timetable Ingestion Worker & Import Worker initialized.");
    } catch (error) {
      console.error("[Instrumentation] Failed to load BullMQ worker:", error);
    }
  }
}
