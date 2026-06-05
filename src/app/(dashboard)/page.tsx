import { prisma } from "@/lib/prisma";
import { CourseTypeChart } from "@/components/dashboard/course-type-chart";
import { DailySlotsChart } from "@/components/dashboard/daily-slots-chart";

export const dynamic = "force-dynamic";

async function getAnalytics() {
  const totalRooms = await prisma.room.count();
  const totalCourses = await prisma.course.count();
  const totalFaculty = await prisma.faculty.count();
  const totalSlots = await prisma.timeSlot.count();
  const totalTimetables = await prisma.timetable.count();

  const maxSlots = totalRooms * 5 * 9;
  const roomUtilisation = maxSlots > 0 ? (totalSlots / maxSlots) * 100 : 0;

  const underRunningCourses = await prisma.course.findMany({
    where: { credits: { gt: 0 } },
  });
  const underRunningCount = underRunningCourses.filter(
    (c) => Math.ceil(c.credits) > 3
  ).length;

  const courseTypes = await prisma.course.groupBy({
    by: ["type"],
    _count: { id: true },
  });
  const courseTypeData = courseTypes.map((ct) => ({
    type: ct.type,
    count: ct._count.id,
  }));

  const slotsByDay = await prisma.timeSlot.findMany({
    select: { dayOfWeek: true },
  });
  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayCounts: Record<string, number> = {};
  for (const d of dayOrder) dayCounts[d] = 0;
  for (const s of slotsByDay) {
    if (dayCounts[s.dayOfWeek] !== undefined) dayCounts[s.dayOfWeek]++;
  }
  const dailySlotData = dayOrder
    .filter((d) => dayCounts[d] > 0)
    .map((day) => ({ day: day.slice(0, 3), slots: dayCounts[day] }));

  return {
    totalRooms,
    totalCourses,
    totalFaculty,
    totalSlots,
    totalTimetables,
    roomUtilisation: Math.round(roomUtilisation * 100) / 100,
    underRunningCount,
    courseTypeData,
    dailySlotData,
  };
}

export default async function DashboardPage() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Institution analytics & operational metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Room Utilisation"
          value={`${analytics.roomUtilisation}%`}
          description="Across all rooms"
        />
        <MetricCard
          title="Total Rooms"
          value={analytics.totalRooms.toString()}
          description="Lecture halls & labs"
        />
        <MetricCard
          title="Active Courses"
          value={analytics.totalCourses.toString()}
          description={`${analytics.totalTimetables} timetables`}
        />
        <MetricCard
          title="Under-Running Courses"
          value={analytics.underRunningCount.toString()}
          description="Below credit-hour threshold"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CourseTypeChart data={analytics.courseTypeData} />
        <DailySlotsChart data={analytics.dailySlotData} />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
