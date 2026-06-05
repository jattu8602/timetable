"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Upload, Trash2, Eye, FileText, Loader2 } from "lucide-react";

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

interface TimetableDetail extends Timetable {
  slots: {
    id: string;
    dayOfWeek: string;
    periodName: string;
    timeRange: string;
    subjectDetails: string;
  }[];
}

const PERIOD_ORDER = ["I", "II", "III", "IV", "V", "LUNCH", "VI", "VII", "VIII", "IX"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const [data, setData] = useState<Timetable[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detail, setDetail] = useState<TimetableDetail | null>(null);
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

  async function handleView(item: Timetable) {
    const res = await fetch(`/api/timetables/${item.id}`);
    setDetail(await res.json());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timetables</h1>
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
        <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center text-muted-foreground">
          <FileText className="mb-2 h-10 w-10" />
          <p>No timetables yet. Upload a PDF or TXT file to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((tt) => (
            <div
              key={tt.id}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">
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
                <Button variant="outline" size="sm" onClick={() => handleView(tt)}>
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(tt)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
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
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">Courses</span>
                <span className="text-lg font-bold">{uploadResult.courseCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">Time Slots</span>
                <span className="text-lg font-bold">{uploadResult.slotCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="text-sm font-medium capitalize">{uploadResult.source}</span>
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

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {detail && `${detail.department?.shortCode ?? "—"} — ${detail.branch?.name ?? "—"} (${detail.semesterName})`}
            </DialogTitle>
            <DialogDescription>
              {detail && `${detail.academicTerm} · WEF ${new Date(detail.wefDate).toLocaleDateString()}`}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="overflow-x-auto py-2">
              <TimetableGrid timetable={detail} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimetableGrid({ timetable }: { timetable: TimetableDetail }) {
  const slotsByDay: Record<string, Record<string, string>> = {};
  for (const day of DAYS) {
    slotsByDay[day] = {};
  }
  for (const slot of timetable.slots) {
    if (!slotsByDay[slot.dayOfWeek]) continue;
    slotsByDay[slot.dayOfWeek][slot.periodName] = slot.subjectDetails;
  }

  return (
    <table className="w-full min-w-[700px] border-collapse text-xs">
      <thead>
        <tr>
          <th className="border bg-muted p-2 text-left font-medium">Day</th>
          {PERIOD_ORDER.map((p) => (
            <th key={p} className="border bg-muted p-2 text-center font-medium">
              {p === "LUNCH" ? (
                <span className="text-muted-foreground">LUNCH</span>
              ) : (
                <>
                  <div>{p}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {p === "VI"
                      ? "13:30-14:20"
                      : p === "VII"
                        ? "14:30-15:20"
                        : p === "VIII"
                          ? "15:30-16:20"
                          : p === "IX"
                            ? "16:30-17:20"
                            : ["I", "II", "III", "IV", "V"].includes(p)
                              ? `0${5 + PERIOD_ORDER.indexOf(p)}:00-0${5 + PERIOD_ORDER.indexOf(p)}:50`
                              : ""}
                  </div>
                </>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {DAYS.map((day) => (
          <tr key={day}>
            <td className="border p-2 font-medium">{day}</td>
            {PERIOD_ORDER.map((period) => {
              if (period === "LUNCH") {
                return (
                  <td key={period} className="border bg-muted/30 p-2 text-center text-muted-foreground">
                    —
                  </td>
                );
              }
              const content = slotsByDay[day]?.[period];
              return (
                <td key={period} className="border p-2 align-top">
                  {content ? (
                    <div className="space-y-0.5">
                      {content.split("\n").map((line, i) => (
                        <div key={i} className="leading-tight">{line}</div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
