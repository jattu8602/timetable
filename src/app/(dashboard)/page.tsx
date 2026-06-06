import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { CourseTypeChart } from "@/components/dashboard/course-type-chart";
import { DailySlotsChart } from "@/components/dashboard/daily-slots-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const SLOT_DURATION_HOURS = 50 / 60;
const PERIODS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

async function getAnalytics() {
  const totalRooms = await prisma.room.count({ where: { deletedAt: null } });
  const totalCourses = await prisma.course.count({ where: { deletedAt: null } });
  const totalFaculty = await prisma.faculty.count({ where: { deletedAt: null } });
  const totalSlots = await prisma.timeSlot.count();
  const totalTimetables = await prisma.timetable.count({ where: { deletedAt: null } });

  const allRooms = await prisma.room.findMany({
    where: { deletedAt: null },
    select: { id: true },
  });
  const roomCount = allRooms.length;

  const maxSlots = roomCount * 5 * 9;
  const roomUtilisation = maxSlots > 0 ? (totalSlots / maxSlots) * 100 : 0;

  const underRunningCourses = await prisma.course.findMany({
    where: { credits: { gt: 0 }, deletedAt: null },
    include: { faculty: true },
  });
  const underRunning = underRunningCourses
    .filter((c) => Math.ceil(c.credits) > 3)
    .map((c) => ({
      code: c.code,
      name: c.name,
      credits: c.credits,
      gap: Math.ceil(c.credits) - 3,
    }));

  const allSlots = await prisma.timeSlot.findMany({
    select: { dayOfWeek: true, periodName: true },
  });

  const occupiedKeys = new Set(
    allSlots.map((s) => `${s.dayOfWeek}|${s.periodName}`)
  );

  const emptyProbability: Record<string, { period: string; empty: number; total: number; probability: number }> = {};
  for (const period of PERIODS) {
    let empty = 0;
    for (const day of DAYS) {
      if (!occupiedKeys.has(`${day}|${period}`)) empty++;
    }
    emptyProbability[period] = {
      period,
      empty,
      total: DAYS.length,
      probability: Math.round((empty / DAYS.length) * 100),
    };
  }

  const slotsPerRoom = allSlots.length;
  const totalPossibleSlots = roomCount * 5 * 9;
  const emptySlots = Math.max(0, totalPossibleSlots - slotsPerRoom);
  const avgEmptyRoomHours = roomCount > 0
    ? Math.round(((emptySlots / roomCount) * SLOT_DURATION_HOURS) * 100) / 100
    : 0;

  const courseTypes = await prisma.course.groupBy({
    by: ["type"],
    _count: { id: true },
    where: { deletedAt: null },
  });
  const courseTypeData = courseTypes.map((ct) => ({
    type: ct.type,
    count: ct._count.id,
  }));

  const slotsByDay = await prisma.timeSlot.findMany({
    select: { dayOfWeek: true },
  });
  const dayCounts: Record<string, number> = {};
  for (const d of DAYS) dayCounts[d] = 0;
  for (const s of slotsByDay) {
    if (dayCounts[s.dayOfWeek] !== undefined) dayCounts[s.dayOfWeek]++;
  }
  const dailySlotData = DAYS
    .filter((d) => dayCounts[d] > 0)
    .map((day) => ({ day: day.slice(0, 3), slots: dayCounts[day] }));

  return {
    totalRooms: roomCount,
    totalCourses,
    totalFaculty,
    totalSlots,
    totalTimetables,
    roomUtilisation: Math.round(roomUtilisation * 100) / 100,
    underRunningCount: underRunning.length,
    underRunning,
    emptyProbability: Object.values(emptyProbability),
    avgEmptyRoomHours,
    courseTypeData,
    dailySlotData,
  };
}

export default async function DashboardPage() {
  const a = await getAnalytics();

  const avgEmpty = a.emptyProbability.length > 0
    ? Math.round(a.emptyProbability.reduce((s, p) => s + p.probability, 0) / a.emptyProbability.length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 rounded-[26px] border border-line-2 bg-[#DCEAF8] p-[22px] shadow-[inset_0_1px_0_#ffffff]">
        <div className="bg-brand-gradient rounded-[20px] p-[30px_32px] shadow-card-md">
          <div className="flex items-start justify-between">
            <div className="max-w-lg">
              <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-white leading-tight">
                Welcome back, Admin
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/90">
                Here’s a quick snapshot of your institution. Review room utilisation, under-running courses, and daily slot activity.
              </p>
            </div>
            <Image
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold text-muted">Total Rooms</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.totalRooms}
            </p>
            <p className="text-[13px] font-medium text-success">{a.roomUtilisation}% utilised</p>
          </div>
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold text-muted">Total Courses</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.totalCourses}
            </p>
            <p className="text-[13px] font-medium text-warning">{a.underRunningCount} under-running</p>
          </div>
          <div className="flex flex-col gap-[6px] rounded-[22px] bg-surface p-[22px_24px] shadow-card-sm">
            <p className="text-[13px] font-bold text-muted">Total Faculty</p>
            <p className="text-[38px] font-extrabold tracking-[-0.03em] text-ink leading-none">
              {a.totalFaculty}
            </p>
            <p className="text-[13px] font-medium text-info">{a.totalTimetables} timetables</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empty Room Probability by Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
            {a.emptyProbability.map((p) => (
              <div key={p.period} className="rounded-[14px] border border-lines bg-canvas-2/30 p-3 text-center">
                <div className="text-xs text-muted-foreground">Period {p.period}</div>
                <div className="mt-1 text-lg font-bold text-ink">{p.probability}%</div>
                <div className="text-xs text-muted-foreground">{p.empty}/{p.total} days</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {a.underRunning.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Under-Running Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {a.underRunning.map((c) => (
                <div key={c.code} className="flex items-center justify-between rounded-full bg-canvas-2/30 px-4 py-2 text-sm">
                  <span className="font-medium text-ink">{c.code}</span>
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="text-warning">{c.credits}cr — gap: {c.gap}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <CourseTypeChart data={a.courseTypeData} />
        <DailySlotsChart data={a.dailySlotData} />
      </div>
    </div>
  );
}
