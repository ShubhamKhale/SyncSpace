"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { ArrowLeft, Plus } from "lucide-react";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";
import type { BoardTask } from "@/app/store/useBoardTaskStore";
import { useBoardStore } from "@/app/store/useBoardStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import TaskModal from "@/app/components/TaskModal";

const STAGES = ["Planning", "Design", "Development", "QA", "Deployment"];

const STAGE_ACCENT: Record<string, { bar: string; badge: string; icon: string }> = {
  Planning:    { bar: "bg-purple-500", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300", icon: "🗂️" },
  Design:      { bar: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",     icon: "🎨" },
  Development: { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", icon: "💻" },
  QA:          { bar: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: "✅" },
  Deployment:  { bar: "bg-teal-500",   badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",     icon: "🚀" },
};

const PRIORITY_BADGE: Record<string, string> = {
  high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function TasksPage() {
  const params = useParams<{ boardid: string }>();
  const boardId = params?.boardid;
  const router = useRouter();

  const { tasks, loading, fetchTasks, updateTaskStage } = useBoardTaskStore();
  const { board, fetchBoard } = useBoardStore();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  // Snapshot so the modal keeps its task while an optimistic delete removes it from the store.
  const [openTask, setOpenTask] = useState<BoardTask | null>(null);
  const { canEditTasks } = useEditMode();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (boardId) {
      fetchTasks(boardId);
      fetchBoard(boardId);
    }
  }, [boardId, fetchTasks, fetchBoard]);

  const tasksByStage = (stage: string) => tasks.filter((t) => t.stage === stage);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const task = tasks.find((t) => t.id === active.id);
    const targetStage = over.id as string;
    if (task && STAGES.includes(targetStage) && task.stage !== targetStage) {
      updateTaskStage(task.id, targetStage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 pl-6 pr-8 py-4 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-[#F8F9FC] dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {board?.title ?? "Board Tasks"}
          </h1>
        </div>
        {canEditTasks && (
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} boardName={board?.title} boardId={boardId} />
      <TaskModal isOpen={!!openTask} onClose={() => setOpenTask(null)} boardName={board?.title} boardId={boardId} task={openTask} />

      {/* Kanban board */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading tasks…</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="px-6 py-6 grid grid-cols-3 gap-5 auto-rows-min">
            {STAGES.map((stage) => {
              const stageTasks = tasksByStage(stage);
              const accent = STAGE_ACCENT[stage] ?? { bar: "bg-slate-400", badge: "bg-[#F8F9FC] text-slate-600", icon: "📋" };
              return (
                <div
                  key={stage}
                  id={stage}
                  className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Colored top bar */}
                  <div className={`h-1 w-full ${accent.bar}`} />

                  {/* Card header */}
                  <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-base leading-none">{accent.icon}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1">{stage}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${accent.badge}`}>
                      {stageTasks.length}
                    </span>
                  </div>

                  {/* Task list */}
                  <div className="flex flex-col gap-2 p-3 flex-1">
                    {stageTasks.map((task) => (
                      <button
                        type="button"
                        key={task.id}
                        onClick={() => setOpenTask(task)}
                        className="w-full text-left bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-100 dark:border-slate-600 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition cursor-pointer group"
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug mb-2.5">
                          {task.title}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium}`}>
                            {task.priority}
                          </span>
                          {task.endDate && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                              {new Date(task.endDate).toLocaleDateString("en-GB")}
                            </span>
                          )}
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">
                                {task.assignee[0]}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{task.assignee}</p>
                          </div>
                        )}
                      </button>
                    ))}

                    {/* Empty state */}
                    {stageTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-slate-300 dark:text-slate-600">
                        <span className="text-2xl mb-1">📭</span>
                        <p className="text-xs">No tasks yet</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
