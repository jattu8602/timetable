"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  periodName: string;
  timeRange: string;
  subjectDetails: string;
}

interface TimetableDetail {
  id: string;
  institution: string;
  academicTerm: string;
  program: string;
  semesterName: string;
  wefDate: string;
  department: { name: string; shortCode: string } | null;
  branch: { name: string; program: string } | null;
  slots: TimeSlot[];
}

const PERIOD_ORDER = ["I", "II", "III", "IV", "V", "LUNCH", "VI", "VII", "VIII", "IX"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const PERIOD_TIMES: Record<string, string> = {
  I: "08:00-08:50",
  II: "09:00-09:50",
  III: "10:00-10:50",
  IV: "11:00-11:50",
  V: "12:00-12:50",
  VI: "13:30-14:20",
  VII: "14:30-15:20",
  VIII: "15:30-16:20",
  IX: "16:30-17:20",
};

export default function TimetableEditPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<TimetableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editCell, setEditCell] = useState<{ day: string; period: string } | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/timetables/${params.id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getSlot(day: string, period: string): TimeSlot | undefined {
    return data?.slots.find((s) => s.dayOfWeek === day && s.periodName === period);
  }

  function startEdit(day: string, period: string) {
    const slot = getSlot(day, period);
    if (!slot) return;
    setEditCell({ day, period });
    setEditValue(slot.subjectDetails);
  }

  async function saveEdit() {
    if (!editCell || !data) return;
    const slot = getSlot(editCell.day, editCell.period);
    if (!slot) return;

    setSaving(slot.id);
    await fetch("/api/timetables/slots", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slot.id, subjectDetails: editValue }),
    });
    setSaving(null);
    setEditCell(null);
    fetchData();
  }

  function cancelEdit() {
    setEditCell(null);
    setEditValue("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Timetable not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/timetable")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/timetable")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-[-0.02em] text-ink">
              {data.department?.shortCode ?? "—"} — {data.branch?.name ?? "—"} ({data.semesterName})
            </h1>
            <p className="text-sm text-muted-foreground">
              {data.academicTerm} · WEF {new Date(data.wefDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-canvas-2 px-3 py-1 font-medium text-ink-soft">
            {data.slots.length} slots
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[22px] border border-lines bg-surface shadow-card-sm">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-lines bg-canvas-2/80 p-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-muted backdrop-blur-sm">
                Day
              </th>
              {PERIOD_ORDER.map((p) => (
                <th
                  key={p}
                  className={`border-b border-lines p-3 text-center text-[11px] font-bold uppercase tracking-[0.05em] ${
                    p === "LUNCH" ? "bg-canvas-2/30 text-muted" : "bg-canvas-2/80 text-muted"
                  }`}
                >
                  {p === "LUNCH" ? (
                    <span className="text-[10px] tracking-[0.1em]">LUNCH</span>
                  ) : (
                    <>
                      <div>Period {p}</div>
                      <div className="mt-[2px] text-[9px] font-medium text-muted-foreground/70">
                        {PERIOD_TIMES[p]}
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
                <td className="sticky left-0 z-10 border-b border-r border-lines bg-surface p-3 text-[13px] font-semibold text-ink-soft">
                  {day}
                </td>
                {PERIOD_ORDER.map((period) => {
                  if (period === "LUNCH") {
                    return (
                      <td
                        key={period}
                        className="border-b border-lines bg-canvas-2/15 p-3 text-center text-[11px] text-muted-foreground"
                      >
                        —
                      </td>
                    );
                  }
                  const slot = getSlot(day, period);
                  const isEditing =
                    editCell?.day === day && editCell?.period === period;
                  const isSaving = slot && saving === slot.id;

                  return (
                    <td
                      key={period}
                      className={`border-b border-lines p-[3px] align-top transition-colors ${
                        isEditing ? "bg-brand-blue/5" : "hover:bg-[#f1f7ff]"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-[4px] p-[3px]">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[60px] resize-y rounded-[10px] border border-brand-blue bg-surface p-[6px_8px] text-[11.5px] leading-snug shadow-[0_0_0_3px_rgba(61,161,255,.12)]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit();
                              }
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          <div className="flex gap-[4px]">
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              disabled={!!isSaving}
                              className="flex-1 px-2 py-1 text-[10.5px]"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="px-2 py-1 text-[10.5px]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : slot ? (
                        <button
                          onClick={() => startEdit(day, period)}
                          className="w-full cursor-pointer rounded-[10px] p-[6px_8px] text-left text-[11.5px] leading-snug text-ink transition-colors hover:bg-canvas-2/40"
                        >
                          {slot.subjectDetails.split("\n").map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </button>
                      ) : (
                        <span className="block p-[6px_8px] text-[11.5px] text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
