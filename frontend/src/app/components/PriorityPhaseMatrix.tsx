"use client";
import React from "react";

interface Task {
  initials: string;
}

interface Phase {
  name: string;
  tasks: Task[];
}

interface PriorityRow {
  level: "High" | "Medium" | "Low";
  color: string; // text color
  borderColor: string; // accent border color
  totalColor: string; // total number color
  phases: Phase[];
}

const data: PriorityRow[] = [
  {
    level: "High",
    color: "text-red-600",
    borderColor: "border-red-200 bg-red-50",
    totalColor: "text-red-500",
    phases: [
      { name: "Planning", tasks: [{ initials: "M" }, { initials: "P" }] },
      { name: "Design", tasks: [{ initials: "U" }] },
      { name: "Development", tasks: [{ initials: "A" }, { initials: "S" }] },
      { name: "QA", tasks: [{ initials: "Ir" }] },
    ],
  },
  {
    level: "Medium",
    color: "text-orange-500",
    borderColor: "border-orange-200 bg-orange-50",
    totalColor: "text-orange-400",
    phases: [
      { name: "Planning", tasks: [{ initials: "C" }] },
      { name: "Design", tasks: [{ initials: "W" }] },
      { name: "Development", tasks: [{ initials: "D" }] },
      { name: "QA", tasks: [{ initials: "U" }] },
    ],
  },
  {
    level: "Low",
    color: "text-green-500",
    borderColor: "border-green-200 bg-green-50",
    totalColor: "text-green-400",
    phases: [
      { name: "Planning", tasks: [{ initials: "M" }] },
      { name: "Design", tasks: [{ initials: "U" }] },
      { name: "Development", tasks: [{ initials: "A" }] },
      { name: "QA", tasks: [{ initials: "Ir" }] },
    ],
  },
];

const PriorityPhaseMatrix: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        Priority-Phase Matrix
      </h2>

      <div className="grid grid-cols-[120px_repeat(4,minmax(120px,1fr))_80px] gap-3 text-center text-sm font-medium">
        {/* Header Row */}
        <div></div>
        {["Planning", "Design", "Development", "QA"].map((phase) => (
          <div key={phase} className="text-gray-700">
            {phase}
          </div>
        ))}
        <div className="text-gray-700">Total</div>

        {/* Data Rows */}
        {data.map((priority) => (
          <React.Fragment key={priority.level}>
            {/* Priority Label */}
            <div className={`flex items-center justify-end pr-2 ${priority.color}`}>
              <span className="font-semibold flex items-center gap-1">
                <span>⚡</span> {priority.level}
              </span>
            </div>

            {/* Phases */}
            {priority.phases.map((phase) => (
              <div
                key={phase.name}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${priority.borderColor}`}
              >
                <div className="text-lg font-semibold text-gray-700">
                  {phase.tasks.length}
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {phase.tasks.map((task, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 shadow-sm rounded-md px-2 py-1 text-xs font-medium text-gray-700"
                    >
                      {task.initials}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className={`flex items-center justify-center font-semibold ${priority.totalColor}`}>
              {priority.phases.reduce((sum, p) => sum + p.tasks.length, 0)}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PriorityPhaseMatrix;
