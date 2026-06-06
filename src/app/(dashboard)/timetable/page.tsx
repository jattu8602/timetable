"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, Trash2, ExternalLink, FileText, Loader2 } from "lucide-react";

interface Timetable {
  id: string;
  institution: string;
  academicTerm: string;
  program: string;
  semesterName: string;
  wefDate: string;
  department: { name: string; shortCode: string } | null;
  branch: { name: string; program: string } | null;
  _count: { slots: number };
}

export default function TimetableListPage() {
  const router = useRouter();
  const [data, setData] = useState<Timetable[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ slotCount: number; courseCount: number; source: string } | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/timetables");
    setData(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/timetables/upload", { method: "POST", body });
    const result = await res.json();
    setUploading(false);

    if (result.success) {
      setUploadOpen(false);
      setUploadResult({ slotCount: result.slotCount, courseCount: result.courseCount, source: result.source });
      fetchData();
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  }

  async function handleDelete(item: Timetable) {
    if (!confirm(`Delete timetable for ${item.branch?.name ?? "?"} ${item.semesterName}?`)) return;
    await fetch(`/api/timetables?id=${item.id}`, { method: "DELETE" });
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Timetables</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage BIT Mesra timetables
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} size="sm">
          <Upload className="mr-1 h-4 w-4" />
          Upload Timetable
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-lines bg-surface px-6 py-16 text-center shadow-card-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-canvas-2">
            <FileText className="h-6 w-6 text-brand-blue" />
          </div>
          <p className="text-lg font-medium text-ink">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF or TXT file to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((tt) => (
            <div
              key={tt.id}
              className="rounded-[22px] border border-lines bg-surface p-5 shadow-card-sm transition-shadow hover:shadow-card-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    {tt.department?.shortCode ?? "—"} — {tt.branch?.name ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tt.semesterName} · {tt.academicTerm}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tt.program} · {tt._count.slots} slots
                  </p>
                  <p className="text-xs text-muted-foreground">
                    WEF {new Date(tt.wefDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => router.push(`/timetable/${tt.id}`)}>
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(tt)}>
                  <Trash2 className="h-3 w-3 text-error" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!uploadResult} onOpenChange={(o) => !o && setUploadResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Successful</DialogTitle>
            <DialogDescription>
              The timetable was processed and imported.
            </DialogDescription>
          </DialogHeader>
          {uploadResult && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between rounded-full border border-lines bg-canvas-2/30 px-5 py-3">
                <span className="text-sm text-muted-foreground">Courses</span>
                <span className="text-lg font-bold text-ink">{uploadResult.courseCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-full border border-lines bg-canvas-2/30 px-5 py-3">
                <span className="text-sm text-muted-foreground">Time Slots</span>
                <span className="text-lg font-bold text-ink">{uploadResult.slotCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-full border border-lines bg-canvas-2/30 px-5 py-3">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium text-ink capitalize">{uploadResult.source}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setUploadResult(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Timetable</DialogTitle>
            <DialogDescription>
              Upload a BIT Mesra timetable file (PDF or TXT format)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="py-4">
              <Input name="file" type="file" accept=".txt,.pdf" required />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
