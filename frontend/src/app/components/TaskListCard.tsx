import React from "react";
import PlusIcon from "../icons/PlusIcon";
import ShortTaskCard from "./ShortTaskCard";

interface Task {
  title: string;
  description: string;
  dueDate: number;
  priority: "Urgent" | "High" | "Normal" | "Low";
  tag: string;
  assigneeInitial: string;
}

interface TaskListCardProps {
  title: string;
  tasks: Task[];
}

const TaskListCard: React.FC<TaskListCardProps> = ({ title, tasks }) => {
  return (
    <div className="bg-[#E5E7EB] px-4 pt-4 pb-12 h-fit rounded-md">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#374151] text-base">
          {title} <span className="text-[#6B7280] ml-2">{tasks.length}</span>
        </p>
        <div className="cursor-pointer">
          <PlusIcon width={20} height={20} fill="#4B5563" className="mt-1" />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {tasks.map((task, index) => (
          <ShortTaskCard
            key={index}
            title={task.title}
            description={task.description}
            dueDate={task.dueDate}
            priority={task.priority}
            tag={task.tag}
            assigneeInitial={task.assigneeInitial}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskListCard;
