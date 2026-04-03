import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2, User } from "lucide-react";

interface EditableAssigneeProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  options?: string[];
  saveState?: "idle" | "loading" | "success" | "error";
  disabled?: boolean;
}

export const EditableAssignee: React.FC<EditableAssigneeProps> = ({
  value,
  onSave,
  options = ["Alex Kim", "John Doe", "Jane Smith", "Bob Johnson", "Alice Lee"],
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

  const handleSelect = async (assignee: string) => {
    if (assignee === value) {
      setIsOpen(false);
      return;
    }
    try {
      await onSave(assignee);
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
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer"
        } bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-200`}
      >
        <User size={14} />
        <span className="text-sm font-medium truncate max-w-[100px]">{value}</span>
        {saveState === "loading" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-10 w-max">
          {options.map((assignee) => (
            <button
              key={assignee}
              onClick={() => handleSelect(assignee)}
              disabled={saveState === "loading"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-slate-200 disabled:opacity-50 ${
                assignee === value ? "bg-blue-50 dark:bg-blue-900/30" : ""
              }`}
            >
              {assignee}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
