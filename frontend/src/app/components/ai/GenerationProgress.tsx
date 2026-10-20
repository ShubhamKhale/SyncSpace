"use client";

import { useEffect, useState } from "react";

interface GenerationProgressProps {
  webSearch: boolean;
}

// The backend gives no streaming progress, so stages are paced by elapsed
// time to reflect what is typically happening at that point.
const STAGES = {
  search: [
    { after: 0, title: "Reading your prompt…", sub: "Planning the components and how they connect." },
    { after: 2, title: "Searching the web…", sub: "Checking real service names and current patterns." },
    { after: 7, title: "Drawing the diagram…", sub: "Large architectures take a little longer." },
    { after: 15, title: "Still working…", sub: "The AI is busy — switching to a backup model if needed." },
  ],
  plain: [
    { after: 0, title: "Generating diagram…", sub: "Planning the components and how they connect." },
    { after: 5, title: "Drawing the diagram…", sub: "Large architectures take a little longer." },
    { after: 12, title: "Still working…", sub: "The AI is busy — switching to a backup model if needed." },
  ],
};

export default function GenerationProgress({ webSearch }: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const stages = webSearch ? STAGES.search : STAGES.plain;
  const stage = [...stages].reverse().find((s) => elapsed >= s.after) ?? stages[0];

  return (
    <div className="flex flex-col items-center gap-3 py-4" role="status" aria-live="polite">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
        <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-300">{stage.title}</p>
      <p className="text-xs text-slate-500 text-center">{stage.sub}</p>
      {elapsed >= 3 && <p className="text-[10px] text-slate-600 tabular-nums">{elapsed}s</p>}
    </div>
  );
}
