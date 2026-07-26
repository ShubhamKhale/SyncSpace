"use client";

interface ModelLoaderProps {
  progress: number;
  text: string;
}

export default function ModelLoader({ progress, text }: ModelLoaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Downloading model&hellip;</span>
        <span className="font-mono font-semibold text-indigo-400">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500 truncate">{text}</p>
      {progress === 0 && (
        <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-800/40 rounded-lg px-3 py-2">
          First-time download (~300 MB). Cached after this — instant next time. Runs on CPU, no GPU needed.
        </p>
      )}
    </div>
  );
}
