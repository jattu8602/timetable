"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

interface JobStatus {
  id: string;
  fileName: string;
  status: "ocr" | "structuring" | "completed" | "error";
  totalPages?: number;
  currentPage?: number;
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
  error?: string;
}

const stageLabels: Record<string, string> = {
  ocr: "Extracting text from PDF...",
  structuring: "Structuring with AI...",
  completed: "Complete!",
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".txt"))) {
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
    const interval = setInterval(async () => {
      const res = await fetch(`/api/timetables/upload/status/${jobId}`);
      if (!res.ok) { clearInterval(interval); return; }
      const data = await res.json();
      setJob(data);
      if (data.status === "completed" || data.status === "error") {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Upload Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Upload a PDF to OCR and structure with AI
        </p>
      </div>

      {!jobId && (
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
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "or click to browse"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
          />
          {file && (
            <Button className="mt-6" onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
              {uploading ? "Uploading..." : "Start Processing"}
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">{error}</div>
      )}

      {job && (
        <div className="rounded-[22px] border border-lines bg-surface p-6 shadow-card-sm">
          <div className="flex items-center gap-4">
            {job.status === "completed" ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="size-6 text-success" />
              </div>
            ) : job.status === "error" ? (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error/10">
                <XCircle className="size-6 text-error" />
              </div>
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                <Loader2 className="size-6 animate-spin text-brand-blue" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">{job.fileName}</p>
              <p className="text-sm text-muted-foreground">
                {job.status === "ocr" && job.totalPages
                  ? `Page ${job.currentPage ?? 1} of ${job.totalPages}`
                  : stageLabels[job.status]}
              </p>
              {job.status === "ocr" && job.totalPages && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas-2">
                  <div
                    className="h-full rounded-full bg-brand-blue transition-all duration-300"
                    style={{ width: `${((job.currentPage ?? 0) / job.totalPages) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {job.status === "completed" && (
            <div className="mt-5 flex items-center justify-between rounded-[14px] bg-success/5 p-4">
              <div>
                <p className="text-sm font-medium text-ink">
                  {job.finalCourseCount} courses · {job.finalSlotCount} slots
                </p>
                <p className="text-xs text-muted-foreground">Imported successfully</p>
              </div>
              <Button onClick={() => router.push(`/timetable/${job.finalTimetableId}`)}>
                Edit <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          )}

          {job.status === "error" && (
            <div className="mt-4 rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
              {job.error || "Processing failed. Try again with a clearer PDF."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
