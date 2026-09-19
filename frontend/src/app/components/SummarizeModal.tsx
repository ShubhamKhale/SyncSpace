"use client";

import { useState } from "react";
import { X, Wand2, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiFetch } from "@/lib/api";
import { aiMarkdownComponents } from "./aiMarkdownComponents";

interface Props {
  onClose: () => void;
}

export default function SummarizeModal({ onClose }: Props) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading || cooldown) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const data = await apiFetch<{ summary: string }>("/api/ai/summarize", {
        method: "POST",
        body: JSON.stringify({ text: trimmed }),
      });
      setSummary(data.summary);
    } catch (err) {
      setError((err as Error).message ?? "Failed to summarize.");
    } finally {
      setLoading(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-[720px] max-w-[92vw] max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Summarize text</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Paste text to summarize
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste meeting notes, a doc, or a long task description…"
              rows={8}
              disabled={loading || cooldown}
              className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 disabled:opacity-60 resize-y"
            />
          </div>

          {loading && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3.5 py-2.5">
              <Loader2 size={14} className="animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Summarizing… this can take a few seconds, longer on first use</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg px-3.5 py-2.5">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {summary && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Summary
              </label>
              <div className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3.5 py-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={aiMarkdownComponents}>
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="text-sm px-3.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
          <button
            onClick={handleSummarize}
            disabled={loading || cooldown || !text.trim()}
            className="text-sm px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition"
          >
            {loading ? "Summarizing…" : "Summarize"}
          </button>
        </div>
      </div>
    </div>
  );
}
