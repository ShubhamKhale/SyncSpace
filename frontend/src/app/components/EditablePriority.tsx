import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

type Priority = "high" | "medium" | "low";

interface EditablePriorityProps {
  value: Priority;
  onSave: (value: Priority) => Promise<void>;
  saveState?: "idle" | "loading" | "success" | "error";
  disabled?: boolean;
}

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-100 text-red-700" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  low: { label: "Low", color: "bg-green-100 text-green-700" },
};

export const EditablePriority: React.FC<EditablePriorityProps> = ({
  value,
  onSave,
  saveState = "idle",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (priority: Priority) => {
    if (priority === value) {
      setIsOpen(false);
      return;
    }
    try {
      await onSave(priority);
      setIsOpen(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
          priorityConfig[value].color
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:opacity-80 cursor-pointer"
        }`}
      >
        <span className="text-sm font-medium">{priorityConfig[value].label}</span>
        {saveState === "loading" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-10">
          {(["high", "medium", "low"] as Priority[]).map((priority) => (
            <button
              key={priority}
              onClick={() => handleSelect(priority)}
              disabled={saveState === "loading"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-slate-200 disabled:opacity-50 ${
                priority === value ? "bg-blue-50 dark:bg-blue-900/30" : ""
              }`}
            >
              {priorityConfig[priority].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
