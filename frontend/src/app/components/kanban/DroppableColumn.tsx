"use client";
import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string;
  children: React.ReactNode;
  isEmpty: boolean;
  header: React.ReactNode;
}

export function DroppableColumn({ id, children, isEmpty, header }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`h-fit rounded-lg p-4 w-full shadow-sm border transition-colors ${
        isOver
          ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-slate-700"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      }`}
    >
      {header}
      {children}
      {isEmpty && (
        <p
          className={`text-xs italic min-h-[40px] flex items-center ${
            isOver ? "text-blue-400 dark:text-blue-300" : "text-slate-400"
          }`}
        >
          {isOver ? "Drop here" : "No tasks yet"}
        </p>
      )}
    </div>
  );
}
