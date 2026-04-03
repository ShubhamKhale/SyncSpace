"use client";

import { type DragEvent, useRef } from "react";
import { ShapeType } from "../../shape/types";
import Shape from "../../shape";

const SHAPE_LABELS: Record<string, string> = {
  circle: "Circle",
  "round-rectangle": "Rounded",
  rectangle: "Rect",
  hexagon: "Hexagon",
  diamond: "Diamond",
  "arrow-rectangle": "Arrow",
  cylinder: "Cylinder",
  triangle: "Triangle",
  parallelogram: "Para",
};

type SidebarItemProps = {
  type: ShapeType;
};

function SidebarItem({ type }: SidebarItemProps) {
  const dragImageRef = useRef<HTMLDivElement>(null);

  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer?.setData("application/reactflow", type);
    if (dragImageRef.current) {
      event.dataTransfer.setDragImage(dragImageRef.current, 30, 30);
    }
  };

  const label = SHAPE_LABELS[type] ?? type;

  return (
    <div
      className="group relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 bg-gray-800/50 border border-gray-700/40 rounded-xl hover:bg-gray-700/60 hover:border-gray-600/60 hover:scale-[1.04] hover:shadow-lg active:scale-[0.96] cursor-grab transition-all duration-150 select-none"
      draggable
      onDragStart={onDragStart}
      title={label}
    >
      <Shape
        type={type}
        width={34}
        height={34}
        fill="#3b82f6"
        fillOpacity={0.75}
        stroke="#60a5fa"
        strokeWidth={1.5}
      />
      <span className="text-[9px] font-medium text-gray-500 group-hover:text-gray-300 leading-none transition-colors truncate max-w-full px-0.5">
        {label}
      </span>

      {/* Off-screen drag preview at full size */}
      <div
        ref={dragImageRef}
        style={{ position: "fixed", top: -9999, left: -9999, pointerEvents: "none" }}
      >
        <Shape
          type={type}
          width={64}
          height={64}
          fill="#3b82f6"
          fillOpacity={0.85}
          stroke="#60a5fa"
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

export default SidebarItem;
