"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

export interface TeamContributionPoint {
  phase: string;
  [member: string]: string | number;
}

interface Props {
  data: TeamContributionPoint[];
  members: string[];
}

const PHASES = [
  { name: "Planning",    color: "#6366F1" },
  { name: "In Progress", color: "#10B981" },
  { name: "Review",      color: "#F59E0B" },
  { name: "Done",        color: "#8B5CF6" },
];

export default function TeamContribution({ data, members }: Props) {
  // Aggregate total per phase across all members
  const pieData = PHASES.map(phase => {
    const row = data.find(d => d.phase === phase.name);
    const total = row
      ? members.reduce((sum, m) => sum + (Number(row[m]) || 0), 0)
      : 0;
    return { name: phase.name, value: total, color: phase.color };
  });

  const totalAll = pieData.reduce((s, d) => s + d.value, 0);
  const isEmpty = totalAll === 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Team Contribution by Phase</h2>
      </div>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0 w-[160px] h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={isEmpty ? [{ name: "empty", value: 1 }] : pieData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={74}
                dataKey="value" strokeWidth={2}
              >
                {isEmpty
                  ? <Cell fill="#E2E8F0" />
                  : pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))
                }
              </Pie>
              {!isEmpty && <Tooltip contentStyle={{ borderRadius: 8, border: "none", fontSize: 12 }} />}
            </PieChart>
          </ResponsiveContainer>
          {isEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Users size={20} className="text-slate-300 mb-1" />
              <p className="text-[10px] text-slate-400 text-center leading-tight">No data<br/>available</p>
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1">
          {PHASES.map((phase) => {
            const entry = pieData.find(d => d.name === phase.name);
            const pct = totalAll > 0 ? Math.round(((entry?.value ?? 0) / totalAll) * 100) : 0;
            return (
              <div key={phase.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">{phase.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{entry?.value ?? 0} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
