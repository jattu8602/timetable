import { prisma } from "@/lib/prisma";
import { CourseTypeChart } from "@/components/dashboard/course-type-chart";
import { DailySlotsChart } from "@/components/dashboard/daily-slots-chart";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Institution analytics & operational metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Room Utilisation" value={`${a.roomUtilisation}%`} description="Across all rooms" />
        <MetricCard title="Empty Room Probability" value={`${Math.round(a.emptyProbability.reduce((s, p) => s + p.probability, 0) / a.emptyProbability.length)}%`} description="Avg per time slot (I–IX)" />
        <MetricCard title="Under-Running Courses" value={a.underRunningCount.toString()} description={`${a.underRunning.length} flagged`} />
        <MetricCard title="Avg Empty Room-Hours" value={`${a.avgEmptyRoomHours}h`} description="Per room per day" />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium">Empty Room Probability by Period</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
          {a.emptyProbability.map((p) => (
            <div key={p.period} className="rounded-lg border bg-muted/30 p-2 text-center">
              <div className="text-xs text-muted-foreground">Period {p.period}</div>
              <div className="mt-1 text-lg font-bold">{p.probability}%</div>
              <div className="text-xs text-muted-foreground">{p.empty}/{p.total} days</div>
            </div>
          ))}
        </div>
      </div>

      {a.underRunning.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">Under-Running Courses</h3>
          <div className="space-y-1">
            {a.underRunning.map((c) => (
              <div key={c.code} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-1.5 text-sm">
                <span className="font-medium">{c.code}</span>
                <span className="text-muted-foreground">{c.name}</span>
                <span className="text-amber-600">{c.credits}cr — gap: {c.gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <CourseTypeChart data={a.courseTypeData} />
        <DailySlotsChart data={a.dailySlotData} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
