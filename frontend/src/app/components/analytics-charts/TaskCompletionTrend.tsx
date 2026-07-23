"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ResponsiveContainer, Dot,
} from "recharts";
import { ChevronDown } from "lucide-react";

export interface TrendPoint {
  month: string;
  created: number;
  completed: number;
}

interface Props { data: TrendPoint[] }

const FALLBACK: TrendPoint[] = [
  { month: "Jan", created: 0, completed: 0 },
  { month: "Feb", created: 0, completed: 0 },
  { month: "Mar", created: 0, completed: 0 },
  { month: "Apr", created: 0, completed: 0 },
  { month: "May", created: 0, completed: 0 },
  { month: "Jun", created: 0, completed: 0 },
  { month: "Jul", created: 0, completed: 0 },
];

export default function TaskCompletionTrend({ data }: Props) {
  const chartData = data.length ? data : FALLBACK;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Task Completion Trend</h2>
        <button className="flex items-center gap-1 text-xs text-[#6366F1] font-medium">
          This Year <ChevronDown size={13} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
            cursor={{ stroke: "#E2E8F0" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-xs text-slate-500 capitalize">{v}</span>}
          />
          <Line
            type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2}
            dot={<Dot r={4} fill="#10B981" strokeWidth={0} />}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={2} strokeDasharray="5 3"
            dot={<Dot r={4} fill="#6366F1" strokeWidth={0} />}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
