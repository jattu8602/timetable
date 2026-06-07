"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, XCircle, Loader2, ArrowRight, FileText, AlertTriangle } from "lucide-react";

interface JobStatus {
  id: string;
  fileName: string;
  status: "queued" | "parsing" | "integrating" | "completed" | "error";
  text?: string;
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
  error?: string;
  summary?: {
    departments: { created: number; matched: number };
    branches: { created: number; matched: number };
    rooms: { created: number; matched: number };
    courses: { created: number; matched: number };
    faculty: { created: number; matched: number };
    slots: { created: number; matched: number };
    warnings: string[];
  };
}

const stageLabels: Record<string, string> = {
  queued: "Queued (Waiting for background worker)...",
  parsing: "Parsing PDF & Running OCR extraction...",
  integrating: "Structuring timetable with AI & integrating with DB...",
  completed: "Timetable successfully ingested!",
  error: "Failed",
};

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".pdf")) {
      setFile(f);
      setError(null);
    } else {
      setError("Please upload a .pdf file");
    }
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/timetables/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobId(data.jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!jobId) return;
    setSeconds(0);
    const secInterval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    const interval = setInterval(async () => {
      const res = await fetch(`/api/timetables/upload/status/${jobId}`);
      if (!res.ok) {
        clearInterval(interval);
        clearInterval(secInterval);
        return;
      }
      const data = await res.json();
      setJob(data);
      if (data.status === "completed" || data.status === "error") {
        clearInterval(interval);
        clearInterval(secInterval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(secInterval);
    };
  }, [jobId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Upload Timetable PDF</h1>
        <p className="text-sm text-muted-foreground">
          Upload a university timetable PDF to parse, structure, and compute analytics in the background.
        </p>
      </div>

      {!jobId ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-line-2 bg-surface px-6 py-16 text-center shadow-card-sm transition-colors hover:border-brand-blue"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-canvas-2">
            <Upload className="size-6 text-brand-blue" />
          </div>
          <p className="text-lg font-medium text-ink">
            {file ? file.name : "Drop your PDF here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
          {file && (
            <Button
              className="mt-6"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
              {uploading ? "Uploading PDF..." : "Start Asynchronous Ingestion"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[22px] border border-lines bg-white p-6 shadow-card-sm">
            <div className="flex items-center gap-4">
              {job?.status === "completed" ? (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
              ) : job?.status === "error" ? (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error/10">
                  <XCircle className="size-6 text-error" />
                </div>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                  <Loader2 className="size-6 animate-spin text-brand-blue" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{job?.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {stageLabels[job?.status ?? "queued"]}
                </p>
                {job?.status !== "completed" && job?.status !== "error" && (
                  <p className="text-xs text-brand-blue font-semibold mt-1">
                    Processing time: {seconds}s (Estimated: ~2-3 minutes)
                  </p>
                )}
              </div>
            </div>

            {job?.status === "error" && (
              <div className="mt-4 rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
                {job.error || "An error occurred during queue execution."}
              </div>
            )}
          </div>

          {/* Import Summary Results */}
          {job?.status === "completed" && job.summary && (
            <div className="space-y-6">
              <div className="rounded-[22px] border border-lines bg-white p-6 shadow-card-sm space-y-4">
                <h3 className="text-lg font-bold text-ink border-b pb-2">Import Summary</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Departments</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.departments.created} · Matched: {job.summary.departments.matched}
                    </p>
                  </div>
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Branches</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.branches.created} · Matched: {job.summary.branches.matched}
                    </p>
                  </div>
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Rooms</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.rooms.created} · Matched: {job.summary.rooms.matched}
                    </p>
                  </div>
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Courses</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.courses.created} · Matched: {job.summary.courses.matched}
                    </p>
                  </div>
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Faculty Members</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.faculty.created} · Matched: {job.summary.faculty.matched}
                    </p>
                  </div>
                  <div className="rounded-xl bg-canvas p-3 border">
                    <p className="text-xs text-muted-foreground font-semibold">Time Slots</p>
                    <p className="text-lg font-bold text-ink">
                      Created: {job.summary.slots.created}
                    </p>
                  </div>
                </div>

                {job.summary.warnings.length > 0 && (
                  <div className="rounded-[14px] border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="size-4 text-warning" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-warning">
                        Warnings & Edge Cases Flagged
                      </h4>
                    </div>
                    <ul className="list-inside list-disc text-xs text-muted-foreground space-y-1">
                      {job.summary.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => router.push(`/timetable/${job.finalTimetableId}`)}
                    className="flex items-center gap-1"
                  >
                    View Timetable Grid <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {job.text && (
                <div className="rounded-[22px] border border-lines bg-white p-6 shadow-card-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-brand-blue" />
                    <h4 className="font-semibold text-ink">Parsed Raw Text</h4>
                  </div>
                  <pre className="max-h-60 overflow-y-auto rounded-[14px] bg-canvas p-4 text-[11px] leading-relaxed text-ink whitespace-pre-wrap font-mono">
                    {job.text}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}
    </div>
  );
}

