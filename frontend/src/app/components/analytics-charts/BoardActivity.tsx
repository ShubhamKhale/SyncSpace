"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ChevronDown } from "lucide-react";

export interface BoardActivityItem {
  name: string;
  value: number;
}

interface Props { data: BoardActivityItem[] }

const FALLBACK: BoardActivityItem[] = [
  { name: "Boards",   value: 0 },
  { name: "Tasks",    value: 0 },
  { name: "Comments", value: 0 },
  { name: "Updates",  value: 0 },
];

const BAR_COLOR = "#6366F1";

export default function BoardActivity({ data }: Props) {
  const chartData = data.length ? data : FALLBACK;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Board Activity</h2>
        <button className="flex items-center gap-1 text-xs text-[#6366F1] font-medium">
          This Month <ChevronDown size={13} />
        </button>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
            cursor={{ fill: "#F8F9FC" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
