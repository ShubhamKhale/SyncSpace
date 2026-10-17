"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronRight, ListChecks, Plus, Search, X } from "lucide-react";
import TaskModal from "@/app/components/TaskModal";
import FilterMenu from "@/app/components/tasks/FilterMenu";
import { useOrgTasksStore, type OrgTask } from "@/app/store/useOrgTasksStore";
import { useUserStore } from "@/app/store/useUserStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import { TasksPageSkeleton } from "./loading";

// ── Constants ────────────────────────────────────────────────────────────────

const STAGES = ["Planning", "Design", "Development", "QA", "Deployment"];
const STAGE_PILL: Record<string, string> = {
  Planning:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Design:      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Development: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  QA:          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Deployment:  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};
const PRIORITY_PILL: Record<string, string> = {
  high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
const BOARD_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

// "Done" = the final pipeline stage; there is no separate completed flag.
const DONE_STAGE = "Deployment";

type GroupKey = "overdue" | "week" | "later" | "none" | "done";
const GROUPS: { key: GroupKey; label: string; defaultOpen: boolean }[] = [
  { key: "overdue", label: "Overdue",        defaultOpen: true },
  { key: "week",    label: "Due this week",  defaultOpen: true },
  { key: "later",   label: "Later",          defaultOpen: true },
  { key: "none",    label: "No due date",    defaultOpen: true },
  { key: "done",    label: "Done · Deployment", defaultOpen: false },
];

type SortKey = "title" | "board" | "stage" | "priority" | "assignee" | "due";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Local YYYY-MM-DD — task dates are compared as plain day strings. */
function dayString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function groupOf(t: OrgTask, today: string, weekEnd: string): GroupKey {
  if (t.stage === DONE_STAGE) return "done";
  if (!t.endDate) return "none";
  if (t.endDate < today) return "overdue";
  if (t.endDate <= weekEnd) return "week";
  return "later";
}

function boardColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return BOARD_COLORS[Math.abs(h) % BOARD_COLORS.length];
}

function formatDue(day: string): string {
  if (!day) return "—";
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function compare(a: OrgTask, b: OrgTask, key: SortKey): number {
  switch (key) {
    case "title":    return a.title.localeCompare(b.title);
    case "board":    return a.boardTitle.localeCompare(b.boardTitle);
    case "stage":    return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage);
    case "priority": return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
    case "assignee": return (a.assignee || "~").localeCompare(b.assignee || "~");
    case "due":      return (a.endDate || "9999").localeCompare(b.endDate || "9999");
  }
}

const listParam = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<TasksPageSkeleton />}>
      <TasksView />
    </Suspense>
  );
}

