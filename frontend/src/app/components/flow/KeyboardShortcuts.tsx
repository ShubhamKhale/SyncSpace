"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

const shortcuts = [
  { keys: ["Ctrl", "C"], action: "Copy selected nodes" },
  { keys: ["Ctrl", "V"], action: "Paste" },
  { keys: ["Ctrl", "Z"], action: "Undo" },
  { keys: ["Ctrl", "Shift", "Z"], action: "Redo" },
  { keys: ["Ctrl", "A"], action: "Select all" },
  { keys: ["Delete"], action: "Delete selected" },
  { keys: ["Shift", "F"], action: "Zoom to fit selection" },
  { keys: ["G"], action: "Group selected nodes (2+)" },
  { keys: ["Space", "+ drag"], action: "Free-draw connection line" },
  { keys: ["Ctrl", "/"], action: "Show / hide this panel" },
  { keys: ["Esc"], action: "Close this panel" },
];

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export default function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-4 space-y-2.5 overflow-y-auto">
          {shortcuts.map(({ keys, action }) => (
            <div key={action} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && k !== "+ drag" && <span className="text-gray-400 text-xs">+</span>}
                    {k === "+ drag" ? (
                      <span className="text-xs text-gray-400">{k}</span>
                    ) : (
                      <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-gray-700 dark:text-gray-300">
                        {k}
                      </kbd>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-600">
          On Mac, use ⌘ instead of Ctrl
        </div>
      </div>
    </div>
  );
}
