"use client";
import React from "react";

type Priority = "high" | "medium" | "low";

export interface TimelineShortTaskCardProps {
  title: string;
  assignee: string;
  priority: Priority;
}

const barColors: Record<Priority, string> = {
  high:   "border-pink-500  bg-pink-100/70   dark:bg-pink-900/30   text-pink-900   dark:text-pink-100",
  medium: "border-yellow-400 bg-yellow-100/70 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100",
  low:    "border-blue-400  bg-blue-100/70   dark:bg-blue-900/30   text-blue-900   dark:text-blue-100",
};

const TimelineShortTaskCard: React.FC<TimelineShortTaskCardProps> = ({
  title,
  assignee,
  priority,
}) => {
  const initials = assignee
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      title={`${title} · ${assignee}`}
      className={`flex items-center h-full w-full border-l-4 rounded-md px-2 gap-1.5 overflow-hidden cursor-default select-none transition-all hover:brightness-95 hover:shadow-md ${barColors[priority]}`}
    >
      <span className="text-xs font-semibold truncate flex-1 leading-none">
        {title}
      </span>
      <span className="ml-auto shrink-0 text-[10px] font-bold bg-white/50 dark:bg-black/20 rounded-full w-5 h-5 flex items-center justify-center leading-none">
        {initials}
      </span>
    </div>
  );
};

export default TimelineShortTaskCard;
