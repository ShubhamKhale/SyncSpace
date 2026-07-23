"use client";
import { useReactFlow } from "@xyflow/react";
import { useState, useEffect } from "react";
import { X, Check, Trash2, MessageSquare } from "lucide-react";
import useUndoRedo from "@/app/hooks/useUndoRedo";

export interface NodeComment {
  id: string;
  author: string;
  text: string;
  createdAt: number;
  resolved: boolean;
}

export function NodeCommentPanel({
  nodeId,
  comments,
  locked,
  onClose,
}: {
  nodeId: string;
  comments: NodeComment[];
  locked: boolean;
  onClose: () => void;
}) {
  const { setNodes } = useReactFlow();
  const { takeSnapshot } = useUndoRedo();
  const [draft, setDraft] = useState("");

  // Elevate the node above all others while the panel is open
  useEffect(() => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, zIndex: 9999 } : n));
    return () => {
      setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, zIndex: 0 } : n));
    };
  }, [nodeId, setNodes]);

  // Close when clicking outside the panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const panel = document.getElementById(`comment-panel-${nodeId}`);
      if (panel && !panel.contains(e.target as Node)) onClose();
    };
    // Use capture so it fires before ReactFlow's own click handlers
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [nodeId, onClose]);

  const mutate = (next: NodeComment[]) => {
    takeSnapshot();
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, comments: next } } : n
      )
    );
  };

  const addComment = () => {
    if (!draft.trim()) return;
    mutate([
      ...comments,
      {
        id: crypto.randomUUID(),
        author: "You",
        text: draft.trim(),
        createdAt: Date.now(),
        resolved: false,
      },
    ]);
    setDraft("");
  };

  const deleteComment = (id: string) =>
    mutate(comments.filter((c) => c.id !== id));

  const toggleResolved = (id: string) =>
    mutate(comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)));

  return (
    <div
      id={`comment-panel-${nodeId}`}
      style={{ position: "absolute", left: "calc(100% + 12px)", top: 0, zIndex: 50 }}
      className="w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-1.5 text-gray-200 text-xs font-semibold">
          <MessageSquare size={12} />
          Comments ({comments.length})
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Comment list */}
      <div className="flex flex-col gap-2 p-3 max-h-56 overflow-y-auto scrollbar-hide">
        {comments.length === 0 && (
          <p className="text-gray-500 text-xs text-center py-4">No comments yet</p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={`rounded-lg px-3 py-2 text-xs flex flex-col gap-1 ${
              c.resolved ? "bg-gray-800/50 opacity-60" : "bg-gray-800"
            }`}
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="font-medium text-gray-300">{c.author}</span>
              <div className="flex items-center gap-1">
                <span>
                  {new Date(c.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={() => toggleResolved(c.id)}
                  title={c.resolved ? "Reopen" : "Resolve"}
                  className="p-1 rounded bg-gray-700 hover:bg-green-700 text-gray-400 hover:text-green-300 transition-colors cursor-pointer"
                >
                  <Check size={10} />
                </button>
                {!locked && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    title="Delete"
                    className="p-1 rounded bg-gray-700 hover:bg-red-800 text-gray-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
            <p
              className={`text-gray-200 whitespace-pre-wrap break-words ${
                c.resolved ? "line-through" : ""
              }`}
            >
              {c.text}
            </p>
          </div>
        ))}
      </div>

      {/* Input */}
      {!locked && (
        <div className="p-2 border-t border-gray-700 flex gap-2 items-end">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addComment();
              }
            }}
            placeholder="Write a comment... (Enter to post)"
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={addComment}
            disabled={!draft.trim()}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
