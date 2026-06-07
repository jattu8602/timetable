"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Edit2,
  Plus,
  Trash2,
  Move,
} from "lucide-react";
import { useToast } from "@/lib/toast";

interface TimeSlot {
  id: string;
  dayOfWeek: string;
  periodName: string;
  timeRange: string;
  subjectDetails: string;
}

interface ScopedCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: string;
  courseType: string;
  teacher: string;
}

interface TimetableDetail {
  id: string;
  institution: string;
  academicTerm: string;
  program: string;
  semesterName: string;
  wefDate: string;
  departmentId: string;
  branchId: string;
  department: { name: string; shortCode: string } | null;
  branch: { name: string; program: string } | null;
  slots: TimeSlot[];
  courses: ScopedCourse[];
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

export default function TimetableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<TimetableDetail | null>(null);
  const [systemCourses, setSystemCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisSeconds, setAnalysisSeconds] = useState(0);
  const [showPdfRef, setShowPdfRef] = useState(false);

  // Edit slot states
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; period: string; slot?: TimeSlot } | null>(null);
  const [slotForm, setSlotForm] = useState({ subjectDetails: "", roomNumber: "", customOverride: "", span: 1 });

  // Scoped course modal states
  const [courseOpen, setCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ScopedCourse | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: "3",
    type: "lecture",
    courseType: "Core",
    teacher: "",
  });
  const [isElectiveGroup, setIsElectiveGroup] = useState(false);
  const [groupCourses, setGroupCourses] = useState<{ code: string; name: string; teacher: string }[]>([
    { code: "", name: "", teacher: "" },
    { code: "", name: "", teacher: "" },
  ]);

  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: string; period: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [res, coursesRes] = await Promise.all([
        fetch(`/api/timetables/${params.id}`),
        fetch("/api/courses")
      ]);
      if (!res.ok) throw new Error("Failed to load timetable");
      const json = await res.json();
      setData(json);

      if (coursesRes.ok) {
        const coursesJson = await coursesRes.json();
        setSystemCourses(coursesJson);
      }
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to find slot in state
  function getSlot(day: string, period: string): TimeSlot | undefined {
    return data?.slots.find((s) => s.dayOfWeek === day && s.periodName === period);
  }

  // Trigger Mistral Vision Ingestion Analysis
  async function handleAnalyzeWithAI() {
    setAnalyzing(true);
    setAnalysisSeconds(0);
    const timer = setInterval(() => {
      setAnalysisSeconds((s) => s + 1);
    }, 1000);
    try {
      const res = await fetch("/api/timetables/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Vision analysis failed");
      toast(json.message || "AI Analysis complete!", "success");
      fetchData();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      clearInterval(timer);
      setAnalyzing(false);
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, slotId: string) {
    setDraggedSlotId(slotId);
    e.dataTransfer.setData("text/plain", slotId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggedSlotId(null);
    setDragOverCell(null);
  }

  async function handleDrop(e: React.DragEvent, targetDay: string, targetPeriod: string) {
    e.preventDefault();
    setDragOverCell(null);
    if (!draggedSlotId || !data) return;

    const sourceSlot = data.slots.find((s) => s.id === draggedSlotId);
    if (!sourceSlot) return;

    // Don't do anything if dropped on the same slot
    if (sourceSlot.dayOfWeek === targetDay && sourceSlot.periodName === targetPeriod) return;

    const targetSlot = getSlot(targetDay, targetPeriod);

    // Optimistic Update
    const originalSlots = [...data.slots];
    const updatedSlots = data.slots.map((s) => {
      if (s.id === sourceSlot.id) {
        return {
          ...s,
          dayOfWeek: targetDay,
          periodName: targetPeriod,
          timeRange: PERIOD_TIMES[targetPeriod] || "",
        };
      }
      if (targetSlot && s.id === targetSlot.id) {
        return {
          ...s,
          dayOfWeek: sourceSlot.dayOfWeek,
          periodName: sourceSlot.periodName,
          timeRange: PERIOD_TIMES[sourceSlot.periodName] || "",
        };
      }
      return s;
    });

    setData({ ...data, slots: updatedSlots });
    setSaving(sourceSlot.id);

    try {
      if (targetSlot) {
        // Swap slots
        const res = await Promise.all([
          fetch("/api/timetables/slots", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: sourceSlot.id,
              dayOfWeek: targetDay,
              periodName: targetPeriod,
              timeRange: PERIOD_TIMES[targetPeriod] || "",
            }),
          }),
          fetch("/api/timetables/slots", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: targetSlot.id,
              dayOfWeek: sourceSlot.dayOfWeek,
              periodName: sourceSlot.periodName,
              timeRange: PERIOD_TIMES[sourceSlot.periodName] || "",
            }),
          }),
        ]);
        if (!res[0].ok || !res[1].ok) throw new Error("Database swap request failed");
        toast("Swapped periods successfully!", "success");
      } else {
        // Move slot
        const res = await fetch("/api/timetables/slots", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sourceSlot.id,
            dayOfWeek: targetDay,
            periodName: targetPeriod,
            timeRange: PERIOD_TIMES[targetPeriod] || "",
          }),
        });
        if (!res.ok) throw new Error("Database move request failed");
        toast(`Moved class to ${targetDay} Period ${targetPeriod}`, "success");
      }
      // Re-fetch in background to ensure database alignment
      fetchData();
    } catch (err: any) {
      // Revert back on error
      setData({ ...data, slots: originalSlots });
      toast("Failed to move period: " + err.message, "error");
    } finally {
      setSaving(null);
    }
  }

  const NORMAL_PERIODS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

  // Open slot editor
  function handleCellClick(day: string, period: string) {
    const slot = getSlot(day, period);
    setSelectedSlot({ day, period, slot });

    let initialSpan = 1;
    if (slot) {
      const startIndex = NORMAL_PERIODS.indexOf(period);
      if (startIndex !== -1) {
        for (let idx = startIndex + 1; idx < NORMAL_PERIODS.length; idx++) {
          const nextPeriod = NORMAL_PERIODS[idx];
          const nextSlot = data?.slots.find((s) => s.dayOfWeek === day && s.periodName === nextPeriod);
          if (nextSlot && nextSlot.subjectDetails === slot.subjectDetails) {
            initialSpan++;
          } else {
            break;
          }
        }
      }
    }

    if (slot) {
      // Parse out room number if possible
      const match = slot.subjectDetails.match(/\(([^)]+)\)/);
      const room = match ? match[1] : "";
      const baseDetails = match ? slot.subjectDetails.replace(/\s*\([^)]+\)/, "").trim() : slot.subjectDetails;

      setSlotForm({
        subjectDetails: baseDetails,
        roomNumber: room,
        customOverride: slot.subjectDetails,
        span: initialSpan,
      });
    } else {
      setSlotForm({
        subjectDetails: "",
        roomNumber: "",
        customOverride: "",
        span: 1,
      });
    }
  }

  // Save slot changes
  async function handleSaveSlot() {
    if (!selectedSlot || !data) return;

    let finalDetails = slotForm.customOverride;
    if (!finalDetails) {
      finalDetails = slotForm.subjectDetails;
      if (slotForm.roomNumber) {
        finalDetails += ` (${slotForm.roomNumber})`;
      }
    }

    if (!finalDetails.trim()) return;

    setSaving("slot-modal");
    const payload: any = {
      timetableId: data.id,
      dayOfWeek: selectedSlot.day,
      periodName: selectedSlot.period,
      subjectDetails: finalDetails,
      span: slotForm.span,
      oldSubjectDetails: selectedSlot.slot?.subjectDetails || "",
    };

    if (selectedSlot.slot) {
      payload.id = selectedSlot.slot.id;
    }

    try {
      const res = await fetch("/api/timetables/slots", {
        method: selectedSlot.slot ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to save slot");
      }
      toast("Slot saved successfully", "success");
      setSelectedSlot(null);
      fetchData();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSaving(null);
    }
  }

  // Delete slot
  async function handleDeleteSlot() {
    if (!selectedSlot?.slot) return;
    if (!confirm("Are you sure you want to clear this period?")) return;

    setSaving("slot-modal");
    try {
      const res = await fetch(`/api/timetables/slots?id=${selectedSlot.slot.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear slot");
      toast("Period cleared", "success");
      setSelectedSlot(null);
      fetchData();
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSaving(null);
    }
  }

  // --- Scoped Course Handlers ---
  function openAddCourse() {
    setEditingCourse(null);
    setIsElectiveGroup(false);
    setGroupCourses([
      { code: "", name: "", teacher: "" },
      { code: "", name: "", teacher: "" },
    ]);
    setCourseForm({ code: "", name: "", credits: "3", type: "lecture", courseType: "Core", teacher: "" });
    setCourseOpen(true);
  }

  function openEditCourse(c: ScopedCourse) {
    setEditingCourse(c);
    const isGroup = c.code.includes(" / ");
    setIsElectiveGroup(isGroup);

    if (isGroup) {
      const codes = c.code.split(" / ");
      const names = c.name.split(" / ");
      const teachers = c.teacher.split(" / ");
      const maxLen = Math.max(codes.length, names.length, teachers.length);
      const list = [];
      for (let i = 0; i < maxLen; i++) {
        list.push({
          code: codes[i] || "",
          name: names[i] || "",
          teacher: teachers[i] === "TBA" ? "" : (teachers[i] || ""),
        });
      }
      setGroupCourses(list);
    } else {
      setGroupCourses([
        { code: "", name: "", teacher: "" },
        { code: "", name: "", teacher: "" },
      ]);
    }

    setCourseForm({
      code: c.code,
      name: c.name,
      credits: String(c.credits),
      type: c.type,
      courseType: c.courseType,
      teacher: c.teacher === "TBA" ? "" : c.teacher,
    });
    setCourseOpen(true);
  }

  async function handleSaveCourse() {
    if (!data) return;

    let codeVal = courseForm.code;
    let nameVal = courseForm.name;
    let teacherVal = courseForm.teacher || "TBA";

    if (isElectiveGroup) {
      const activeGroup = groupCourses.filter(g => g.code.trim() && g.name.trim());
      if (activeGroup.length === 0) {
        toast("Please enter at least one elective course code and name", "error");
        return;
      }
      codeVal = activeGroup.map(g => g.code.trim()).join(" / ");
      nameVal = activeGroup.map(g => g.name.trim()).join(" / ");
      teacherVal = activeGroup.map(g => g.teacher.trim() || "TBA").join(" / ");
    }

    const payload = {
      code: codeVal,
      name: nameVal,
      credits: parseFloat(courseForm.credits) || 0,
      type: courseForm.type,
      courseType: courseForm.courseType,
      branchId: data.branchId,
      semester: data.semesterName,
      departmentId: data.departmentId,
      teacher: teacherVal,
    };

    try {
      if (editingCourse) {
        const res = await fetch("/api/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCourse.id, ...payload }),
        });
        if (!res.ok) throw new Error("Failed to update course");
        toast(`Course ${payload.code} updated`, "success");
      } else {
        const res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create course");
        toast(`Course ${payload.code} created`, "success");
      }
      setCourseOpen(false);
      fetchData();
    } catch (err: any) {
      toast(err.message, "error");
    }
  }

  async function handleDeleteCourse(courseId: string, courseCode: string) {
    if (!confirm(`Are you sure you want to delete course ${courseCode}?`)) return;
    try {
      const res = await fetch(`/api/courses?id=${courseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete course");
      toast(`Course ${courseCode} deleted`, "success");
      fetchData();
    } catch (err: any) {
      toast(err.message, "error");
    }
  }

  // Dynamic grid renderer supporting spans
  function getRowCells(day: string) {
    const cells: React.ReactNode[] = [];
    let skipCount = 0;

    for (let i = 0; i < PERIOD_ORDER.length; i++) {
      const period = PERIOD_ORDER[i];

      if (period === "LUNCH") {
        // Render vertical lunch break spanning down
        if (day === "Monday") {
          cells.push(
            <td
              key="lunch-break"
              rowSpan={5}
              className="w-10 border border-[#256199]/25 bg-[#F4F8FD] p-2 text-center text-xs font-bold uppercase tracking-widest text-[#256199]/70 select-none align-middle"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              LUNCH - BREAK
            </td>
          );
        }
        continue;
      }

      if (skipCount > 0) {
        skipCount--;
        continue;
      }

      const slot = getSlot(day, period);

      // Check consecutive identical slots for span rendering
      let colSpan = 1;
      if (slot && slot.subjectDetails.trim() && slot.subjectDetails !== "—") {
        for (let j = i + 1; j < PERIOD_ORDER.length; j++) {
          const nextPeriod = PERIOD_ORDER[j];
          if (nextPeriod === "LUNCH") break; // Split spanning at lunch

          const nextSlot = getSlot(day, nextPeriod);
          if (nextSlot && nextSlot.subjectDetails === slot.subjectDetails) {
            colSpan++;
          } else {
            break;
          }
        }
      }

      skipCount = colSpan - 1;

      const isOver = dragOverCell?.day === day && dragOverCell?.period === period;

      cells.push(
        <td
          key={period}
          colSpan={colSpan}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCell({ day, period });
          }}
          onDragLeave={() => setDragOverCell(null)}
          onDrop={(e) => handleDrop(e, day, period)}
          className={`border border-[#256199]/20 p-1.5 align-middle text-center min-h-[64px] transition-all relative ${
            isOver ? "bg-[#256199]/10 border-dashed border-[#256199] z-10" : ""
          } ${colSpan > 1 ? "bg-brand-blue/5 border-[#256199]/30 shadow-[inset_0_1px_3px_rgba(37,97,153,0.06)]" : ""}`}
        >
          {slot ? (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, slot.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleCellClick(day, period)}
              className="group cursor-grab active:cursor-grabbing w-full min-h-[50px] flex flex-col justify-center rounded-lg p-1.5 transition-colors hover:bg-[#256199]/5"
            >
              {/* Drag handle hint */}
              <div className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
                <Move className="size-3 text-[#256199]" />
              </div>
              <p className="text-xs font-extrabold text-[#256199] tracking-tight leading-snug">
                {slot.subjectDetails.replace(/\s*\([^)]+\)/, "")}
              </p>
              {slot.subjectDetails.includes("(") && (
                <p className="text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wide">
                  {slot.subjectDetails.match(/\(([^)]+)\)/)?.[1] || ""}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleCellClick(day, period)}
              className="w-full min-h-[50px] flex items-center justify-center text-[10px] text-muted-foreground/30 hover:text-[#256199] hover:bg-[#256199]/5 rounded-lg select-none"
            >
              —
            </button>
          )}
        </td>
      );
    }
    return cells;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!data) return null;

  const totalCredits = data.courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/timetable")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Timetables
          </Button>
          <div className="hidden h-5 w-[1.5px] bg-lines sm:block"></div>
          <div>
            <h1 className="text-lg font-bold text-ink">
              {data.department?.shortCode} Timetable Editor
            </h1>
            <p className="text-xs text-muted-foreground">{data.branch?.name} · {data.semesterName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle PDF preview panel */}
          <Button variant="outline" size="sm" onClick={() => setShowPdfRef(!showPdfRef)}>
            {showPdfRef ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
            {showPdfRef ? "Hide Paper PDF" : "Toggle PDF Reference"}
          </Button>

          {/* AI recognition triggers */}
          <Button onClick={handleAnalyzeWithAI} disabled={analyzing} size="sm" className="bg-brand-gradient">
            {analyzing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
            {analyzing ? `Analyzing... ${analysisSeconds}s (Est: ~35s)` : "Analyze Layout with AI"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main interactive grid area */}
        <div className="flex-1 w-full space-y-6">
          <div className="rounded-[26px] border border-[#256199]/25 bg-white p-6 shadow-card-sm space-y-6 font-sans">
            
            {/* Academic Board Header (matching PDF formatting exactly) */}
            <div className="text-center space-y-1 select-none pb-4 border-b">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Student TIME TABLE
                </p>
                <p className="text-xs font-bold text-muted-foreground">
                  wef: {new Date(data.wefDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
              </div>
              <h2 className="text-[17px] font-extrabold text-[#256199] tracking-tight uppercase mt-2">
                {data.institution}
              </h2>
              <p className="text-xs font-bold text-ink-soft tracking-widest uppercase">
                {data.academicTerm}
              </p>
            </div>

            {/* Scoped Metadata Grid */}
            <div className="grid grid-cols-4 border border-[#256199]/20 rounded-xl overflow-hidden bg-[#256199]/5 text-xs text-ink-soft select-none">
              <div className="p-2 border-r border-[#256199]/20">
                <strong>Department:</strong> {data.department?.name} ({data.department?.shortCode})
              </div>
              <div className="p-2 border-r border-[#256199]/20">
                <strong>Program:</strong> {data.program}
              </div>
              <div className="p-2 border-r border-[#256199]/20">
                <strong>Branch:</strong> {data.branch?.name}
              </div>
              <div className="p-2">
                <strong>Semester:</strong> {data.semesterName}
              </div>
            </div>

            {/* Custom visual grid */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse border border-[#256199]/30">
                <thead>
                  <tr>
                    <th className="border border-[#256199]/25 bg-[#256199]/5 p-3 text-left text-xs font-bold uppercase text-[#256199] w-24">
                      Days
                    </th>
                    {PERIOD_ORDER.map((p) => {
                      if (p === "LUNCH") {
                        return (
                          <th
                            key="LUNCH"
                            className="w-10 border border-[#256199]/25 bg-[#256199]/5 p-3 text-center text-xs font-bold text-[#256199] select-none"
                          >
                            Lunch
                          </th>
                        );
                      }
                      return (
                        <th
                          key={p}
                          className="border border-[#256199]/25 bg-[#256199]/5 p-3 text-center text-xs font-bold text-[#256199]"
                        >
                          <div className="text-xs">Period {p}</div>
                          <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                            {PERIOD_TIMES[p]}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="border border-[#256199]/25 bg-[#256199]/5 p-3 text-xs font-extrabold text-[#256199] select-none text-left">
                        {day}
                      </td>
                      {getRowCells(day)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Table: Course List Details */}
          <div className="rounded-[26px] border border-lines bg-white p-6 shadow-card-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-extrabold text-ink">Course Credit Code List</h3>
              <Button size="sm" variant="outline" onClick={openAddCourse}>
                <Plus className="mr-1 size-4" /> Add Scoped Course
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-canvas-2 border-b">
                    <th className="p-3 font-bold text-muted-foreground w-32 border-r">Course Code</th>
                    <th className="p-3 font-bold text-muted-foreground w-32 border-r">Category</th>
                    <th className="p-3 font-bold text-muted-foreground border-r">Course Name</th>
                    <th className="p-3 font-bold text-muted-foreground w-20 border-r text-center">Credit</th>
                    <th className="p-3 font-bold text-muted-foreground w-48 border-r">Teacher</th>
                    <th className="p-3 font-bold text-muted-foreground w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses.map((course) => {
                    const isGroup = course.code.includes(" / ");
                    const codes = isGroup ? course.code.split(" / ") : [course.code];
                    const names = isGroup ? course.name.split(" / ") : [course.name];
                    const teachers = isGroup ? course.teacher.split(" / ") : [course.teacher];

                    return (
                      <tr key={course.id} className="border-b last:border-0 hover:bg-canvas/50">
                        {/* Course Code */}
                        <td className="p-0 border-r align-middle">
                          {codes.map((c, idx) => (
                            <div key={idx} className="p-3 border-b last:border-b-0 font-mono font-bold text-[#256199] min-h-[48px] flex items-center">
                              {c}
                            </div>
                          ))}
                        </td>
                        {/* Category */}
                        <td className="p-3 font-bold text-ink-soft uppercase text-[10px] align-middle text-center w-32 border-r">
                          <span className="bg-canvas-2 border px-2 py-0.5 rounded-full">
                            {course.courseType || course.type}
                          </span>
                        </td>
                        {/* Course Name */}
                        <td className="p-0 border-r align-middle">
                          {names.map((n, idx) => (
                            <div key={idx} className="p-3 border-b last:border-b-0 font-semibold text-ink min-h-[48px] flex items-center">
                              {n}
                            </div>
                          ))}
                        </td>
                        {/* Credit */}
                        <td className="p-3 font-bold text-ink align-middle text-center w-20 border-r">
                          {course.credits}
                        </td>
                        {/* Teacher */}
                        <td className="p-0 border-r align-middle">
                          {teachers.map((t, idx) => (
                            <div key={idx} className="p-3 border-b last:border-b-0 text-muted-foreground min-h-[48px] flex items-center">
                              {t}
                            </div>
                          ))}
                        </td>
                        {/* Actions */}
                        <td className="p-3 align-middle text-center w-20">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => openEditCourse(course)}
                              className="p-1 hover:text-[#256199]"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id, course.code)}
                              className="p-1 hover:text-error"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Credits Row */}
                  <tr className="bg-[#256199]/5 font-extrabold border-t border-[#256199]/20 text-ink">
                    <td colSpan={3} className="p-3 text-right">Total Credits:</td>
                    <td className="p-3 text-left font-extrabold text-[#256199] text-sm">{totalCredits}</td>
                    <td colSpan={2} className="p-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Collapsible original PDF comparison reference page */}
        {showPdfRef && (
          <div className="w-full lg:w-[420px] rounded-[26px] border border-lines bg-white p-5 shadow-card-md shrink-0 sticky top-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-ink flex items-center gap-1.5">
                <Eye className="size-4 text-[#256199]" /> Paper PDF Snapshot
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setShowPdfRef(false)}>
                Close
              </Button>
            </div>
            <div className="rounded-xl overflow-hidden border max-h-[600px] overflow-y-auto bg-canvas">
              <img
                src={`/uploads/${params.id}.png`}
                alt="Visual snapshot representation of timetable"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <p className="text-[10px] text-center text-muted-foreground p-4">
                Verify cells and merge timelines against this snapshot. Use "Analyze Layout with AI" if spans are misaligned.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- Slot Edit Dialog Modal --- */}
      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule Period</DialogTitle>
            <DialogDescription>
              Assign a class or override custom text for {selectedSlot?.day} Period {selectedSlot?.period}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Select From Scoped Courses</Label>
              <Select
                value={slotForm.subjectDetails}
                onValueChange={(v) => setSlotForm({ ...slotForm, subjectDetails: v || "", customOverride: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose course code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="—">Clear slot (Empty)</SelectItem>
                  {data.courses.map((c) => (
                    <SelectItem key={c.id} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slot-room">Room / Location</Label>
              <Input
                id="slot-room"
                placeholder="e.g. 220, Lab 1"
                value={slotForm.roomNumber}
                onChange={(e) => setSlotForm({ ...slotForm, roomNumber: e.target.value, customOverride: "" })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slot-span">Span Duration (Periods)</Label>
              <Select
                value={String(slotForm.span)}
                onValueChange={(v) => setSlotForm({ ...slotForm, span: parseInt(v || "1") })}
              >
                <SelectTrigger id="slot-span">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s} {s === 1 ? "Period" : "Periods"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex items-center py-2 select-none">
              <div className="flex-grow border-t border-lines"></div>
              <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-muted-foreground">OR Custom Text Override</span>
              <div className="flex-grow border-t border-lines"></div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slot-custom">Full Custom Subject Details</Label>
              <Input
                id="slot-custom"
                placeholder="e.g. AP Lab (Lab 1) or FLAT (T) (220)"
                value={slotForm.customOverride}
                onChange={(e) => setSlotForm({ ...slotForm, customOverride: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {selectedSlot?.slot && (
              <Button variant="ghost" onClick={handleDeleteSlot} disabled={!!saving} className="text-error hover:bg-error/5 hover:text-error mr-auto">
                <Trash2 className="size-4 mr-1" /> Clear Period
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>Cancel</Button>
            <Button onClick={handleSaveSlot} disabled={!!saving}>
              {saving === "slot-modal" ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Save className="size-4 mr-1" />}
              Save Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Scoped Course Dialog Modal --- */}
      <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course details" : "Add Scoped Course"}</DialogTitle>
            <DialogDescription>
              This course will be scoped to this timetable branch ({data.branch?.name}) and semester ({data.semesterName}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center space-x-2 py-1 select-none border-b pb-2">
              <input
                type="checkbox"
                id="course-is-elective-group"
                checked={isElectiveGroup}
                onChange={(e) => setIsElectiveGroup(e.target.checked)}
                className="size-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
              />
              <Label htmlFor="course-is-elective-group" className="cursor-pointer font-bold text-xs text-ink-soft">
                Group Elective / Multi-Course (e.g. IT349 / IT353)
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-category">Category / Type</Label>
                <Input
                  id="course-category"
                  placeholder="e.g. Core, PE III, Elective"
                  value={courseForm.courseType}
                  onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-credits">Credit Hours</Label>
                <Input
                  id="course-credits"
                  type="number"
                  step="0.5"
                  value={courseForm.credits}
                  onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Delivery Mode</Label>
              <Select
                value={courseForm.type}
                onValueChange={(v) => setCourseForm({ ...courseForm, type: v || "lecture" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isElectiveGroup ? (
              <div className="space-y-3">
                <Label className="font-bold text-[#256199]">Elective Sub-Courses List</Label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border-t pt-2">
                  {groupCourses.map((gc, idx) => (
                    <div key={idx} className="space-y-3 p-3 border rounded-xl bg-canvas-2 relative">
                      {groupCourses.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setGroupCourses(groupCourses.filter((_, i) => i !== idx))}
                          className="absolute right-2 top-2 text-xs font-bold text-error hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      <p className="text-[10px] uppercase font-bold text-[#256199]">Course Option #{idx + 1}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Course Code</Label>
                          <Input
                            placeholder="e.g. IT349"
                            list="system-course-codes"
                            value={gc.code}
                            onChange={(e) => {
                              const items = [...groupCourses];
                              const newCode = e.target.value;
                              items[idx].code = newCode;
                              
                              const matchedCourse = systemCourses.find((c) => c.code === newCode);
                              if (matchedCourse) {
                                if (!items[idx].name) items[idx].name = matchedCourse.name;
                                const teachers = matchedCourse.faculty?.map((f: any) => f.faculty.name) || [];
                                if (teachers.length === 1 && (!items[idx].teacher || items[idx].teacher === "TBA")) {
                                  items[idx].teacher = teachers[0];
                                }
                              }
                              setGroupCourses(items);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Teacher Assigned</Label>
                          <Input
                            placeholder="e.g. Dr. Sumit Srivastava"
                            list={`teachers-${gc.code}`}
                            value={gc.teacher}
                            onChange={(e) => {
                              const items = [...groupCourses];
                              items[idx].teacher = e.target.value;
                              setGroupCourses(items);
                            }}
                          />
                          {systemCourses.find(c => c.code === gc.code) && (
                            <datalist id={`teachers-${gc.code}`}>
                              {systemCourses.find(c => c.code === gc.code)?.faculty?.map((f: any) => (
                                <option key={f.faculty.id} value={f.faculty.name} />
                              ))}
                            </datalist>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Course Name</Label>
                        <Input
                          placeholder="e.g. Cryptography and Network Security"
                          value={gc.name}
                          onChange={(e) => {
                            const items = [...groupCourses];
                            items[idx].name = e.target.value;
                            setGroupCourses(items);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupCourses([...groupCourses, { code: "", name: "", teacher: "" }])}
                  className="w-full border-dashed"
                >
                  + Add Course Option
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    placeholder="e.g. CS24211"
                    list="system-course-codes"
                    value={courseForm.code}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setCourseForm(prev => {
                        const next = { ...prev, code: newCode };
                        const matchedCourse = systemCourses.find((c) => c.code === newCode);
                        if (matchedCourse) {
                          if (!next.name) next.name = matchedCourse.name;
                          const teachers = matchedCourse.faculty?.map((f: any) => f.faculty.name) || [];
                          if (teachers.length === 1 && (!next.teacher || next.teacher === "TBA")) {
                            next.teacher = teachers[0];
                          }
                        }
                        return next;
                      });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input
                    id="course-name"
                    placeholder="e.g. Data Base Management System"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course-teacher">Teacher Assigned</Label>
                  <Input
                    id="course-teacher"
                    placeholder="e.g. Dr. Saikat Chakraborty"
                    list={`teachers-${courseForm.code}`}
                    value={courseForm.teacher}
                    onChange={(e) => setCourseForm({ ...courseForm, teacher: e.target.value })}
                  />
                  {systemCourses.find(c => c.code === courseForm.code) && (
                    <datalist id={`teachers-${courseForm.code}`}>
                      {systemCourses.find(c => c.code === courseForm.code)?.faculty?.map((f: any) => (
                        <option key={f.faculty.id} value={f.faculty.name} />
                      ))}
                    </datalist>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveCourse}
              disabled={
                isElectiveGroup
                  ? groupCourses.filter(g => g.code.trim() && g.name.trim()).length === 0
                  : !courseForm.code || !courseForm.name
              }
            >
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Global Datalist for all unique course codes across the system */}
      <datalist id="system-course-codes">
        {Array.from(new Set(systemCourses.map((c) => c.code))).map((code) => (
          <option key={code} value={code as string} />
        ))}
      </datalist>
    </div>
  );
}

