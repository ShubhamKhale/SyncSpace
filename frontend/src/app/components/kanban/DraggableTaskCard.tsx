"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Flag, MessageSquare, Paperclip } from "lucide-react";
import { EditableText } from "@/app/components/EditableText";
import { EditableDate } from "@/app/components/EditableDate";
import { EditablePriority } from "@/app/components/EditablePriority";
import { EditableAssignee } from "@/app/components/EditableAssignee";
import type { BoardTask, Priority } from "@/app/store/useBoardTaskStore";
import type { EditPermissions } from "@/app/hooks/useEditMode";

interface Props {
  task: BoardTask;
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;
  permissions: EditPermissions;
  updateTaskTitle: (id: string, title: string) => Promise<void>;
  updateTaskPriority: (id: string, priority: Priority) => Promise<void>;
  updateTaskDates: (id: string, start: string, end: string) => Promise<void>;
  updateTaskAssignee: (id: string, assignee: string) => Promise<void>;
  isDraggingOverlay?: boolean;
}

export function DraggableTaskCard({
  task,
  saveStates,
  permissions,
  updateTaskTitle,
  updateTaskPriority,
  updateTaskDates,
  updateTaskAssignee,
  isDraggingOverlay = false,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: isDraggingOverlay,
  });

  return (
    <div
      ref={isDraggingOverlay ? undefined : setNodeRef}
      {...(isDraggingOverlay ? {} : { ...listeners, ...attributes })}
      className={`bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600
        rounded-md p-3 mb-3 shadow-sm hover:shadow-md hover:border-slate-300
        dark:hover:border-slate-500 transition group cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-40" : ""}
        ${isDraggingOverlay ? "shadow-2xl rotate-1 scale-105 ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
    >
      {/* Editable Title */}
      <div className="mb-2">
        <EditableText
          value={task.title}
          onSave={(title) => updateTaskTitle(task.id, title)}
          placeholder="Task title"
          className="text-sm font-medium text-slate-800 dark:text-slate-100"
          saveState={saveStates[`${task.id}-title`]}
          disabled={!permissions.canEditTasks || isDraggingOverlay}
        />
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags.map((tag, tIdx) => (
          <span
            key={tIdx}
            className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Task Meta Section */}
      <div className="space-y-2 mb-2">
        {/* Dates */}
        <div className="flex items-center justify-between text-xs">
          <EditableDate
            value={task.startDate}
            onSave={(startDate) => updateTaskDates(task.id, startDate, task.endDate)}
            saveState={saveStates[`${task.id}-dates`]}
            disabled={!permissions.canEditTasks || isDraggingOverlay}
          />
          <span className="text-gray-400 dark:text-slate-500">to</span>
          <EditableDate
            value={task.endDate}
            onSave={(endDate) => updateTaskDates(task.id, task.startDate, endDate)}
            saveState={saveStates[`${task.id}-dates`]}
            disabled={!permissions.canEditTasks || isDraggingOverlay}
          />
        </div>

        {/* Priority & Assignee */}
        <div className="flex items-center justify-between gap-2">
          <EditablePriority
            value={task.priority}
            onSave={(priority) => updateTaskPriority(task.id, priority)}
            saveState={saveStates[`${task.id}-priority`]}
            disabled={!permissions.canEditTasks || isDraggingOverlay}
          />
          <EditableAssignee
            value={task.assignee}
            onSave={(assignee) => updateTaskAssignee(task.id, assignee)}
            saveState={saveStates[`${task.id}-assignee`]}
            disabled={!permissions.canEditTasks || isDraggingOverlay}
          />
        </div>
      </div>

      {/* Comments and Attachments */}
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-1">
          {task.flagged && <Flag size={14} className="text-red-500" />}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:cursor-pointer">
            <MessageSquare size={14} />
            <span>{task.comments}</span>
          </div>
          <div className="flex items-center gap-1 hover:cursor-pointer">
            <Paperclip size={14} />
            <span>{task.attachments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
