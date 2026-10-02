"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardFlowsStore, type BoardFlow } from "@/app/store/useBoardFlowsStore";
import { GitBranch, Plus, Copy, Trash2, Pencil } from "lucide-react";

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function FlowPreview({ nodeCount, edgeCount }: { nodeCount: number; edgeCount: number }) {
  // Abstract SVG preview — dots for nodes, lines for edges
  const seed = nodeCount * 7 + edgeCount * 3;
  const dots = Array.from({ length: Math.min(nodeCount, 8) }, (_, i) => ({
    x: 14 + ((seed * (i + 1) * 37) % 172),
    y: 10 + ((seed * (i + 1) * 53) % 80),
  }));
  const lines = Array.from({ length: Math.min(edgeCount, 6) }, (_, i) => {
    const a = dots[i % dots.length] ?? { x: 50, y: 50 };
    const b = dots[(i + 1) % dots.length] ?? { x: 100, y: 50 };
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });

  if (nodeCount === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-40">
        <GitBranch size={28} className="text-indigo-400" />
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Empty diagram</span>
      </div>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="4 2" />
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <rect x={d.x - 10} y={d.y - 7} width="20" height="14" rx="3"
            fill="#6366f1" fillOpacity="0.12" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function FlowCard({
  flow,
  boardId,
  onDelete,
  onDuplicate,
  onRename,
}: {
  flow: BoardFlow;
  boardId: string;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(flow.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setName(flow.name); }, [flow.name]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commitRename() {
    setEditing(false);
    const trimmed = name.trim() || flow.name;
    setName(trimmed);
    if (trimmed !== flow.name) onRename(flow.id, trimmed);
  }

  return (
    <div className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 flex flex-col">

      {/* Preview area — clickable */}
      <div
        className="relative h-36 bg-slate-50 dark:bg-slate-900 cursor-pointer overflow-hidden"
        onClick={() => !editing && router.push(`/dashboard/boards/${boardId}/flows/${flow.id}`)}
      >
        <FlowPreview nodeCount={flow.nodeCount} edgeCount={flow.edgeCount} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
            <GitBranch size={12} /> Open
          </div>
        </div>

        {/* Node/edge badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span className="bg-slate-900/60 dark:bg-slate-700/80 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {flow.nodeCount} nodes
          </span>
          <span className="bg-slate-900/60 dark:bg-slate-700/80 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {flow.edgeCount} edges
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3 flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-center gap-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setName(flow.name); setEditing(false); } }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 border border-indigo-400 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <p
              className="flex-1 min-w-0 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              onClick={() => router.push(`/dashboard/boards/${boardId}/flows/${flow.id}`)}
              title={flow.name}
            >
              {flow.name}
            </p>
          )}
        </div>

        {/* Meta + actions row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{fmtDate(flow.updatedAt)}</span>

          {/* Action buttons — always visible, subtle */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Rename"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(flow.id); }}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="Duplicate"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Inline delete confirm */}
        {confirmDelete && (
          <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2 mt-1">
            <span className="flex-1 text-red-600 dark:text-red-400 font-medium">Delete this flow?</span>
            <button
              onClick={() => { setConfirmDelete(false); onDelete(flow.id); }}
              className="px-2 py-0.5 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition"
            >Yes</button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 transition"
            >No</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowsGalleryPage() {
  const params = useParams<{ boardid: string }>();
  const boardId = params?.boardid;
  const router = useRouter();
  const { flows, loading, fetchFlows, createFlow, deleteFlow, renameFlow, duplicateFlow } = useBoardFlowsStore();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (boardId) fetchFlows(boardId);
  }, [boardId, fetchFlows]);

  async function handleNew() {
    if (!boardId || creating) return;
    setCreating(true);
    try {
      const flow = await createFlow(boardId);
      router.push(`/dashboard/boards/${boardId}/flows/${flow.id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 min-h-full bg-[#F8F9FC] dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GitBranch size={20} className="text-indigo-500" />
            Flow Diagrams
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visual flow diagrams for this board
          </p>
        </div>
        <button
          onClick={handleNew}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-60"
        >
          <Plus size={15} />
          {creating ? "Creating…" : "New Flow"}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 h-52 animate-pulse" />
          ))}
        </div>
      ) : flows.length === 0 ? (
        <div
          onClick={handleNew}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <GitBranch size={24} className="text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 dark:text-slate-200 font-semibold">No flows yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first flow diagram</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              boardId={boardId!}
              onDelete={(id) => deleteFlow(boardId!, id)}
              onDuplicate={(id) => duplicateFlow(boardId!, id)}
              onRename={(id, name) => renameFlow(boardId!, id, name)}
            />
          ))}
          {/* New flow card */}
          <div
            onClick={handleNew}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Plus size={18} className="text-indigo-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">New Flow</span>
          </div>
        </div>
      )}
    </div>
  );
}