function TasksView() {
  const router = useRouter();
  // Both hooks are typed nullable because the Pages Router (NextAuth) coexists.
  const pathname = usePathname() ?? "/dashboard/tasks";
  const searchParams = useSearchParams();
  const params = searchParams ?? new URLSearchParams();
  const { tasks, members, boards, loading, loaded, error, fetchAll, createTask, updateTask, deleteTask } =
    useOrgTasksStore();
  const user = useUserStore((s) => s.user);
  const { canEditTasks } = useEditMode();

  const [openTask, setOpenTask] = useState<OrgTask | null>(null);
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<GroupKey, boolean>>(
    () => Object.fromEntries(GROUPS.map((g) => [g.key, !g.defaultOpen])) as Record<GroupKey, boolean>
  );

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── URL-backed view state (shareable / bookmarkable) ──
  const tab = params.get("tab") === "all" ? "all" : "mine";
  const query = params.get("q") ?? "";
  const boardF = listParam(params.get("board"));
  const stageF = listParam(params.get("stage"));
  const priorityF = listParam(params.get("priority"));
  const assigneeF = listParam(params.get("assignee"));
  const dueF = params.get("due") ?? "";
  const sortKey = (params.get("sort") as SortKey) || "due";
  const sortDir = params.get("dir") === "desc" ? -1 : 1;

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

  const setSort = (key: SortKey) =>
    setParams({ sort: key === "due" ? null : key, dir: sortKey === key && sortDir === 1 ? "desc" : null });

  const hasFilters = !!(query || boardF.length || stageF.length || priorityF.length || assigneeF.length || dueF);
  const clearFilters = () =>
    setParams({ q: null, board: null, stage: null, priority: null, assignee: null, due: null });

  // ── Derived data ──
  const today = dayString(new Date());
  const weekEnd = dayString(new Date(Date.now() + 7 * 864e5));
  const myTasks = useMemo(() => tasks.filter((t) => user && t.assigneeId === user.id), [tasks, user]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tab === "mine" ? myTasks : tasks).filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false;
      if (boardF.length && !boardF.includes(t.boardId)) return false;
      if (stageF.length && !stageF.includes(t.stage)) return false;
      if (priorityF.length && !priorityF.includes(t.priority)) return false;
      if (assigneeF.length && !assigneeF.includes(t.assigneeId || "none")) return false;
      if (dueF) {
        const g = groupOf(t, today, weekEnd);
        if (dueF === "overdue" && g !== "overdue") return false;
        if (dueF === "week" && g !== "week") return false;
        if (dueF === "none" && t.endDate) return false;
      }
      return true;
    });
  }, [tab, myTasks, tasks, query, boardF, stageF, priorityF, assigneeF, dueF, today, weekEnd]);

  const grouped = useMemo(() => {
    const out: Record<GroupKey, OrgTask[]> = { overdue: [], week: [], later: [], none: [], done: [] };
    for (const t of visible) out[groupOf(t, today, weekEnd)].push(t);
    for (const k of Object.keys(out) as GroupKey[]) {
      out[k].sort((a, b) => compare(a, b, sortKey) * sortDir || compare(a, b, "due"));
    }
    return out;
  }, [visible, today, weekEnd, sortKey, sortDir]);

  const boardOptions = boards.length
    ? boards
    : Array.from(new Map(tasks.map((t) => [t.boardId, { id: t.boardId, title: t.boardTitle }])).values());

  if (loading || (!loaded && !error)) return <TasksPageSkeleton />;

  return (
    <div className="p-6 lg:p-8 min-h-full bg-[#F8F9FC] dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListChecks size={22} className="text-indigo-500" />
            Tasks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Everything on your plate, across all boards.</p>
        </div>
        {canEditTasks && (
          <button
            onClick={() => setCreating(true)}
            disabled={boardOptions.length === 0}
            title={boardOptions.length === 0 ? "Create a board first" : undefined}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          Couldn&apos;t load tasks: {error}
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1" role="tablist">
          {(["mine", "all"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setParams({ tab: t === "mine" ? null : "all" })}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition ${
                tab === t
                  ? "bg-indigo-500 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {t === "mine" ? "My tasks" : "All tasks"}
              <span className={`ml-1.5 text-xs ${tab === t ? "opacity-80" : "text-slate-400"}`}>
                {t === "mine" ? myTasks.length : tasks.length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setParams({ q: e.target.value || null })}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <FilterMenu label="Board" selected={boardF} onChange={(v) => setParams({ board: v })}
          options={boardOptions.map((b) => ({ value: b.id, label: b.title }))} />
        <FilterMenu label="Stage" selected={stageF} onChange={(v) => setParams({ stage: v })}
          options={STAGES.map((s) => ({ value: s, label: s }))} />
        <FilterMenu label="Priority" selected={priorityF} onChange={(v) => setParams({ priority: v })}
          options={["high", "medium", "low"].map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))} />
        {tab === "all" && (
          <FilterMenu label="Assignee" selected={assigneeF} onChange={(v) => setParams({ assignee: v })}
            options={[{ value: "none", label: "Unassigned" }, ...members.map((m) => ({ value: m.id, label: m.name }))]} />
        )}
        <FilterMenu label="Due" single selected={dueF ? [dueF] : []} onChange={(v) => setParams({ due: v[0] ?? null })}
          options={[
            { value: "overdue", label: "Overdue" },
            { value: "week", label: "Due this week" },
            { value: "none", label: "No due date" },
          ]} />
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <EmptyState tab={tab} filtered={hasFilters} totalAll={tasks.length}
          onClear={clearFilters} onShowAll={() => setParams({ tab: "all" })} />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_110px_90px_minmax(0,1.1fr)_90px] gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {([
              ["title", "Title"], ["board", "Board"], ["stage", "Stage"],
              ["priority", "Priority"], ["assignee", "Assignee"], ["due", "Due"],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setSort(key)}
                className="flex items-center gap-1 text-left hover:text-slate-800 dark:hover:text-slate-100 transition"
                aria-label={`Sort by ${label}`}>
                {label}
                {sortKey === key && (sortDir === 1 ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
              </button>
            ))}
          </div>

          {GROUPS.map((g) => {
            const rows = grouped[g.key];
            if (rows.length === 0) return null;
            const isCollapsed = collapsed[g.key];
            return (
              <section key={g.key}>
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
                  aria-expanded={!isCollapsed}
                  className="w-full flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold uppercase tracking-wide transition"
                >
                  <ChevronRight size={14} className={`text-slate-400 transition ${isCollapsed ? "" : "rotate-90"}`} />
                  <span className={g.key === "overdue" ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}>
                    {g.label}
                  </span>
                  <span className="text-slate-400 font-medium">· {rows.length}</span>
                </button>
                {!isCollapsed && rows.map((t) => (
                  <TaskRow key={t.id} task={t} overdue={g.key === "overdue"} onOpen={() => setOpenTask(t)} />
                ))}
              </section>
            );
          })}
        </div>
      )}

      {/* Edit (or view, for viewers) */}
      <TaskModal
        isOpen={!!openTask}
        onClose={() => setOpenTask(null)}
        task={openTask}
        boardId={openTask?.boardId}
        boardName={openTask?.boardTitle}
        members={members}
        actions={{ createTask, updateTask, deleteTask }}
      />
      {/* Create — board chosen in the modal */}
      <TaskModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        boardId={boardF.length === 1 ? boardF[0] : undefined}
        members={members}
        boardOptions={boardOptions}
        actions={{ createTask, updateTask, deleteTask }}
      />
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────

function TaskRow({ task: t, overdue, onOpen }: { task: OrgTask; overdue: boolean; onOpen: () => void }) {
  const color = boardColor(t.boardId);
  const boardBadge = (
    <Link
      href={`/dashboard/boards/${t.boardId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 max-w-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white truncate"
      title={`Open ${t.boardTitle}`}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="truncate">{t.boardTitle || "—"}</span>
    </Link>
  );
  const assignee = t.assignee ? (
    <span className="flex items-center gap-1.5 min-w-0 text-sm text-slate-700 dark:text-slate-200">
      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center uppercase">
        {t.assignee[0]}
      </span>
      <span className="truncate">{t.assignee}</span>
    </span>
  ) : (
    <span className="text-sm text-slate-400">Unassigned</span>
  );
  const due = (
    <span className={`flex items-center gap-1 text-sm ${overdue ? "text-red-600 dark:text-red-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
      {formatDue(t.endDate)}
      {overdue && <AlertTriangle size={12} />}
    </span>
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      className="border-b border-slate-100 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700/40 cursor-pointer transition"
    >
      {/* Desktop: table row */}
      <div className="hidden md:grid grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_110px_90px_minmax(0,1.1fr)_90px] gap-3 items-center px-4 py-3">
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</span>
        {boardBadge}
        <span className={`justify-self-start text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_PILL[t.stage] ?? ""}`}>{t.stage}</span>
        <span className={`justify-self-start text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_PILL[t.priority] ?? ""}`}>{t.priority}</span>
        {assignee}
        {due}
      </div>
      {/* Mobile: stacked card */}
      <div className="md:hidden px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</span>
          {due}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {boardBadge}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_PILL[t.stage] ?? ""}`}>{t.stage}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_PILL[t.priority] ?? ""}`}>{t.priority}</span>
        </div>
        {assignee}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, filtered, totalAll, onClear, onShowAll }: {
  tab: "mine" | "all"; filtered: boolean; totalAll: number; onClear: () => void; onShowAll: () => void;
}) {
  let title = "No tasks yet";
  let body: React.ReactNode = (
    <>Tasks you add to any board show up here. <Link href="/dashboard/boards" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Go to boards</Link></>
  );
  let action: React.ReactNode = null;
  if (filtered) {
    title = "No tasks match these filters";
    body = "Try removing a filter or changing your search.";
    action = <button onClick={onClear} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Clear filters</button>;
  } else if (tab === "mine") {
    title = "You're all caught up";
    body = totalAll > 0 ? "Nothing is assigned to you right now." : "Nothing is assigned to you yet.";
    if (totalAll > 0) action = <button onClick={onShowAll} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View all {totalAll} tasks</button>;
  }
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
        <ListChecks size={22} className="text-indigo-500" />
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
