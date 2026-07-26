"use client";

export default function GenerationProgress() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-300">Generating diagram&hellip;</p>
      <p className="text-xs text-slate-500 text-center">
        Model is thinking. This usually takes 5–30 seconds.
      </p>
    </div>
  );
}
