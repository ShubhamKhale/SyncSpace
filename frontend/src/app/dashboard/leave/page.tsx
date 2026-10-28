"use client";
import { useEffect, useState, useRef } from "react";
import {
  Plus, X, Calendar, AlertTriangle, Loader2,
  CheckCircle2, XCircle, ChevronDown,
} from "lucide-react";
import { useLeaveStore, type LeaveStatus } from "@/app/store/useLeaveStore";
import { useUserStore } from "@/app/store/useUserStore";
import { getInitials } from "@/app/store/useUserStore";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function workingDaysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  let count = 0;
  const d = new Date(s);
  while (d <= e) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

const STATUS_STYLES: Record<LeaveStatus, { badge: string; dot: string }> = {
  pending:  { badge: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",   dot: "bg-amber-500"  },
  approved: { badge: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  denied:   { badge: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400",       dot: "bg-rose-500"   },
};
const STATUS_LABEL: Record<LeaveStatus, string> = { pending: "Pending", approved: "Approved", denied: "Denied" };

const AVATAR_COLORS = [
  "bg-indigo-500","bg-emerald-500","bg-amber-500","bg-rose-500",
  "bg-violet-500","bg-cyan-500","bg-pink-500","bg-teal-500",
];
function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function Avatar({ name, id }: { name: string; id: string }) {
  return (
    <div className={`w-7 h-7 rounded-full ${colorFor(id)} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Request Leave Modal ───────────────────────────────────────────────────────

interface ModalProps {
  onClose: () => void;
}

function RequestLeaveModal({ onClose }: ModalProps) {
  const { types, balances, submitRequest, submitting } = useLeaveStore();
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const balance = balances.find((b) => b.leave_type_id === typeId);
  const remaining = balance ? balance.remaining : null;
  const days = workingDaysBetween(startDate, endDate);
  const overBalance = remaining !== null && days > remaining;

  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!typeId) return setFormError("Select a leave type.");
    if (!startDate || !endDate) return setFormError("Select start and end dates.");
    if (days === 0) return setFormError("End date must be on or after start date.");
    try {
      await submitRequest({ leave_type_id: typeId, start_date: startDate, end_date: endDate, reason });
      onClose();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  // close on overlay click
  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onOverlayClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Request Leave</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Leave type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Leave Type</label>
            <div className="relative">
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
              >
                {types.map((t) => {
                  const bal = balances.find((b) => b.leave_type_id === t.id);
                  const rem = bal ? bal.remaining : null;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name}{rem !== null ? ` — ${rem} day${rem !== 1 ? "s" : ""} remaining` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Computed days */}
          {days > 0 && (
            <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2.5 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Calendar size={14} />
                <span>Duration computed</span>
              </div>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {days} working day{days !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Balance warning */}
          {overBalance && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                {days} days exceeds your remaining {types.find((t) => t.id === typeId)?.name ?? "leave"} balance ({remaining} day{remaining !== 1 ? "s" : ""}).
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly describe the reason for your leave…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {formError && (
            <p className="text-xs text-rose-500">{formError}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

type TeamFilter = "all" | "pending" | "approved" | "denied";

export default function LeavePage() {
  const { user } = useUserStore();
  const {
    types, balances, myRequests, teamRequests,
    loading,
    fetchTypes, fetchBalances, fetchMyRequests, fetchTeamRequests,
    approveRequest, denyRequest,
  } = useLeaveStore();

  const [tab, setTab] = useState<"my" | "team">("my");
  const [modalOpen, setModalOpen] = useState(false);
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const isAdmin = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    fetchTypes();
    fetchBalances();
    fetchMyRequests();
    if (isAdmin) fetchTeamRequests();
  }, [isAdmin]); // eslint-disable-line

  async function handleApprove(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try { await approveRequest(id); } finally { setActionLoading((prev) => ({ ...prev, [id]: false })); }
  }

  async function handleDeny(id: string) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try { await denyRequest(id); } finally { setActionLoading((prev) => ({ ...prev, [id]: false })); }
  }

  const filteredTeam = teamFilter === "all"
    ? teamRequests
    : teamRequests.filter((r) => r.status === teamFilter);

  const pendingCount = teamRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Leave</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage leave requests and team calendar
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition"
        >
          <Plus size={15} />
          Request Leave
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {(["my", "team"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
              tab === t
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {t === "my" ? "My Leave" : (
              <>
                Team Requests
                <span className="text-[9px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Admin
                </span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── My Leave Tab ───────────────────────────────────────────────── */}
      {tab === "my" && (
        <>
          {/* Balance cards */}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Leave Balances
          </p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse space-y-3">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex gap-4"><div className="h-7 w-10 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-7 w-10 bg-slate-200 dark:bg-slate-700 rounded" /><div className="h-7 w-10 bg-slate-200 dark:bg-slate-700 rounded" /></div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {balances.map((b) => {
                const remaining = b.remaining;
                const pct = b.allocated > 0 ? (b.used / b.allocated) * 100 : 0;
                const barColor = pct > 80 ? "bg-rose-500" : pct > 50 ? "bg-amber-500" : "bg-indigo-500";
                return (
                  <div key={b.leave_type_id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-3">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{b.type_name}</p>
                    <div className="flex gap-4">
                      {[
                        { label: "Allocated", value: b.allocated, color: "text-slate-700 dark:text-slate-200" },
                        { label: "Used",      value: b.used,      color: "text-amber-500" },
                        { label: "Remaining", value: remaining,   color: remaining > 0 ? "text-emerald-500" : "text-rose-500" },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                          <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{b.used} of {b.allocated} days used</p>
                    </div>
                  </div>
                );
              })}
              {balances.length === 0 && types.length === 0 && (
                <p className="text-sm text-slate-400 col-span-3">No leave types configured yet.</p>
              )}
            </div>
          )}

          {/* My request history */}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            My Requests
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    {["Type","From","To","Days","Reason","Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myRequests.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                        <Calendar size={28} />
                        <p className="text-sm">No leave requests yet</p>
                        <button onClick={() => setModalOpen(true)} className="text-xs text-indigo-500 hover:underline">Submit your first request</button>
                      </div>
                    </td></tr>
                  ) : (
                    myRequests.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{r.type_name ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(r.start_date)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{fmtDate(r.end_date)}</td>
                        <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{r.days}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{r.reason || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Team Requests Tab ─────────────────────────────────────────── */}
      {tab === "team" && isAdmin && (
        <>
          {/* Pending table */}
          {pendingCount > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Approval</p>
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                        {["Employee","Type","Duration","Days","Reason","Applied","Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {teamRequests.filter((r) => r.status === "pending").map((r) => (
                        <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={r.user_name ?? r.user_id} id={r.user_id} />
                              <span className="font-medium text-slate-800 dark:text-slate-100">{r.user_name ?? r.user_id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.type_name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtDate(r.start_date)} – {fmtDate(r.end_date)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{r.days}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[140px] truncate">{r.reason || "—"}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                disabled={actionLoading[r.id]}
                                onClick={() => handleApprove(r.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition disabled:opacity-50"
                              >
                                {actionLoading[r.id] ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                Approve
                              </button>
                              <button
                                disabled={actionLoading[r.id]}
                                onClick={() => handleDeny(r.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition disabled:opacity-50"
                              >
                                {actionLoading[r.id] ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                Deny
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All requests with filter */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">All Requests</p>
              <div className="flex gap-1.5">
                {(["all","pending","approved","denied"] as TeamFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTeamFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition capitalize ${
                      teamFilter === f
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700"
                        : "border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                      {["Employee","Type","Duration","Days","Status","Applied"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeam.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">No requests found.</td></tr>
                    ) : (
                      filteredTeam.map((r) => (
                        <tr key={r.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={r.user_name ?? r.user_id} id={r.user_id} />
                              <span className="font-medium text-slate-800 dark:text-slate-100">{r.user_name ?? r.user_id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.type_name ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{fmtDate(r.start_date)} – {fmtDate(r.end_date)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{r.days}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-slate-400">{fmtDate(r.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "team" && !isAdmin && (
        <div className="flex flex-col items-center gap-2 py-16 text-slate-300 dark:text-slate-600">
          <Calendar size={28} />
          <p className="text-sm">Team Requests are visible to admins and owners only.</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && <RequestLeaveModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
