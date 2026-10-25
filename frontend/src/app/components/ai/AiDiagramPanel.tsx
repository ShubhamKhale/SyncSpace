"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertTriangle, Clock, RotateCcw, Zap, RefreshCw } from "lucide-react";
import PromptInput from "./PromptInput";
import GenerationProgress from "./GenerationProgress";
import { validate, LogicalGraph } from "@/app/lib/diagram-validator";
import { assignPositions } from "@/app/lib/layout";
import { convertToReactFlow } from "@/app/lib/reactflow-converter";
import { apiFetch, ApiError } from "@/lib/api";

type Status = "idle" | "generating" | "waiting" | "error";

const MAX_AUTO_RETRIES = 2;
const WEB_SEARCH_KEY = "ss_ai_web_search";

interface AiDiagramPanelProps {
  isOpen: boolean;
  onClose: () => void;
  flowId?: string;
  diagram: {
    takeSnapshot: () => void;
    uploadJson: (json: string, opts?: { fitView?: boolean }) => void;
  };
}

// One turn in the conversation history sent to the backend.
type ConversationTurn = { role: "user" | "assistant"; content: string };

// What is rendered in the chat thread.
type ChatMessage = {
  role: "user" | "ai";
  type: "text" | "diagram-success" | "error";
  text: string;
  assumptions?: string[]; // shown as chips under diagram-success messages
};

// Shape of the /api/ai/generate-diagram/chat response.
type ConversationResponse = {
  action: "ask" | "diagram";
  question?: string;
  graph?: LogicalGraph;
  assumptions?: string[]; // model-stated assumptions when action=="diagram"
};

// Parse lettered options (A. ... B. ...) out of an AI question string.
function parseOptions(text: string): { preamble: string; options: string[] } | null {
  const lines = text.split("\n");
  const firstOptIdx = lines.findIndex(l => /^[A-D]\.\s/.test(l.trim()));
  if (firstOptIdx === -1) return null;
  const optionLines = lines.slice(firstOptIdx).filter(l => /^[A-D]\.\s/.test(l.trim()));
  if (optionLines.length < 2) return null;
  const preamble = lines.slice(0, firstOptIdx).join("\n").trim();
  return { preamble, options: optionLines.map(l => l.trim()) };
}

function readWebSearchPref(): boolean {
  try {
    return localStorage.getItem(WEB_SEARCH_KEY) === "1";
  } catch {
    return false;
  }
}

