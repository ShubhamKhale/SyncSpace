"use client";

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

const EXAMPLES = [
  "Redis pub/sub with publisher, channel, and two subscribers",
  "Microservices architecture with API gateway",
  "CI/CD pipeline from code commit to production",
  "OAuth2 authorization code flow",
];

export default function PromptInput({ value, onChange, onSubmit, disabled }: PromptInputProps) {
  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSubmit();
        }}
        disabled={disabled}
        placeholder="Describe your diagram…&#10;e.g. Redis pub/sub with publisher and two subscribers"
        className="w-full h-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition disabled:opacity-50"
      />

      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Examples</p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              disabled={disabled}
              className="text-left text-xs text-slate-400 hover:text-indigo-400 transition truncate disabled:opacity-40"
            >
              · {ex}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
      >
        Generate Diagram
      </button>
      <p className="text-[10px] text-slate-600 text-center">Ctrl+Enter to generate</p>
    </div>
  );
}
