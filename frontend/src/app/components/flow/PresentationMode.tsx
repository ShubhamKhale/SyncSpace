"use client";

import { Node } from "@xyflow/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

interface PresentationModeProps {
  slides: Node[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

function getSlidePreview(node: Node): string | null {
  const text = (node.data as Record<string, unknown>)?.text;
  if (typeof text === "string" && text.trim().length > 0) {
    const trimmed = text.trim();
    return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed;
  }
  if (node.type === "image") return "Image";
  if (node.type === "table") return "Table";
  return null;
}

export function PresentationMode({
  slides,
  currentIndex,
  onNext,
  onPrev,
  onExit,
}: PresentationModeProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onExit]);

  const total = slides.length;
  const currentNode = slides[currentIndex];
  const preview = currentNode ? getSlidePreview(currentNode) : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  const btnBase =
    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg " +
    "transition-colors disabled:opacity-40 disabled:cursor-not-allowed " +
    "enabled:hover:bg-gray-700 text-gray-100 hover:cursor-pointer";

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1.5 pointer-events-none"
    >
      {/* Text preview subtitle */}
      {preview && (
        <div className="pointer-events-auto bg-gray-900/90 backdrop-blur text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-700/60 max-w-xs truncate">
          {preview}
        </div>
      )}

      {/* Main control bar */}
      <div
        className="pointer-events-auto flex items-center bg-gray-900 border border-gray-700 rounded-xl shadow-2xl px-1 py-1 gap-0.5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Prev */}
        <button
          className={btnBase}
          onClick={onPrev}
          disabled={isFirst}
          title="Previous (←)"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Counter */}
        <div className="px-3 py-2 text-sm font-semibold text-gray-100 tabular-nums min-w-[64px] text-center select-none">
          {currentIndex + 1} / {total}
        </div>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Next */}
        <button
          className={btnBase}
          onClick={onNext}
          disabled={isLast}
          title="Next (→)"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Exit */}
        <button
          className={`${btnBase} text-red-400 hover:text-red-300 hover:!bg-red-900/30`}
          onClick={onExit}
          title="Exit presentation (Esc)"
        >
          <X size={16} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </div>
  );
}
