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
  
  const [activeJobIds, setActiveJobIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Record<string, JobStatus>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const pendingIdsRef = useRef<string[]>([]);

  useEffect(() => {
    pendingIdsRef.current = activeJobIds.filter(id => {
      const job = jobs[id];
      return !job || (job.status !== "completed" && job.status !== "error");
    });
  }, [activeJobIds, jobs]);

  useEffect(() => {
    const secInterval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        pendingIdsRef.current.forEach(id => {
          next[id] = (next[id] || 0) + 1;
        });
        return next;
      });
    }, 1000);

    const pollInterval = setInterval(() => {
      pendingIdsRef.current.forEach(async (jobId) => {
        try {
          const res = await fetch(`/api/timetables/upload/status/${jobId}`);
          if (res.ok) {
            const data = await res.json();
            // Preserve the original fileName if the API hasn't returned it yet
            setJobs(prev => ({ 
              ...prev, 
              [jobId]: { ...data, fileName: data.fileName || prev[jobId]?.fileName || "Unknown File" } 
            }));
          }
        } catch (e) {
          // Silently ignore network failures during polling 
          // (e.g. if the dev server restarts or network drops temporarily)
        }
      });
    }, 1000);

    return () => {
      clearInterval(secInterval);
      clearInterval(pollInterval);
    };
  }, []);

  const handleUpload = async (file: File) => {
    setError(null);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/timetables/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const newJobId = data.jobId;
      setJobs(prev => ({ 
        ...prev, 
        [newJobId]: { id: newJobId, fileName: file.name, status: "queued" } 
      }));
      setActiveJobIds(prev => [newJobId, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed for " + file.name);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.match(/\.(pdf|png|jpe?g|webp)$/i));
    if (files.length > 0) {
      files.forEach(f => handleUpload(f));
    } else {
      setError("Please upload .pdf, .png, or .jpg files only");
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Upload Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Upload multiple university timetable PDFs or images side by side. They will process simultaneously in the background.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-line-2 bg-surface px-6 py-10 text-center shadow-card-sm transition-colors hover:border-brand-blue"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-blue/10">
          <Upload className="size-5 text-brand-blue" />
        </div>
        <p className="text-lg font-medium text-ink">
          Click or drop PDF / Image files here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          You can select multiple files at once
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(f => {
              if (f.name.match(/\.(pdf|png|jpe?g|webp)$/i)) handleUpload(f);
            });
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div className="rounded-[14px] border border-error/30 bg-error/5 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {activeJobIds.length > 0 && (
        <div className="space-y-6 mt-8">
          <h2 className="text-lg font-semibold text-ink">Processing Queue ({activeJobIds.length})</h2>
          
          {activeJobIds.map(jobId => {
            const job = jobs[jobId];
            if (!job) return null;
            
            return (
              <div key={jobId} className="space-y-4">
                <div className="rounded-[22px] border border-lines bg-white p-5 shadow-card-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {job.status === "completed" ? (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="size-5 text-success" />
                      </div>
                    ) : job.status === "error" ? (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-error/10">
                        <XCircle className="size-5 text-error" />
                      </div>
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10">
                        <Loader2 className="size-5 animate-spin text-brand-blue" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink truncate text-sm">{job.fileName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stageLabels[job.status] || "Processing..."}
                      </p>
                      {job.status !== "completed" && job.status !== "error" && (
                        <p className="text-[11px] text-brand-blue font-semibold mt-1">
                          Processing time: {timers[jobId] || 0}s (Estimated: ~1-2 minutes)
                        </p>
                      )}
                    </div>
                  </div>

                  {job.status === "error" && (
                    <div className="rounded-[12px] border border-error/30 bg-error/5 p-3 text-xs text-error">
                      {job.error || "An error occurred during queue execution."}
                    </div>
                  )}
                  
                  {job.status === "completed" && job.summary && (
                    <div className="mt-2 space-y-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Departments</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.departments.created}</p>
                        </div>
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Branches</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.branches.created}</p>
                        </div>
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rooms</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.rooms.created}</p>
                        </div>
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Courses</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.courses.created}</p>
                        </div>
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Faculty</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.faculty.created}</p>
                        </div>
                        <div className="rounded-lg bg-canvas p-2.5 border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Time Slots</p>
                          <p className="text-sm font-bold text-ink mt-0.5">+{job.summary.slots.created}</p>
                        </div>
                      </div>

                      {job.summary.warnings.length > 0 && (
                        <div className="rounded-[12px] border border-warning/30 bg-warning/5 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <AlertTriangle className="size-3.5 text-warning" />
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-warning">
                              Warnings
                            </h4>
                          </div>
                          <ul className="list-inside list-disc text-[11px] text-muted-foreground space-y-0.5 pl-1">
                            {job.summary.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          onClick={() => router.push(`/timetable/${job.finalTimetableId}`)}
                          className="flex items-center gap-1 text-xs"
                        >
                          View Grid <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
