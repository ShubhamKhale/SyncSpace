"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight } from "lucide-react";

interface Props {
  name: string;
  color: string;
  count: number;
  isLast: boolean;
}

export function SortablePipelineStage({ name, color, count, isLast }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: name });

  return (
    <div className="flex items-center">
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0 : 1,
        }}
        className="flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
        {...attributes}
        {...listeners}
      >
        <div
          className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center font-semibold shadow-md`}
        >
          {count}
        </div>
        <span className="text-xs mt-2 text-gray-600 dark:text-slate-300 font-medium">
          {name}
        </span>
      </div>
      {!isLast && <ArrowRight size={20} className="text-gray-400 mx-2 flex-shrink-0" />}
    </div>
  );
}
