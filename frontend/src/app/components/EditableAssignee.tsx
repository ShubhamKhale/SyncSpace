import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2, User } from "lucide-react";
import type { AttendanceStatus } from "@/app/store/useAttendanceStore";

export interface AssigneeOption {
  id: string;
  name: string;
  availability?: AttendanceStatus | null;
}

interface EditableAssigneeProps {
  /** Selected assignee's user ID ("" = unassigned). */
  value: string;
  onSave: (value: string) => Promise<void>;
  options: AssigneeOption[];
  saveState?: "idle" | "loading" | "success" | "error";
  disabled?: boolean;
}

const STATUS_DOT: Record<AttendanceStatus, string> = {
  checked_in:  "bg-emerald-500",
  on_leave:    "bg-orange-500",
  checked_out: "bg-slate-400",
  absent:      "bg-slate-400",
};

function AvailabilityDot({ status }: { status: AttendanceStatus }) {
  return (
    <span
      title={status === "checked_in" ? "Checked in" : status === "absent" ? "Not in yet" : "Checked out"}
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`}
    />
  );
}

const UNASSIGNED: AssigneeOption = { id: "", name: "Unassigned" };

export const EditableAssignee: React.FC<EditableAssigneeProps> = ({
  value,
  onSave,
  options,
  saveState = "idle",
  disabled = false,
}) => {
  const allOptions = [UNASSIGNED, ...options];
  const label = options.find((o) => o.id === value)?.name ?? UNASSIGNED.name;
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
        <span className="text-sm font-medium truncate max-w-[100px]">{label}</span>
        {saveState === "loading" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg z-10 w-max">
          {allOptions.map((opt) => (
            <button
              key={opt.id || "unassigned"}
              onClick={() => handleSelect(opt.id)}
              disabled={saveState === "loading"}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-slate-200 disabled:opacity-50 flex items-center gap-2 ${
                opt.id === value ? "bg-blue-50 dark:bg-blue-900/30" : ""
              }`}
            >
              {opt.availability ? (
                <AvailabilityDot status={opt.availability} />
              ) : (
                opt.id !== "" && <span className="inline-block w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
              )}
              <span className="flex-1">{opt.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
