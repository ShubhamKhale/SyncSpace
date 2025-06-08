"use client";
import React from "react";
import PlusIcon from "../icons/PlusIcon";
import dynamic from "next/dynamic";
const ShortTaskCard = dynamic(() => import("./ShortTaskCard"), {
  ssr: false,
});
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useGlobalTaskStore } from "../store/globalTaskStore";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  priority: "Urgent" | "High" | "Normal" | "Low";
  tag: string;
  assigneeInitial: string;
}

interface TaskListCardProps {
  id: string;
  title: string;
  tasks: Task[];
}

const TaskListCard: React.FC<TaskListCardProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  const setSelectedTask = useGlobalTaskStore((state) => state.setSelectedTask); // ✅ Access setter

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-[#E5E7EB] px-4 pt-4 pb-12 h-fit rounded-md"
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#374151] text-base">
          {title} <span className="text-[#6B7280] ml-2">{tasks.length}</span>
        </p>
        <div className="cursor-pointer">
          <PlusIcon width={20} height={20} fill="#4B5563" className="mt-1" />
        </div>
      </div>

      <SortableContext
        id={id}
        items={tasks.map((task) => task.id)} // ✅ use unique id
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => {
                console.log("task clicked!!!!", task);
                handleTaskClick(task);
              }}   
            >
              <ShortTaskCard    
                id={task.id}       
                title={task.title}
                description={task.description}
                dueDate={task.dueDate}
                priority={task.priority}
                tag={task.tag}
                assigneeInitial={task.assigneeInitial}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default TaskListCard;
