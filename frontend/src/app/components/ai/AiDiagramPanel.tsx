"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertTriangle, Clock, RotateCcw } from "lucide-react";
import PromptInput from "./PromptInput";
import GenerationProgress from "./GenerationProgress";
import { validate, LogicalGraph } from "@/app/lib/diagram-validator";
import { assignPositions } from "@/app/lib/layout";
import { convertToReactFlow } from "@/app/lib/reactflow-converter";
import { apiFetch, ApiError } from "@/lib/api";

type Status = "idle" | "generating" | "waiting" | "error";

/** Automatic retries after "AI is busy" (429) before showing an error. */
const MAX_AUTO_RETRIES = 2;
const WEB_SEARCH_KEY = "ss_ai_web_search";

interface AiDiagramPanelProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: {
    takeSnapshot: () => void;
    uploadJson: (json: string, opts?: { fitView?: boolean }) => void;
  };
}

function readWebSearchPref(): boolean {
  try {
    return localStorage.getItem(WEB_SEARCH_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AiDiagramPanel({ isOpen, onClose, diagram }: AiDiagramPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(readWebSearchPref);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0); // bumped to cancel a pending auto-retry
  const autoRetries = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const changeWebSearch = (v: boolean) => {
    setWebSearch(v);
    try { localStorage.setItem(WEB_SEARCH_KEY, v ? "1" : "0"); } catch {}
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [isOpen, onClose]);

  // Closing the panel cancels a pending auto-retry (an in-flight request still
  // completes and applies, as before, so an accidental close loses nothing).
  useEffect(() => {
    if (!isOpen && status === "waiting") {
      runId.current++;
      clearTimer();
      setStatus("idle");
    }
  }, [isOpen, status]);

  useEffect(() => clearTimer, []);

  const generate = useCallback(async (isAutoRetry = false) => {
    if (!prompt.trim()) return;
    if (!isAutoRetry) autoRetries.current = 0;
    const id = ++runId.current;
    clearTimer();
    setStatus("generating");
    setErrorMsg("");

    try {
      const rawGraph = await apiFetch<LogicalGraph>("/api/ai/generate-diagram", {
        method: "POST",
        body: JSON.stringify({ prompt, web_search: webSearch }),
      });
      if (id !== runId.current) return;

      // Repairs (dropped dangling edges, renamed duplicate ids, …) rather
      // than rejecting the whole diagram over one model slip.
      const result = validate(rawGraph);
      if (!result.valid || !result.graph) {
        setErrorMsg(result.errors[0] ?? "The AI returned an unusable diagram.");
        setStatus("error");
        return;
      }
      if (result.repairs.length) console.info("[AI diagram] repaired output:", result.repairs);

      const positioned = assignPositions(result.graph);
      const reactFlowData = convertToReactFlow(positioned);

      diagram.takeSnapshot();
      diagram.uploadJson(JSON.stringify(reactFlowData), { fitView: true });
      setStatus("idle");
      onClose();
    } catch (err) {
      if (id !== runId.current) return;

      // "AI is busy" — wait the server's suggested time and retry automatically.
      if (err instanceof ApiError && err.status === 429 && autoRetries.current < MAX_AUTO_RETRIES) {
        autoRetries.current++;
        let remaining = Math.max(1, Math.ceil(err.retryAfter ?? 5));
        setCountdown(remaining);
        setStatus("waiting");
        timer.current = setInterval(() => {
          remaining--;
          setCountdown(remaining);
          if (remaining <= 0) {
            clearTimer();
            if (id === runId.current) generate(true);
          }
        }, 1000);
        return;
      }

      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Try again.");
      setStatus("error");
    }
  }, [prompt, webSearch, diagram, onClose]);

  const cancelWait = () => {
    runId.current++;
    clearTimer();
    setStatus("idle");
  };

  const busy = status === "generating" || status === "waiting";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[360px] max-w-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-gray-100">Generate with AI</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          <p className="text-xs text-gray-400 leading-relaxed">
            Describe any architecture, process, or system in plain English and the AI will draw it.
            Turn on web search to ground it in real, current service names.
          </p>

          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => generate()}
            disabled={busy}
            webSearch={webSearch}
            onWebSearchChange={changeWebSearch}
          />

          {status === "generating" && <GenerationProgress webSearch={webSearch} />}

          {status === "waiting" && (
            <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3" role="status" aria-live="polite">
              <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-xs font-semibold text-amber-300">The AI is busy</p>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Retrying automatically in <span className="tabular-nums font-semibold">{countdown}s</span>…
                </p>
                <button onClick={cancelWait} className="text-xs text-gray-400 hover:text-gray-200 mt-1 text-left">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3" role="alert">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-red-300">Generation failed</p>
                <p className="text-xs text-red-400 leading-relaxed">{errorMsg}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <button
                    onClick={() => generate()}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <RotateCcw size={12} /> Retry
                  </button>
                  <button onClick={() => setStatus("idle")} className="text-xs text-gray-400 hover:text-gray-200">
                    Edit prompt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 text-center">
            Powered by Groq{webSearch ? " · Web search on" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
