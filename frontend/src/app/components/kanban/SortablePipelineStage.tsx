"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  name: string;
  topBorderClass: string;
  count: number;
}

export function SortablePipelineStage({ name, topBorderClass, count }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: name });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className={`cursor-grab active:cursor-grabbing select-none bg-slate-50 dark:bg-slate-900/40 rounded-lg border-t-2 ${topBorderClass} px-4 py-3 min-w-[110px]`}
      {...attributes}
      {...listeners}
    >
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count}</p>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">
        {name}
      </p>
    </div>
  );
}
