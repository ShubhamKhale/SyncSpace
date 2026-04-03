"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LinkedResource } from "@/app/store/useLinkedResourcesStore";
import { PLATFORM_ICONS, detectPlatform } from "@/app/lib/platformIcons";
import SelectPopover from "./SelectPopover";

interface Props {
  type: "doc" | "resource";
  onAdd: (item: LinkedResource) => void;
  onClose: () => void;
}

const inputCls =
  "w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md px-2.5 py-1.5 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function AddLinkedItemModal({ type, onAdd, onClose }: Props) {
  const isDoc = type === "doc";

  // Doc fields
  const [title,       setTitle]       = useState("");
  const [url,         setUrl]         = useState("");
  const [description, setDescription] = useState("");

  // Resource fields — icon/color derive from platform selection
  const [platformValue, setPlatformValue] = useState(PLATFORM_ICONS[0].value);

  const activePlatform =
    PLATFORM_ICONS.find((p) => p.value === platformValue) ?? PLATFORM_ICONS[0];

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (!isDoc) {
      const detected = detectPlatform(value);
      setPlatformValue(detected.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const item: LinkedResource = isDoc
      ? { title: title.trim(), url: url.trim(), description: description.trim() }
      : {
          title: title.trim(),
          url: url.trim(),
          icon: activePlatform.icon,
          color: activePlatform.color,
        };

    onAdd(item);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-60">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[440px]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isDoc ? "Add Documentation Link" : "Add Resource Link"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">

          {/* Resource: badge preview */}
          {!isDoc && (
            <div className="flex items-center gap-3 pb-1">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${activePlatform.color}`}
              >
                {activePlatform.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {activePlatform.label}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Auto-detected from URL or select below
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isDoc ? "e.g. Project Overview" : "e.g. Backend Repository"}
              className={inputCls}
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://..."
              className={inputCls}
              required
            />
          </div>

          {/* Doc: description */}
          {isDoc && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document (optional)"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
          )}

          {/* Resource: platform select */}
          {!isDoc && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Platform icon
              </label>
              <SelectPopover
                value={platformValue}
                onChange={setPlatformValue}
                options={PLATFORM_ICONS.map((p) => ({ value: p.value, label: `${p.label}  [${p.icon}]` }))}
                triggerClassName={inputCls}
                dropdownClassName="min-w-full"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !url.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
