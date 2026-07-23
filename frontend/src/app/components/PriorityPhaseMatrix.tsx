"use client";
import React from "react";
import { Zap } from "lucide-react";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";

const PRIORITIES = ["high", "medium", "low"] as const;
const STAGES     = ["Planning", "Design", "Development", "QA", "Deployment"] as const;

const PRIORITY_META: Record<string, { label: string; color: string; totalColor: string; cellBg: string }> = {
  high:   { label: "High",   color: "text-red-500",    totalColor: "text-red-500",    cellBg: "border-red-200    dark:border-red-900/50    bg-red-50    dark:bg-red-900/20"    },
  medium: { label: "Medium", color: "text-orange-500", totalColor: "text-orange-400", cellBg: "border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20" },
  low:    { label: "Low",    color: "text-green-500",  totalColor: "text-green-400",  cellBg: "border-green-200  dark:border-green-900/50  bg-green-50  dark:bg-green-900/20"  },
};

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const PriorityPhaseMatrix: React.FC = () => {
  const { tasks } = useBoardTaskStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-slate-100">
        Priority-Phase Matrix
      </h2>

      <div className="overflow-x-auto scrollbar-hide">
        <div
          className="min-w-[700px] grid gap-3 text-center text-sm font-medium"
          style={{ gridTemplateColumns: `140px repeat(${STAGES.length}, minmax(100px,1fr)) 72px` }}
        >
          {/* Header */}
          <div />
          {STAGES.map((s) => (
            <div key={s} className="text-gray-700 dark:text-slate-300 pb-1">{s}</div>
          ))}
          <div className="text-gray-700 dark:text-slate-300 pb-1">Total</div>

          {/* Rows */}
          {PRIORITIES.map((priority) => {
            const meta = PRIORITY_META[priority];
            const rowTasks = tasks.filter((t) => (t.priority ?? "medium").toLowerCase() === priority);
            const rowTotal = rowTasks.length;

            return (
              <React.Fragment key={priority}>
                {/* Priority label */}
                <div className={`flex items-center justify-end pr-3 gap-1.5 ${meta.color}`}>
                  <Zap size={14} className="shrink-0" />
                  <span className="font-semibold">{meta.label}</span>
                </div>

                {/* Stage cells */}
                {STAGES.map((stage) => {
                  const cellTasks = rowTasks.filter((t) => t.stage === stage);
                  return (
                    <div
                      key={stage}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${meta.cellBg}`}
                    >
                      <span className="text-lg font-semibold text-gray-700 dark:text-slate-200">
                        {cellTasks.length}
                      </span>
                      {cellTasks.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1">
                          {cellTasks.map((t) => (
                            <div
                              key={t.id}
                              title={`${t.title}${t.assignee ? ` · ${t.assignee}` : ""}`}
                              className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 shadow-sm rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 dark:text-slate-200"
                            >
                              {initials(t.assignee) || t.title.slice(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Row total */}
                <div className={`flex items-center justify-center font-bold text-base ${meta.totalColor}`}>
                  {rowTotal}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PriorityPhaseMatrix;
