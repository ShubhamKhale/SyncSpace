// import React from 'react';

// type Priority = 'high' | 'medium' | 'low';

// interface TimelineShortTaskCardProps {
//   title: string;
//   startDate: string;
//   endDate: string;
//   assignee: string;
//   priority: Priority;
//   category?: string;
//   stage: string;
//   tags: string[];
//   comments: number;
//   attachments: number;
//   flagged: boolean;
// }

// const priorityColors: Record<Priority, string> = {
//   high: 'bg-pink-400/30',
//   medium: 'bg-yellow-300/30',
//   low: 'bg-blue-300/30',
// };

// const TimelineShortTaskCard: React.FC<TimelineShortTaskCardProps> = ({
//   title,
//   startDate,
//   endDate,
//   assignee,
//   priority,
//   category,
// }) => {
//   return (
//     <div
//       className={`rounded-lg shadow-md p-4 text-sm text-gray-800 ${priorityColors[priority]} w-fit`}
//     >
//       <div className="font-semibold">{title}</div>
//       <div className="text-xs text-gray-700">
//         {startDate} → {endDate}
//       </div>
//       <div className="mt-1 text-xs">👤 {assignee}</div>
//       {category && <div className="text-xs italic">📁 {category}</div>}
//       <div className="mt-2 text-xs font-medium uppercase tracking-wide">
//         Priority: {priority}
//       </div>
//     </div>
//   );
// };

// export default TimelineShortTaskCard;


import React from "react";

type Priority = "high" | "medium" | "low";

interface TimelineShortTaskCardProps {
  title: string;
  startDate: string;
  endDate: string;
  assignee: string;
  priority: Priority;
  category?: string;
  stage: string;
  tags: string[];
  comments: number;
  attachments: number;
  flagged: boolean;
}

const priorityColors: Record<Priority, string> = {
  high: "border-pink-500 bg-pink-100/40",
  medium: "border-yellow-400 bg-yellow-100/40",
  low: "border-blue-400 bg-blue-100/40",
};

const TimelineShortTaskCard: React.FC<TimelineShortTaskCardProps> = ({
  title,
  startDate,
  endDate,
  assignee,
  priority,
  category,
}) => {
  const start = new Date(startDate);
  const month = start.toLocaleString("default", { month: "short" });
  const day = start.getDate();

  return (
    <div
      className={`flex items-center border-l-4 ${priorityColors[priority]} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-[260px]`}
    >
      {/* Date Section */}
      <div className="flex flex-col items-center justify-center bg-white text-gray-800 px-3 py-2 border-r border-gray-200 rounded-l-lg">
        <div className="text-xs font-semibold text-gray-500 uppercase">
          {month}
        </div>
        <div className="text-lg font-bold text-gray-900">{day}</div>
      </div>

      {/* Details Section */}
      <div className="flex-1 px-3 py-2">
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="text-xs text-gray-500">
          {startDate} → {endDate}
        </div>
        <div className="mt-1 text-xs text-gray-700 flex items-center gap-1">
          👤 {assignee}
        </div>
        {category && (
          <div className="text-[11px] italic text-gray-600 mt-0.5">
            📁 {category}
          </div>
        )}
        <div className="mt-2 text-[11px] uppercase tracking-wide font-medium text-gray-600">
          {priority} priority
        </div>
      </div>
    </div>
  );
};

export default TimelineShortTaskCard;
