"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

interface PageJob {
  pageNum: number;
  status: "pending" | "rendering" | "ocr" | "structuring" | "done" | "error";
  error?: string;
}

interface UploadJob {
  id: string;
  fileName: string;
  totalPages: number;
  pages: PageJob[];
  overallStatus: "processing" | "completed" | "error";
  finalTimetableId?: string;
  finalSlotCount?: number;
  finalCourseCount?: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <span className="size-4 rounded-full border-2 border-lines" />,
  rendering: <Loader2 className="size-4 animate-spin text-brand-blue" />,
  ocr: <Loader2 className="size-4 animate-spin text-brand-blue" />,
  structuring: <Loader2 className="size-4 animate-spin text-brand-blue" />,
  done: <CheckCircle2 className="size-4 text-success" />,
  error: <XCircle className="size-4 text-error" />,
};

const statusLabels: Record<string, string> = {
  pending: "Queued",
  rendering: "Rendering",
  ocr: "OCR",
  structuring: "AI",
  done: "Done",
  error: "Error",
};

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<UploadJob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".pdf") || f.name.endsWith(".txt"))) {
      setFile(f);
      setError(null);
    } else {
      setError("Please upload a .pdf or .txt file");
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
      if (!res.ok) {
        clearInterval(interval);
        return;
      }
      const data = await res.json();
      setJob(data);
      if (data.overallStatus === "completed" || data.overallStatus === "error") {
        clearInterval(interval);
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [jobId]);

  const doneCount = job?.pages.filter((p) => p.status === "done").length ?? 0;
  const errorCount = job?.pages.filter((p) => p.status === "error").length ?? 0;
  const total = job?.totalPages ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Upload Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Upload a PDF to split into pages, OCR each page, and structure with AI
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
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
              : "or click to browse"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
          {file && (
            <Button className="mt-6" onClick={(e) => { e.stopPropagation(); handleUpload(); }} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {uploading ? "Uploading..." : "Start Processing"}
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {job && (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-lines bg-surface p-5 shadow-card-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">{job.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {doneCount + errorCount}/{total} pages processed
                </p>
              </div>
              {job.overallStatus === "processing" && (
                <div className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                  <Loader2 className="size-3 animate-spin" />
                  Processing
                </div>
              )}
              {job.overallStatus === "completed" && (
                <div className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="size-3" />
                  Complete
                </div>
              )}
              {job.overallStatus === "error" && (
                <div className="flex items-center gap-1 rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error">
                  <XCircle className="size-3" />
                  Failed
                </div>
              )}
            </div>

            <div className="mt-4 space-y-[3px]">
              {job.pages.map((page) => (
                <div
                  key={page.pageNum}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors hover:bg-canvas-2/30"
                >
                  {statusIcons[page.status]}
                  <span className="font-medium text-ink-soft min-w-[36px]">
                    Page {page.pageNum}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      page.status === "done"
                        ? "text-success"
                        : page.status === "error"
                          ? "text-error"
                          : "text-muted-foreground"
                    }`}
                  >
                    {statusLabels[page.status]}
                  </span>
                  {page.error && (
                    <span className="ml-auto truncate text-[11px] text-error">
                      {page.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {job.overallStatus === "completed" && (
            <div className="rounded-[22px] border border-lines bg-surface p-5 shadow-card-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">Import Successful</p>
                  <p className="text-sm text-muted-foreground">
                    {job.finalCourseCount} courses · {job.finalSlotCount} slots imported
                  </p>
                </div>
                <Button onClick={() => router.push(`/timetable/${job.finalTimetableId}`)}>
                  Edit Timetable
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {job.overallStatus === "error" && (
            <div className="rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
              Some pages failed to process. Try uploading again with a clearer PDF.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
