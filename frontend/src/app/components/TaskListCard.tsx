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
import { motion, AnimatePresence } from "framer-motion";
import TaskDetail from "./TaskDetail";
import { Task } from "../store/useTaskStore";


interface TaskListCardProps {
  id: string;
  title: string;
  tasks: Task[];   
}

const TaskListCard: React.FC<TaskListCardProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  const setSelectedTask = useGlobalTaskStore((state) => state.setSelectedTask);
  const selectedTask = useGlobalTaskStore((state) => state.selectedTask);
  const setSelectedTaskListTitle = useGlobalTaskStore((state) => state.setSelectedTaskListTitle)

  const handleTaskClick = (task: Task, taskListTitle: string) => {
    setSelectedTaskListTitle(taskListTitle)
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
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mt-4 space-y-3">
          {tasks.map((task) => (
            <ShortTaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              dueDate={task.dueDate}
              priority={task.priority}
              tag={task.tag}
              assigneeInitial={task.assigneeInitial}
              onOpenDetail={() => {
                handleTaskClick(task, title);
              }}
            />
          ))}
        </div>
      </SortableContext>

      {/* <AnimatePresence>
        <TaskDetail />
      </AnimatePresence> */}

      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}   
              onClick={() => setSelectedTask(null)}
            />
            <TaskDetail />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskListCard;
