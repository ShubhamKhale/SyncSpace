"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, GitBranch, Plus, Search, X } from "lucide-react";
import FlowCard from "@/app/components/flows/FlowCard";
import FilterMenu from "@/app/components/tasks/FilterMenu";
import { useOrgFlowsStore, type OrgFlow } from "@/app/store/useOrgFlowsStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import { FlowsPageSkeleton } from "./loading";

type SortKey = "updated" | "name" | "created";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "name", label: "Name" },
  { value: "created", label: "Newest" },
];

function compare(a: OrgFlow, b: OrgFlow, key: SortKey): number {
  if (key === "name") return a.name.localeCompare(b.name);
  const field = key === "created" ? "createdAt" : "updatedAt";
  return (b[field] ?? "").localeCompare(a[field] ?? "");
}

export default function FlowsPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<FlowsPageSkeleton />}>
      <FlowsView />
    </Suspense>
  );
}

function FlowsView() {
  const router = useRouter();
  // Both hooks are typed nullable because the Pages Router (NextAuth) coexists.
  const pathname = usePathname() ?? "/dashboard/flows";
  const searchParams = useSearchParams();
  const params = searchParams ?? new URLSearchParams();
  const { flows, boards, loading, loaded, error, fetchAll, createFlow, renameFlow, duplicateFlow, deleteFlow } =
    useOrgFlowsStore();
  const { canEditTasks: canEdit } = useEditMode();
  const [picking, setPicking] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // URL-backed view state (shareable / bookmarkable)
  const query = params.get("q") ?? "";
  const boardF = (params.get("board") ?? "").split(",").filter(Boolean);
  const sortKey = (params.get("sort") as SortKey) || "updated";

  const setParams = (updates: Record<string, string | string[] | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      const value = Array.isArray(v) ? v.join(",") : v;
      if (value) next.set(k, value);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasFilters = !!(query || boardF.length);

  // One section per board, sections ordered by their most recently updated flow.
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = flows.filter(
      (f) => (!q || f.name.toLowerCase().includes(q)) && (!boardF.length || boardF.includes(f.boardId))
    );
    const byBoard = new Map<string, OrgFlow[]>();
    for (const f of filtered) byBoard.set(f.boardId, [...(byBoard.get(f.boardId) ?? []), f]);
    return Array.from(byBoard.entries())
      .map(([boardId, list]) => ({
        boardId,
        title: list[0].boardTitle || boards.find((b) => b.id === boardId)?.title || "Untitled board",
        flows: [...list].sort((a, b) => compare(a, b, sortKey)),
        latest: list.reduce((m, f) => (f.updatedAt > m ? f.updatedAt : m), ""),
      }))
      .sort((a, b) => b.latest.localeCompare(a.latest));
  }, [flows, boards, query, boardF, sortKey]);

  const run = async (action: () => Promise<unknown>, failMsg: string) => {
    setActionError("");
    try { await action(); } catch (err) { setActionError((err as Error).message || failMsg); }
  };

  const handleCreate = async (boardId: string) => {
    setActionError("");
    try {
      const flow = await createFlow(boardId);
      router.push(`/dashboard/boards/${boardId}/flows/${flow.id}`);
    } catch (err) {
      setPicking(false);
      setActionError((err as Error).message || "Couldn't create the flow.");
    }
  };

  if (loading || (!loaded && !error)) return <FlowsPageSkeleton />;

  return (
    <div className="p-6 lg:p-8 min-h-full bg-[#F8F9FC] dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitBranch size={22} className="text-indigo-500" />
            Flows
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All diagrams across your boards.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setPicking(true)}
            disabled={boards.length === 0}
            title={boards.length === 0 ? "Create a board first" : undefined}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Plus size={16} />
            New Flow
          </button>
        )}
      </div>

      {(error || actionError) && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error ? `Couldn't load flows: ${error}` : actionError}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setParams({ q: e.target.value || null })}
            placeholder="Search flows…"
            aria-label="Search flows"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <FilterMenu label="Board" selected={boardF} onChange={(v) => setParams({ board: v })}
          options={boards.map((b) => ({ value: b.id, label: b.title }))} />
        <FilterMenu label="Sort" single selected={[sortKey]}
          onChange={(v) => setParams({ sort: v[0] && v[0] !== "updated" ? v[0] : null })}
          options={SORTS} />
        {hasFilters && (
          <button onClick={() => setParams({ q: null, board: null })}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
            <GitBranch size={22} className="text-indigo-500" />
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {hasFilters ? "No flows match these filters" : "No flows yet"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {hasFilters
              ? "Try another search or board."
              : canEdit ? "Diagram an architecture or process — by hand or with AI." : "Nothing has been diagrammed yet."}
          </p>
          {hasFilters ? (
            <button onClick={() => setParams({ q: null, board: null })} className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Clear filters
            </button>
          ) : canEdit && boards.length > 0 && (
            <button onClick={() => setPicking(true)} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              <Plus size={14} /> New Flow
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.boardId} aria-labelledby={`board-${s.boardId}`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 id={`board-${s.boardId}`} className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {s.title}
                  <span className="ml-2 font-normal text-slate-400">· {s.flows.length} flow{s.flows.length !== 1 ? "s" : ""}</span>
                </h2>
                <Link
                  href={`/dashboard/boards/${s.boardId}/flows`}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition"
                >
                  View board <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {s.flows.map((f) => (
                  <FlowCard
                    key={f.id}
                    flow={f}
                    boardId={f.boardId}
                    canEdit={canEdit}
                    onRename={(_, name) => run(() => renameFlow(f, name), "Couldn't rename the flow.")}
                    onDuplicate={() => run(() => duplicateFlow(f), "Couldn't duplicate the flow.")}
                    onDelete={() => run(() => deleteFlow(f), "Couldn't delete the flow.")}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {picking && (
        <BoardPicker
          boards={boards}
          initial={boardF.length === 1 ? boardF[0] : ""}
          onCancel={() => setPicking(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

/** Small dialog asking which board a new flow belongs to. */
function BoardPicker({ boards, initial, onCancel, onCreate }: {
  boards: { id: string; title: string }[];
  initial: string;
  onCancel: () => void;
  onCreate: (boardId: string) => Promise<void>;
}) {
  const [boardId, setBoardId] = useState(initial || (boards.length === 1 ? boards[0].id : ""));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [busy, onCancel]);

  const submit = async () => {
    if (!boardId || busy) return;
    setBusy(true);
    await onCreate(boardId);
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={() => !busy && onCancel()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-flow-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <h2 id="new-flow-title" className="text-base font-semibold text-slate-800 dark:text-slate-100">New flow</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Which board does this diagram belong to?</p>
        <label htmlFor="new-flow-board" className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Board</label>
        <select
          id="new-flow-board"
          autoFocus
          value={boardId}
          onChange={(e) => setBoardId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="">Choose a board…</option>
          {boards.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} disabled={busy}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition">
            Cancel
          </button>
          <button onClick={submit} disabled={!boardId || busy}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition">
            {busy ? "Creating…" : "Create & open"}
          </button>
        </div>
      </div>
    </div>
  );
}
