"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#256199", "#3DA1FF", "#6EC8FF", "#9EDAFF", "#C8E9FF", "#E8F5FF"];

interface CourseTypeChartProps {
  data: { type: string; count: number }[];
}

export function CourseTypeChart({ data }: CourseTypeChartProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Courses by Type
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="type"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs capitalize">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
