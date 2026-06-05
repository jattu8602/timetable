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
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Slots per Day of Week
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.02 240)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} />
            <Tooltip />
            <Bar
              dataKey="slots"
              fill="#256199"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
