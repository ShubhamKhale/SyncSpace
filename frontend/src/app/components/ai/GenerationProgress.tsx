"use client";

export default function GenerationProgress() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-300">Searching the web and generating diagram&hellip;</p>
      <p className="text-xs text-slate-500 text-center">
        Grounding the diagram in current, accurate information. This can take a few seconds.
      </p>
    </div>
  );
}
