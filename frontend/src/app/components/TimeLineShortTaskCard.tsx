import React from 'react';

type Priority = 'high' | 'medium' | 'low';

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
  high: 'bg-pink-400/30',
  medium: 'bg-yellow-300/30',
  low: 'bg-blue-300/30',
};

const TimelineShortTaskCard: React.FC<TimelineShortTaskCardProps> = ({
  title,
  startDate,
  endDate,
  assignee,
  priority,
  category,
}) => {
  return (
    <div
      className={`rounded-lg shadow-md p-4 text-sm text-gray-800 ${priorityColors[priority]} w-fit`}
    >
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-700">
        {startDate} → {endDate}
      </div>
      <div className="mt-1 text-xs">👤 {assignee}</div>
      {category && <div className="text-xs italic">📁 {category}</div>}
      <div className="mt-2 text-xs font-medium uppercase tracking-wide">
        Priority: {priority}
      </div>
    </div>
  );
};

export default TimelineShortTaskCard;
