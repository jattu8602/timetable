import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CourseTypeChart } from "@/components/dashboard/course-type-chart";
import { DailySlotsChart } from "@/components/dashboard/daily-slots-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const SLOT_DURATION_HOURS = 50 / 60;
const PERIODS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function doesSlotOccupyRoom(subjectDetails: string, roomNumber: string): boolean {
  const detailsNorm = subjectDetails.toLowerCase();
  const roomNorm = roomNumber.toLowerCase();

  try {
    const escaped = roomNorm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(detailsNorm);
  } catch {
    return detailsNorm.includes(roomNorm);
  }
}

async function getAnalytics() {
  const totalCourses = await prisma.course.count({ where: { deletedAt: null } });
  const totalFaculty = await prisma.faculty.count({ where: { deletedAt: null } });
  const totalSlots = await prisma.timeSlot.count();
  const totalTimetables = await prisma.timetable.count({ where: { deletedAt: null, status: "PUBLISHED" } });

  const rooms = await prisma.room.findMany({
    where: { deletedAt: null },
    include: { department: true },
  });
  const roomCount = rooms.length;

  const timetables = await prisma.timetable.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    include: { slots: true },
  });

  const activeSlots = timetables.flatMap((tt) => tt.slots);

  // Track occupied (day, period) per room to prevent double-counting of conflicts
  const roomOccupiedSlots = new Map<string, Set<string>>();
  for (const room of rooms) {
    roomOccupiedSlots.set(room.number, new Set<string>());
  }

  for (const slot of activeSlots) {
    for (const room of rooms) {
      if (doesSlotOccupyRoom(slot.subjectDetails, room.number)) {
        roomOccupiedSlots.get(room.number)!.add(`${slot.dayOfWeek}|${slot.periodName}`);
      }
    }
  }

  // 1. Room Utilisation % per room and overall
  let totalOccupiedCount = 0;
  const roomUtilisations = rooms.map((room) => {
    const occupiedSet = roomOccupiedSlots.get(room.number) || new Set();
    const occupiedCount = occupiedSet.size;
    totalOccupiedCount += occupiedCount;
    return {
      id: room.id,
      number: room.number,
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      departmentCode: room.department?.shortCode ?? "—",
      utilisation: Math.round((occupiedCount / 45) * 100),
    };
  });

  const roomUtilisation = roomCount > 0 ? (totalOccupiedCount / (roomCount * 45)) * 100 : 0;

  // 2. Probability of Finding an Empty Room - per Slot and Period
  const slotEmptyRooms = new Map<string, number>();
  for (const day of DAYS) {
    for (const period of PERIODS) {
      const key = `${day}|${period}`;
      let occupiedCount = 0;
      for (const room of rooms) {
        const occupiedSet = roomOccupiedSlots.get(room.number);
        if (occupiedSet && occupiedSet.has(key)) {
          occupiedCount++;
        }
      }
      const freeCount = Math.max(0, roomCount - occupiedCount);
      slotEmptyRooms.set(key, freeCount);
    }
  }

  const emptyProbability = PERIODS.map((period) => {
    let totalFree = 0;
    for (const day of DAYS) {
      totalFree += slotEmptyRooms.get(`${day}|${period}`) || 0;
    }
    const totalPossible = DAYS.length * roomCount;
    const probability = totalPossible > 0 ? Math.round((totalFree / totalPossible) * 100) : 100;
    return {
      period,
      probability,
      free: totalFree,
      total: totalPossible,
    };
  });

  // Detailed Day-Period grid for UI visualization
  const gridData = DAYS.map((day) => {
    const periods = PERIODS.map((period) => {
      const freeCount = slotEmptyRooms.get(`${day}|${period}`) ?? roomCount;
      const prob = roomCount > 0 ? Math.round((freeCount / roomCount) * 100) : 100;
      return {
        period,
        probability: prob,
        free: freeCount,
        total: roomCount,
      };
    });
    return { day, periods };
  });

  // 3. Under-Running Courses (Actual scheduled hours vs credits)
  const courses = await prisma.course.findMany({
    where: { deletedAt: null },
    include: { branch: true },
  });

  const slotsByBranchSem = new Map<string, any[]>();
  for (const tt of timetables) {
    const key = `${tt.branchId}|${tt.semesterName}`;
    if (!slotsByBranchSem.has(key)) {
      slotsByBranchSem.set(key, []);
    }
    slotsByBranchSem.get(key)!.push(...tt.slots);
  }

  const underRunning = [];
  for (const c of courses) {
    if (c.credits <= 0) continue;
    const key = `${c.branchId}|${c.semester}`;
    const branchSlots = slotsByBranchSem.get(key) || [];

    // Check if course code is scheduled in this branch/semester
    const escapedCode = c.code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const codeRegex = new RegExp(`\\b${escapedCode}\\b`, 'i');
    const scheduledSlotsCount = branchSlots.filter((s) => codeRegex.test(s.subjectDetails)).length;

    if (scheduledSlotsCount < c.credits) {
      underRunning.push({
        code: c.code,
        name: c.name,
        credits: c.credits,
        scheduled: scheduledSlotsCount,
        gap: c.credits - scheduledSlotsCount,
        branch: c.branch?.name ?? "CS",
        semester: c.semester,
      });
    }
  }

  // 4. Average Empty Room-Hours per Day
  // sum over all rooms of (unscheduled slots * duration) / 5 (days)
  const totalUnscheduledSlots = roomCount * 45 - totalOccupiedCount;
  const avgEmptyRoomHours = roomCount > 0
    ? Math.round(((totalUnscheduledSlots / (roomCount * 5)) * SLOT_DURATION_HOURS) * 100) / 100
    : 0;

  // Course types distribution for pie chart
  const courseTypes = await prisma.course.groupBy({
    by: ["courseType"],
    _count: { id: true },
    where: { deletedAt: null },
  });
  const courseTypeData = courseTypes.map((ct) => ({
    type: ct.courseType || "lecture",
    count: ct._count.id,
  }));

  // Slots counts by day for bar chart
  const dayCounts: Record<string, number> = {};
  for (const d of DAYS) dayCounts[d] = 0;
  for (const s of activeSlots) {
    if (dayCounts[s.dayOfWeek] !== undefined) dayCounts[s.dayOfWeek]++;
  }
  const dailySlotData = DAYS.map((day) => ({
    day: day.slice(0, 3),
    slots: dayCounts[day],
  }));

  return {
    totalRooms: roomCount,
    totalCourses,
    totalFaculty,
    totalSlots,
    totalTimetables,
    roomUtilisation: Math.round(roomUtilisation * 100) / 100,
    underRunningCount: underRunning.length,
    underRunning: underRunning.slice(0, 5), // show top 5 on dashboard
    emptyProbability,
    gridData,
    avgEmptyRoomHours,
    courseTypeData,
    dailySlotData,
    roomUtilisations: roomUtilisations.sort((a, b) => b.utilisation - a.utilisation).slice(0, 5), // top utilized rooms
  };
}

