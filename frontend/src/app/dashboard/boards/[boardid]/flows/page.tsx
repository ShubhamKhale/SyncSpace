"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoardFlowsStore } from "@/app/store/useBoardFlowsStore";
import { ArrowLeft, GitBranch, Plus } from "lucide-react";
import FlowCard from "@/app/components/flows/FlowCard";
import { useEditMode } from "@/app/hooks/useEditMode";


export default function FlowsGalleryPage() {
  const params = useParams<{ boardid: string }>();
  const boardId = params?.boardid;
  const router = useRouter();
  const { flows, loading: storeLoading, boardId: loadedBoardId, fetchFlows, createFlow, deleteFlow, renameFlow, duplicateFlow } = useBoardFlowsStore();
  // Skeleton only until this board's flows are first loaded; revisits render the cache.
  const loading = storeLoading || loadedBoardId !== boardId;
  const [creating, setCreating] = useState(false);
  // Viewers can open flows but not create/rename/duplicate/delete (backend enforces this too).
  const { canEditTasks: canEdit } = useEditMode();

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
        <div className="flex items-start gap-3">
          {/* Explicit route (not router.back) so it works after a refresh or direct link */}
          <button
            onClick={() => router.push(`/dashboard/boards/${boardId}`)}
            title="Back to board"
            aria-label="Back to board"
            className="mt-0.5 p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GitBranch size={20} className="text-indigo-500" />
              Flow Diagrams
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Visual flow diagrams for this board
            </p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={handleNew}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-60"
          >
            <Plus size={15} />
            {creating ? "Creating…" : "New Flow"}
          </button>
        )}
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
          onClick={canEdit ? handleNew : undefined}
          className={`border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-16 flex flex-col items-center justify-center gap-4 transition ${
            canEdit ? "cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10" : ""
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <GitBranch size={24} className="text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-slate-700 dark:text-slate-200 font-semibold">No flows yet</p>
            <p className="text-sm text-slate-400 mt-1">{canEdit ? "Create your first flow diagram" : "Nothing has been diagrammed on this board yet"}</p>
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
              canEdit={canEdit}
            />
          ))}
          {/* New flow card */}
          {canEdit && <div
            onClick={handleNew}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Plus size={18} className="text-indigo-500" />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">New Flow</span>
          </div>}
        </div>
      )}
    </div>
  );
}
