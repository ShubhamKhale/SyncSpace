import React, { useState } from "react";
import { Calendar, Check, X, Loader2 } from "lucide-react";

interface EditableDateProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  saveState?: "idle" | "loading" | "success" | "error";
  disabled?: boolean;
}

export const EditableDate: React.FC<EditableDateProps> = ({
  value,
  onSave,
  saveState = "idle",
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleSave = async () => {
    if (localValue === value) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(localValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (isEditing && !disabled) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          type="date"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
        />
        <button
          onClick={handleSave}
          disabled={saveState === "loading"}
          className="text-green-600 hover:text-green-700 disabled:text-gray-400"
        >
          {saveState === "loading" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Check size={18} />
          )}
        </button>
        <button
          onClick={() => {
            setLocalValue(value);
            setIsEditing(false);
          }}
          disabled={saveState === "loading"}
          className="text-red-600 hover:text-red-700 disabled:text-gray-400"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => !disabled && setIsEditing(true)}
      className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
        disabled
          ? "cursor-not-allowed"
          : "hover:bg-gray-100 dark:hover:bg-slate-600 group-hover:bg-blue-50"
      } ${
        saveState === "success"
          ? "bg-green-50 ring-1 ring-green-200"
          : saveState === "error"
            ? "bg-red-50 ring-1 ring-red-200"
            : ""
      }`}
    >
      <Calendar size={16} />
      <span className="text-sm">{localValue}</span>
    </button>
  );
};
