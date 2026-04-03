import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  saveState?: "idle" | "loading" | "success" | "error";
  disabled?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  placeholder = "Click to edit",
  className = "",
  multiline = false,
  saveState = "idle",
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
      } else if (!multiline && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleSave = async () => {
    if (localValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(localValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    }
    if (e.key === "Enter" && multiline && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  if (isEditing && !disabled) {
    return (
      <div className="flex items-center gap-2">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 p-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
            rows={3}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="flex-1 px-2 py-1 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
          />
        )}

        {saveState === "loading" && (
          <Loader2 size={18} className="animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={`cursor-pointer group relative ${
        disabled ? "cursor-not-allowed" : ""
      } ${className}`}
    >
      <div
        className={`px-2 py-1 rounded transition-colors ${
          saveState === "success"
            ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-200"
            : saveState === "error"
              ? "bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200"
              : "hover:bg-gray-100 dark:hover:bg-slate-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30"
        }`}
      >
        {localValue || (
          <span className="text-gray-400 dark:text-slate-500 italic">{placeholder}</span>
        )}
      </div>
      {/* {!disabled && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-500">edit</span>
        </div>
      )} */}
    </div>
  );
};
