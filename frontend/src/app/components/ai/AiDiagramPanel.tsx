"use client";

import { useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertTriangle } from "lucide-react";
import PromptInput from "./PromptInput";
import GenerationProgress from "./GenerationProgress";
import { validate, LogicalGraph } from "@/app/lib/diagram-validator";
import { assignPositions } from "@/app/lib/layout";
import { convertToReactFlow } from "@/app/lib/reactflow-converter";
import { apiFetch } from "@/lib/api";

type Status = "idle" | "generating" | "error";

interface AiDiagramPanelProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: {
    takeSnapshot: () => void;
    uploadJson: (json: string, opts?: { fitView?: boolean }) => void;
  };
}

export default function AiDiagramPanel({ isOpen, onClose, diagram }: AiDiagramPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStatus("generating");
    setErrorMsg("");

    try {
      const rawGraph = await apiFetch<LogicalGraph>("/api/ai/generate-diagram", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const result = validate(rawGraph);
      if (!result.valid || !result.graph) {
        setErrorMsg(`Invalid diagram output: ${result.errors.slice(0, 2).join("; ")}`);
        setStatus("error");
        return;
      }

      const positioned = assignPositions(result.graph);
      const reactFlowData = convertToReactFlow(positioned);

      diagram.takeSnapshot();
      diagram.uploadJson(JSON.stringify(reactFlowData), { fitView: true });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Generation failed. Try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "generating";

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
            className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed">
            Describe any architecture, process, or system in plain English. The AI searches the web
            and grounds the diagram in current, accurate information.
          </p>

          {/* Prompt input (always visible) */}
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            disabled={isLoading}
          />

          {/* Status areas */}
          {status === "generating" && <GenerationProgress />}

          {status === "error" && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-red-300">Generation failed</p>
                <p className="text-xs text-red-400 leading-relaxed">{errorMsg}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 text-left"
                >
                  Try again →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 text-center">
            Powered by Groq · Grounded with live web search
          </p>
        </div>
      </div>
    </div>
  );
}
