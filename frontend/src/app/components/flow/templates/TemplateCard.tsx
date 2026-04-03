"use client";

import type { Template } from "./templateData";

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

// Preview background colours cycle through a small palette so cards
// look distinct even though all previews are emoji.
const PREVIEW_BG: Record<string, string> = {
  blank:       "bg-gray-700/60",
  mindmap:     "bg-purple-900/40",
  flowchart:   "bg-blue-900/40",
  sprint:      "bg-indigo-900/40",
  meeting:     "bg-yellow-900/30",
  sysarch:     "bg-slate-800/60",
  userjourney: "bg-teal-900/40",
  aipipeline:  "bg-pink-900/30",
};

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const previewBg = PREVIEW_BG[template.id] ?? "bg-gray-700/50";

  return (
    <button
      onClick={() => onClick(template)}
      className={`
        group flex flex-col w-full text-left
        bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden
        hover:border-blue-500/70 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_4px_16px_rgba(0,0,0,0.4)]
        hover:scale-[1.02] active:scale-[0.98]
        transition-all duration-150 cursor-pointer
      `}
      title={template.description}
    >
      {/* Preview */}
      <div className={`h-28 flex items-center justify-center ${previewBg} text-4xl select-none relative overflow-hidden`}>
        <span className="group-hover:scale-110 transition-transform duration-200">
          {template.preview}
        </span>
        {/* Category badge */}
        <span className="absolute top-2 right-2 text-[9px] font-semibold tracking-wider uppercase
                         bg-black/30 text-gray-300 px-1.5 py-0.5 rounded-md">
          {template.category}
        </span>
      </div>

      {/* Footer */}
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-gray-100 truncate leading-tight">
          {template.title}
        </p>
        <p className="text-xs text-gray-500 group-hover:text-gray-400 truncate leading-snug transition-colors">
          {template.description}
        </p>
      </div>
    </button>
  );
}