export default function AiDiagramPanel({ isOpen, onClose, flowId, diagram }: AiDiagramPanelProps) {
  const [webSearch, setWebSearch] = useState(readWebSearchPref);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Conversation state
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
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

  // Auto-scroll chat to bottom whenever messages change.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, status]);

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

  // Cancel pending auto-retry when panel closes mid-wait.
  useEffect(() => {
    if (!isOpen && status === "waiting") {
      runId.current++;
      clearTimer();
      setStatus("idle");
    }
  }, [isOpen, status]);

  useEffect(() => clearTimer, []);

  // Fetch persisted conversation when panel opens (if flowId is set and no local state yet).
  useEffect(() => {
    if (!isOpen || !flowId || messages.length > 0) return;
    apiFetch<{ history: ConversationTurn[]; messages: ChatMessage[] }>(`/api/flows/${flowId}/ai-conversation`, { method: "GET" })
      .then(conv => {
        if (conv.history.length > 0 || conv.messages.length > 0) {
          setHistory(conv.history);
          setMessages(conv.messages);
        }
      })
      .catch(() => {/* ignore — treat as no prior conversation */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flowId]);

  const persistConversation = useCallback((h: ConversationTurn[], m: ChatMessage[]) => {
    if (!flowId) return;
    apiFetch(`/api/flows/${flowId}/ai-conversation`, {
      method: "PUT",
      body: JSON.stringify({ history: h, messages: m }),
    }).catch(() => {/* best-effort */});
  }, [flowId]);

  const sendTurn = useCallback(async (nextHistory: ConversationTurn[], isAutoRetry = false) => {
    if (!isAutoRetry) autoRetries.current = 0;
    const id = ++runId.current;
    clearTimer();
    setStatus("generating");
    setErrorMsg("");

    try {
      const resp = await apiFetch<ConversationResponse>("/api/ai/generate-diagram/chat", {
        method: "POST",
        body: JSON.stringify({ history: nextHistory, web_search: webSearch }),
      });
      if (id !== runId.current) return;

      if (resp.action === "ask") {
        const question = resp.question ?? "Could you give me more detail?";
        const newMsg: ChatMessage = { role: "ai", type: "text", text: question };
        const newHistory = nextHistory.concat({ role: "assistant", content: JSON.stringify({ action: "ask", question }) });
        setMessages(prev => {
          const updated = [...prev, newMsg];
          persistConversation(newHistory, updated);
          return updated;
        });
        setHistory(newHistory);
        setStatus("idle");

      } else if (resp.action === "diagram" && resp.graph) {
        const result = validate(resp.graph);
        if (!result.valid || !result.graph) {
          setMessages(prev => [...prev, {
            role: "ai",
            type: "error",
            text: result.errors[0] ?? "The AI returned an unusable diagram.",
          }]);
          setStatus("error");
          return;
        }
        if (result.repairs.length) console.info("[AI diagram] repaired:", result.repairs);

        const positioned = assignPositions(result.graph);
        const rfData = convertToReactFlow(positioned);
        diagram.takeSnapshot();
        diagram.uploadJson(JSON.stringify(rfData), { fitView: true });

        const nodeCount = result.graph.nodes.length;
        const successMsg: ChatMessage = {
          role: "ai",
          type: "diagram-success",
          text: `Diagram "${result.graph!.title}" generated — ${nodeCount} node${nodeCount !== 1 ? "s" : ""}. You can keep refining below, or close the panel.`,
          assumptions: resp.assumptions ?? [],
        };
        const newHistory = nextHistory.concat({ role: "assistant", content: JSON.stringify({ action: "diagram", ...resp.graph }) });
        setMessages(prev => {
          const updated = [...prev, successMsg];
          persistConversation(newHistory, updated);
          return updated;
        });
        setHistory(newHistory);
        setStatus("idle");
      }
    } catch (err) {
      if (id !== runId.current) return;

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
            if (id === runId.current) sendTurn(nextHistory, true);
          }
        }, 1000);
        return;
      }

      const msg = err instanceof Error ? err.message : "Generation failed. Try again.";
      setErrorMsg(msg);
      setMessages(prev => [...prev, { role: "ai", type: "error", text: msg }]);
      setStatus("error");
    }
  }, [webSearch, diagram, persistConversation]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const userTurn: ConversationTurn = { role: "user", content: text };
    const nextHistory = [...history, userTurn];
    setMessages(prev => [...prev, { role: "user", type: "text", text }]);
    setInput("");
    setHistory(nextHistory);
    sendTurn(nextHistory);
  }, [input, history, sendTurn]);

  const handleForceGenerate = useCallback(() => {
    const forceText = "Stop asking questions. Generate the best diagram you can with the information so far.";
    const userTurn: ConversationTurn = { role: "user", content: forceText };
    const nextHistory = [...history, userTurn];
    setMessages(prev => [...prev, { role: "user", type: "text", text: "Generate now." }]);
    setHistory(nextHistory);
    sendTurn(nextHistory);
  }, [history, sendTurn]);

  const handleNewDiagram = () => {
    runId.current++;
    clearTimer();
    setHistory([]);
    setMessages([]);
    setInput("");
    setStatus("idle");
    setErrorMsg("");
  };

  const cancelWait = () => {
    runId.current++;
    clearTimer();
    setStatus("idle");
  };

  const busy = status === "generating" || status === "waiting";
  const hasConversation = messages.length > 0;
  // Show "Generate Now" button after at least one AI question has been asked.
  const showForceGenerate = !busy && history.some(t => t.role === "assistant");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[400px] max-w-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-gray-100">AI Diagram Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            {hasConversation && (
              <button
                onClick={handleNewDiagram}
                aria-label="New diagram"
                title="Start over"
                className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat thread */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {!hasConversation && (
            <p className="text-xs text-gray-400 leading-relaxed">
              Describe any architecture, process, or system. The AI will ask a few questions
              if needed, then draw it. Turn on web search for real, current service names.
            </p>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.type === "diagram-success" ? (
                <div className="flex items-start gap-2 bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-3 py-2.5 max-w-[90%]">
                  <Sparkles size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs text-emerald-300 leading-relaxed">{msg.text}</p>
                    {msg.assumptions && msg.assumptions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.assumptions.map((a, ai) => (
                          <span key={ai} className="text-[10px] bg-gray-700/60 text-gray-400 rounded-full px-2 py-0.5">
                            Assumed: {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : msg.type === "error" ? (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2.5 max-w-[85%]">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 leading-relaxed">{msg.text}</p>
                </div>
              ) : msg.role === "user" ? (
                <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
                  <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ) : (
                /* AI text message — parse lettered options into clickable buttons */
                <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[90%]">
                  {(() => {
                    const parsed = parseOptions(msg.text);
                    if (!parsed) {
                      return <p className="text-xs text-gray-100 leading-relaxed whitespace-pre-wrap">{msg.text}</p>;
                    }
                    return (
                      <div className="flex flex-col gap-2">
                        {parsed.preamble && (
                          <p className="text-xs text-gray-100 leading-relaxed">{parsed.preamble}</p>
                        )}
                        <div className="flex flex-col gap-1">
                          {parsed.options.map((opt, oi) => (
                            <button
                              key={oi}
                              onClick={() => setInput(opt)}
                              className="text-left text-xs bg-gray-700 hover:bg-indigo-700/60 text-gray-200 hover:text-white rounded-lg px-3 py-1.5 transition border border-gray-600 hover:border-indigo-500"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}

          {status === "generating" && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
                <GenerationProgress webSearch={webSearch} />
              </div>
            </div>
          )}

          {status === "waiting" && (
            <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3" role="status" aria-live="polite">
              <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-xs font-semibold text-amber-300">The AI is busy</p>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Retrying in <span className="tabular-nums font-semibold">{countdown}s</span>…
                </p>
                <button onClick={cancelWait} className="text-xs text-gray-400 hover:text-gray-200 mt-1 text-left">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-800 px-4 py-3 flex flex-col gap-2">
          {showForceGenerate && (
            <button
              onClick={handleForceGenerate}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition self-start"
            >
              <Zap size={12} /> Skip questions, generate now
            </button>
          )}

          <PromptInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
            disabled={busy}
            webSearch={webSearch}
            onWebSearchChange={changeWebSearch}
            isConversation={hasConversation}
          />

          {status === "error" && !hasConversation && (
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={() => { setStatus("idle"); setErrorMsg(""); }}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <RotateCcw size={12} /> Edit prompt
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 text-center">
            Powered by Groq{webSearch ? " · Web search on" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
