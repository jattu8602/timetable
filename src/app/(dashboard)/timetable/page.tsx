"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useToast } from "@/lib/toast";
import { Upload, Trash2, ExternalLink, FileText, Loader2, Plus } from "lucide-react";

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
  const { toast } = useToast();
  const [data, setData] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Timetable | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/timetables");
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(item: Timetable) {
    setDeleting(item);
  }

  async function confirmDelete() {
    if (!deleting) return;
    const res = await fetch(`/api/timetables?id=${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast(`"${deleting.branch?.name ?? "?"} ${deleting.semesterName}" deleted`, "success");
    } else {
      toast("Failed to delete timetable", "error");
    }
    setDeleting(null);
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
        <Button onClick={() => router.push("/upload")} size="sm">
          <Upload className="mr-1 h-4 w-4" />
          Upload Timetable
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-lines bg-surface px-6 py-16 text-center shadow-card-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-canvas-2">
            <FileText className="h-6 w-6 text-brand-blue" />
          </div>
          <p className="text-lg font-medium text-ink">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF to get started.
          </p>
          <Button className="mt-4" onClick={() => router.push("/upload")}>
            <Plus className="mr-1 h-4 w-4" />
            Upload Timetable
          </Button>
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

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        title="Delete timetable?"
        description={
          deleting
            ? `Are you sure you want to delete the timetable for ${deleting.branch?.name ?? "?"} ${deleting.semesterName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
