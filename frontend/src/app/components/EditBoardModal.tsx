"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { BoardTag, BoardStatus, BoardDetailsUpdate } from "@/app/store/useBoardStore";

interface Props {
  initialTitle: string;
  initialDescription: string;
  initialTags: BoardTag[];
  initialStatus: BoardStatus;
  initialCoverColor: string;
  onSave: (details: BoardDetailsUpdate) => void;
  onClose: () => void;
  isSaving?: boolean;
}

const COVER_COLORS = [
  { value: "#2563EB", label: "Blue" },
  { value: "#7C3AED", label: "Violet" },
  { value: "#059669", label: "Green" },
  { value: "#DC2626", label: "Red" },
  { value: "#D97706", label: "Amber" },
  { value: "#0891B2", label: "Cyan" },
  { value: "#BE185D", label: "Pink" },
  { value: "#374151", label: "Slate" },
];

const TAG_PRESETS: Omit<BoardTag, "label">[] = [
  { color: "#E0F2FE", textColor: "#0284C7" },
  { color: "#FFEDD5", textColor: "#EA580C" },
  { color: "#EDE9FE", textColor: "#7C3AED" },
  { color: "#DCFCE7", textColor: "#16A34A" },
  { color: "#FCE7F3", textColor: "#DB2777" },
  { color: "#FEF9C3", textColor: "#CA8A04" },
];

const STATUS_OPTIONS: { value: BoardStatus; label: string; dot: string }[] = [
  { value: "active",   label: "Active",   dot: "bg-green-500" },
  { value: "on-hold",  label: "On Hold",  dot: "bg-amber-400" },
  { value: "archived", label: "Archived", dot: "bg-gray-400" },
];

export default function EditBoardModal({
  initialTitle,
  initialDescription,
  initialTags,
  initialStatus,
  initialCoverColor,
  onSave,
  onClose,
  isSaving = false,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<BoardTag[]>(initialTags);
  const [status, setStatus] = useState<BoardStatus>(initialStatus);
  const [coverColor, setCoverColor] = useState(initialCoverColor);

  // Tag input state
  const [tagInput, setTagInput] = useState("");
  const [selectedTagPreset, setSelectedTagPreset] = useState(0);

  const handleAddTag = () => {
    const label = tagInput.trim();
    if (!label || tags.find((t) => t.label === label)) return;
    const preset = TAG_PRESETS[selectedTagPreset % TAG_PRESETS.length];
    setTags([...tags, { label, ...preset }]);
    setTagInput("");
    setSelectedTagPreset((prev) => prev + 1);
  };

  const handleRemoveTag = (label: string) => {
    setTags(tags.filter((t) => t.label !== label));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), tags, status, coverColor });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Cover color strip */}
        <div className="h-2 rounded-t-lg transition-colors" style={{ backgroundColor: coverColor }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--sidebar-option-background-color)] dark:border-slate-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Edit Board Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 hover:cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Board Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Product Launch Q4"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What is this board about?"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition hover:cursor-pointer ${
                    status === opt.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                      : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Tags
            </label>

            {/* Existing tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: tag.color, color: tag.textColor }}
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.label)}
                      className="hover:opacity-70 hover:cursor-pointer ml-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:cursor-pointer transition"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>

          {/* Cover Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Cover Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setCoverColor(c.value)}
                  className={`w-7 h-7 rounded-full transition hover:cursor-pointer hover:scale-110 ${
                    coverColor === c.value
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--sidebar-option-background-color)] dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-sm rounded-lg hover:bg-blue-700 transition hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
