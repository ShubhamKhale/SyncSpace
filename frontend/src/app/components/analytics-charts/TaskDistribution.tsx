"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutGrid } from "lucide-react";

export interface DistributionItem {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface Props { data: DistributionItem[] }

const CATEGORIES = [
  { name: "Development", color: "#6366F1" },
  { name: "Design",      color: "#10B981" },
  { name: "Marketing",   color: "#F59E0B" },
  { name: "Testing",     color: "#8B5CF6" },
  { name: "Others",      color: "#CBD5E1" },
];

const FALLBACK = CATEGORIES.map(c => ({ name: c.name, value: 0 }));

export default function TaskDistribution({ data }: Props) {
  const isEmpty = !data.length || data.every(d => d.value === 0);
  const chartData = isEmpty ? FALLBACK : data;
  const colorMap = Object.fromEntries(CATEGORIES.map(c => [c.name, c.color]));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Task Distribution by Category</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0 w-[160px] h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={isEmpty ? [{ name: "empty", value: 1 }] : chartData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={74}
                dataKey="value" strokeWidth={2}
              >
                {isEmpty
                  ? <Cell fill="#E2E8F0" />
                  : chartData.map((entry, i) => (
                      <Cell key={i} fill={colorMap[entry.name] ?? CATEGORIES[i % CATEGORIES.length].color} />
                    ))
                }
              </Pie>
              {!isEmpty && <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />}
            </PieChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <LayoutGrid size={20} className="text-slate-300 mb-1" />
              <p className="text-[10px] text-slate-400 text-center leading-tight">No data<br/>available</p>
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {CATEGORIES.map((cat) => {
            const match = chartData.find(d => d.name === cat.name);
            return (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{match?.value ?? 0}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
