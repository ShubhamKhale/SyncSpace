"use client";
import dynamic from "next/dynamic";
const TaskListCard = dynamic(() => import("@/app/components/TaskListCard"), {
  ssr: false,
});
import PlusIcon from "@/app/icons/PlusIcon";
import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useTaskStore } from "@/app/store/useTaskStore";   

const Page = () => {
  const { taskLists, moveTask } = useTaskStore();
    
    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    moveTask(
      active.id as string,
      over.id as string,
      activeContainer,
      overContainer    
    );
  };
    
  return (
    <div className="bg-[var(--tertiary-background-color)] min-h-screen">
      <div className="flex items-center justify-between bg-white pl-8 pr-16 py-6 border-b border-b-[var(--sidebar-border-color)]">
        <p className="text-xl font-semibold text-[var(--sixth-text-color)]">
          Product Roadmap    
        </p>
        <button className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
          <PlusIcon width={24} height={24} className="mt-2" />
          <p>Add Task</p>
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="px-8 py-8 grid grid-cols-3 gap-6">
          {taskLists.map((list) => (
            <TaskListCard
              key={list.title}
              id={list.title}
              title={list.title}
              tasks={list.tasks}
            />
          ))}
        </div>
      </DndContext>

    </div>
  );
};   

export default Page;