export default async function DashboardPage() {
  const a = await getAnalytics();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-5 rounded-[26px] border border-line-2 bg-[#DCEAF8] p-[22px] shadow-[inset_0_1px_0_#ffffff]">
        <div className="bg-brand-gradient rounded-[20px] p-[30px_32px] shadow-card-md">
          <div className="flex items-start justify-between">
            <div className="max-w-lg">
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-white leading-tight">
                Welcome back, Admin
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/90">
                Here’s a snapshot of your university operations. The metrics below represent live calculations from your database timetables.
              </p>
            </div>
            <img
              src="/logo.png"
              alt=""
              width={60}
              height={60}
              className="hidden rounded-[16px] sm:block"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/timetable"
              className="inline-flex shrink-0 items-center justify-center gap-[9px] rounded-full bg-surface p-[13px_24px] text-[14.5px] font-bold text-ink shadow-card-sm transition-all duration-180 hover:-translate-y-[2px] hover:shadow-card-md"
            >
              View Timetables
            </Link>
            <Link
              href="/departments"
              className="inline-flex shrink-0 items-center justify-center gap-[9px] rounded-full border-[1.5px] border-white/30 p-[13px_24px] text-[14.5px] font-bold text-white transition-all duration-180 hover:-translate-y-[2px] hover:bg-white/10"
            >
              Manage Departments
            </Link>
          </div>
        </div>

        {/* Top-Level Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold ">Room Utilisation</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.roomUtilisation}%
            </p>
            <p className="text-[13px] font-medium text-success">Overall department-wide</p>
          </div>
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold ">Empty Room-Hours</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.avgEmptyRoomHours}h
            </p>
            <p className="text-[13px] font-medium text-muted-foreground">Average per room/day</p>
          </div>
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold ">Under-Running Courses</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.underRunningCount}
            </p>
            <p className="text-[13px] font-medium text-warning">Behind contact slot quota</p>
          </div>
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold ">Total Class Rooms</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.totalRooms}
            </p>
            <p className="text-[13px] font-medium text-info">{a.totalTimetables} timetables loaded</p>
          </div>
        </div>
      </div>

      {/* Grid of Empty Room Probabilities (Class Recovery Planner) */}
      <Card className="rounded-[22px] border border-lines">
        <CardHeader>
          <CardTitle>Empty Room Availability Grid</CardTitle>
          <CardDescription>
            The probability of finding an empty room per slot. Use this grid to recover lost class hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-xs font-bold uppercase text-muted-foreground">Day</th>
                  {PERIODS.map((p) => (
                    <th key={p} className="p-2 text-center text-xs font-bold uppercase text-muted-foreground">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {a.gridData.map((row) => (
                  <tr key={row.day} className="border-t border-lines">
                    <td className="p-2 text-sm font-semibold text-ink">{row.day}</td>
                    {row.periods.map((cell, idx) => {
                      // Color coding based on probability
                      let bg = "bg-red-50 text-red-700 border-red-200";
                      if (cell.probability > 75) {
                        bg = "bg-green-50 text-green-700 border-green-200";
                      } else if (cell.probability > 40) {
                        bg = "bg-yellow-50 text-yellow-700 border-yellow-200";
                      }
                      return (
                        <td key={idx} className="p-1.5">
                          <div className={`rounded-lg border p-2 text-center text-xs font-bold ${bg}`}>
                            <div>{cell.probability}%</div>
                            <div className="text-[10px] opacity-80">
                              {cell.free}/{cell.total} free
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Utilised Rooms Table */}
        <Card className="rounded-[22px] border border-lines">
          <CardHeader>
            <CardTitle>Room Utilisation Breakdown</CardTitle>
            <CardDescription>Top utilized rooms on campus (based on a 45-slot week)</CardDescription>
          </CardHeader>
          <CardContent>
            {a.roomUtilisations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No rooms loaded.</p>
            ) : (
              <div className="space-y-3">
                {a.roomUtilisations.map((room) => (
                  <div key={room.id} className="flex items-center justify-between border-b border-lines pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-ink">Room {room.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.type} · Capacity: {room.capacity} · Dept: {room.departmentCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink">{room.utilisation}%</p>
                      <div className="w-24 bg-canvas h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-brand-blue h-full rounded-full"
                          style={{ width: `${Math.min(room.utilisation, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Under-Running Courses Alerts */}
        <Card className="rounded-[22px] border border-lines">
          <CardHeader>
            <CardTitle>Under-Running Courses (Live Audit)</CardTitle>
            <CardDescription>Courses with fewer scheduled sessions than required by credits</CardDescription>
          </CardHeader>
          <CardContent>
            {a.underRunning.length === 0 ? (
              <p className="text-sm text-success text-center py-6">All courses are fully scheduled!</p>
            ) : (
              <div className="space-y-3">
                {a.underRunning.map((c) => (
                  <div key={c.code} className="flex items-center justify-between border-b border-lines pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-ink">{c.code} — {c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Branch: {c.branch} · Semester: {c.semester}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                        Gap: {c.gap} slots ({c.scheduled}/{c.credits} scheduled)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CourseTypeChart data={a.courseTypeData} />
        <DailySlotsChart data={a.dailySlotData} />
      </div>
    </div>
  );
}

