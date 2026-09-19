"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiFetch } from "@/lib/api";
import { aiMarkdownComponents } from "./aiMarkdownComponents";

type ChatMessage = { role: "user" | "ai"; text: string };

const BoardAiChat: React.FC<{ boardId?: string }> = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || !boardId || loading || cooldown) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<{ answer: string }>(`/api/boards/${boardId}/ai/chat`, {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setError((err as Error).message ?? "Failed to get an answer.");
    } finally {
      setLoading(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg hover:cursor-pointer transition"
        >
          <Sparkles size={16} />
          Ask AI
        </button>
      )}

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ask AI about this board</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
              {messages.length === 0 && !loading && (
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Ask anything about this board — tasks, priorities, status, linked docs. The AI answers using this board&apos;s current data.
                </p>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="max-w-[85%] ml-auto rounded-xl rounded-br-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-indigo-600 text-white"
                  >
                    {m.text}
                  </div>
                ) : (
                  <div
                    key={i}
                    className="max-w-[95%] mr-auto rounded-xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={aiMarkdownComponents}>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                )
              )}

              {loading && (
                <div className="mr-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Thinking… this can take a few seconds</span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl px-3.5 py-2.5">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-end gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Ask a question about this board…"
                rows={1}
                disabled={loading || cooldown}
                className="flex-1 resize-none text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                onClick={handleAsk}
                disabled={loading || cooldown || !question.trim()}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardAiChat;
