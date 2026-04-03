"use client";

import SidebarItem from "./SidebarItem";
import { ShapeComponents, ShapeType } from "../../shape/types";
import { type DragEvent, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { ImagePlus } from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────
const TILE =
  "group flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 " +
  "bg-gray-800/50 border border-gray-700/40 rounded-xl " +
  "hover:bg-gray-700/60 hover:border-gray-600/60 " +
  "hover:scale-[1.04] hover:shadow-lg active:scale-[0.96] " +
  "transition-all duration-150 select-none";

const TILE_LABEL =
  "text-[9px] font-medium text-gray-500 group-hover:text-gray-300 leading-none transition-colors";

const SECTION_HEADER =
  "text-[9px] font-semibold tracking-[0.14em] text-gray-500 uppercase mb-2";
// ──────────────────────────────────────────────────────────────

const NOTE_COLORS = [
  { label: "Yellow", bg: "#fef9c3" },
  { label: "Blue",   bg: "#dbeafe" },
  { label: "Green",  bg: "#dcfce7" },
  { label: "Pink",   bg: "#fce7f3" },
];

function StickyNoteItem({ color }: { color: { label: string; bg: string } }) {
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/reactflow", "sticky-note");
    e.dataTransfer.setData("sticky-note-color", color.bg);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`${TILE} cursor-grab`}
      title={`${color.label} sticky note`}
    >
      {/* Mini note preview */}
      <div
        style={{
          backgroundColor: color.bg,
          width: 28,
          height: 28,
          borderRadius: 5,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Fold corner */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 8,
            height: 8,
            background: "rgba(0,0,0,0.13)",
            borderTopLeftRadius: 3,
          }}
        />
        {/* Text lines */}
        <div
          style={{
            position: "absolute",
            top: 7,
            left: 4,
            right: 4,
            height: 1.5,
            background: "rgba(0,0,0,0.14)",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 4,
            right: 9,
            height: 1.5,
            background: "rgba(0,0,0,0.10)",
            borderRadius: 1,
          }}
        />
      </div>
      <span className={TILE_LABEL}>{color.label}</span>
    </div>
  );
}

function TableItem() {
  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/reactflow", "table");
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`${TILE} cursor-grab`}
      title="Data Table"
    >
      <svg width={34} height={28} viewBox="0 0 36 30" fill="none">
        <rect x="0.5" y="0.5" width="35" height="29" rx="3" stroke="#4b5563" strokeWidth="1.5" />
        <rect x="0.5" y="0.5" width="35" height="9" rx="3" fill="#3b82f6" fillOpacity="0.4" />
        <line x1="12" y1="0" x2="12" y2="30" stroke="#4b5563" strokeWidth="1" />
        <line x1="24" y1="0" x2="24" y2="30" stroke="#4b5563" strokeWidth="1" />
        <line x1="0" y1="10" x2="36" y2="10" stroke="#4b5563" strokeWidth="1" />
        <line x1="0" y1="20" x2="36" y2="20" stroke="#4b5563" strokeWidth="1" />
      </svg>
      <span className={TILE_LABEL}>Table</span>
    </div>
  );
}

function Sidebar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes, screenToFlowPosition } = useReactFlow();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const width = Math.min(300, img.naturalWidth);
        const height = width / aspectRatio;
        const centerPosition = screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
        const newNode = {
          id: Date.now().toString(),
          type: "image" as const,
          position: centerPosition,
          style: { width, height },
          data: { src, width, height, aspectRatio },
          selected: true,
        };
        setNodes((nodes) =>
          nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
        );
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gray-900 border-r border-gray-800 h-full py-4 px-3 overflow-y-auto scrollbar-hide flex flex-col gap-5">

      {/* ── Shapes ────────────────────────────────────────── */}
      <section>
        <p className={SECTION_HEADER}>Shapes</p>
        <div className="grid grid-cols-3 gap-1.5">
          {Object.keys(ShapeComponents).map((type) => (
            <SidebarItem type={type as ShapeType} key={type} />
          ))}
        </div>
      </section>

      {/* ── Annotations ───────────────────────────────────── */}
      <section>
        <p className={SECTION_HEADER}>Sticky Notes</p>
        <div className="grid grid-cols-2 gap-1.5">
          {NOTE_COLORS.map((c) => (
            <StickyNoteItem key={c.bg} color={c} />
          ))}
        </div>
      </section>

      {/* ── Elements (Table + Image) ───────────────────────── */}
      <section>
        <p className={SECTION_HEADER}>Elements</p>
        <div className="grid grid-cols-2 gap-1.5">
          <TableItem />

          {/* Image upload — same tile style */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`${TILE} cursor-pointer w-full`}
            title="Upload Image"
          >
            <ImagePlus
              size={22}
              className="text-gray-400 group-hover:text-gray-200 transition-colors"
              strokeWidth={1.5}
            />
            <span className={TILE_LABEL}>Image</span>
          </button>
        </div>
      </section>

    </div>
  );
}

export default Sidebar;
