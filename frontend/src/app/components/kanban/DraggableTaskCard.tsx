"use client";
import React, { useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Flag, Maximize2, MessageSquare, Paperclip } from "lucide-react";
import { EditableText } from "@/app/components/EditableText";
import { EditableDate } from "@/app/components/EditableDate";
import { EditablePriority } from "@/app/components/EditablePriority";
import { EditableAssignee } from "@/app/components/EditableAssignee";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";
import type { BoardTask, Priority } from "@/app/store/useBoardTaskStore";
import type { EditPermissions } from "@/app/hooks/useEditMode";

interface Props {
  task: BoardTask;
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;
  permissions: EditPermissions;
  updateTaskTitle: (id: string, title: string) => Promise<void>;
  updateTaskPriority: (id: string, priority: Priority) => Promise<void>;
  updateTaskDates: (id: string, start: string, end: string) => Promise<void>;
  updateTaskAssignee: (id: string, assigneeId: string) => Promise<void>;
  /** Opens the full task detail/edit modal. */
  onOpen?: (task: BoardTask) => void;
  isDraggingOverlay?: boolean;
}

/** Wraps an inline editor so clicks on it edit in place instead of opening the modal. */
const InlineEdit = ({ children }: { children: React.ReactNode }) => (
  <div data-inline-edit>{children}</div>
);

export function DraggableTaskCard({
  task,
  saveStates,
  permissions,
  updateTaskTitle,
  updateTaskPriority,
  updateTaskDates,
  updateTaskAssignee,
  onOpen,
  isDraggingOverlay = false,
}: Props) {
  const members = useBoardTaskStore((s) => s.members);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: isDraggingOverlay || !permissions.canReorderTasks,
  });

  // A drag ends with a click on the card; remember where the pointer went
  // down so a drag release isn't mistaken for "open".
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    if (!onOpen || isDraggingOverlay) return;
    if ((e.target as HTMLElement).closest("[data-inline-edit]")) return;
    const d = downAt.current;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) return;
    onOpen(task);
  };

  return (
    <div
      ref={isDraggingOverlay ? undefined : setNodeRef}
      {...(isDraggingOverlay ? {} : { ...listeners, ...attributes })}
      onPointerDownCapture={(e) => { downAt.current = { x: e.clientX, y: e.clientY }; }}
      onClick={handleClick}
      className={`relative bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600
        rounded-md p-3 mb-3 shadow-sm hover:shadow-md hover:border-slate-300
        dark:hover:border-slate-500 transition group
        ${permissions.canReorderTasks ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${isDragging ? "opacity-40" : ""}
        ${isDraggingOverlay ? "shadow-2xl rotate-1 scale-105 ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
    >
      {onOpen && !isDraggingOverlay && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen(task); }}
          title="Open task"
          aria-label="Open task details"
          className="absolute top-2 right-2 p-1 rounded text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
        >
          <Maximize2 size={13} />
        </button>
      )}

      {/* Editable Title */}
      <div className="mb-2 pr-6" data-inline-edit>
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
          <InlineEdit>
            <EditableDate
              value={task.startDate}
              onSave={(startDate) => updateTaskDates(task.id, startDate, task.endDate)}
              saveState={saveStates[`${task.id}-dates`]}
              disabled={!permissions.canEditTasks || isDraggingOverlay}
            />
          </InlineEdit>
          <span className="text-gray-400 dark:text-slate-500">to</span>
          <InlineEdit>
            <EditableDate
              value={task.endDate}
              onSave={(endDate) => updateTaskDates(task.id, task.startDate, endDate)}
              saveState={saveStates[`${task.id}-dates`]}
              disabled={!permissions.canEditTasks || isDraggingOverlay}
            />
          </InlineEdit>
        </div>

        {/* Priority & Assignee */}
        <div className="flex items-center justify-between gap-2">
          <InlineEdit>
            <EditablePriority
              value={task.priority}
              onSave={(priority) => updateTaskPriority(task.id, priority)}
              saveState={saveStates[`${task.id}-priority`]}
              disabled={!permissions.canEditTasks || isDraggingOverlay}
            />
          </InlineEdit>
          <InlineEdit>
            <EditableAssignee
              value={task.assigneeId}
              options={members}
              onSave={(assigneeId) => updateTaskAssignee(task.id, assigneeId)}
              saveState={saveStates[`${task.id}-assignee`]}
              disabled={!permissions.canEditTasks || isDraggingOverlay}
            />
          </InlineEdit>
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
