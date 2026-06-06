"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DailySlotsChartProps {
  data: { day: string; slots: number }[];
}

export function DailySlotsChart({ data }: DailySlotsChartProps) {
  return (
    <div className="rounded-[22px] border border-lines bg-surface p-6 shadow-card-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Slots per Day of Week
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E7EEF7" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#7c8294" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#7c8294" }} tickLine={false} />
            <Tooltip />
            <Bar
              dataKey="slots"
              fill="#256199"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
