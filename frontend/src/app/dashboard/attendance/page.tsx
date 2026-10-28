"use client";
import { useEffect, useState, useRef } from "react";
import { Clock, CheckCircle2, XCircle, Users, AlertCircle, Loader2 } from "lucide-react";
import { useAttendanceStore, type AttendanceStatus } from "@/app/store/useAttendanceStore";
import { useUserStore } from "@/app/store/useUserStore";
import { getInitials } from "@/app/store/useUserStore";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatHours(h: number | null | undefined): string {
  if (h == null) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function elapsedSince(iso: string | null | undefined): string {
  if (!iso) return "00:00:00";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  checked_in:  "bg-emerald-500",
  checked_out: "bg-slate-400",
  absent:      "bg-slate-400",
};

const STATUS_BG: Record<AttendanceStatus, string> = {
  checked_in:  "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
  checked_out: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  absent:      "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  checked_in:  "Checked In",
  checked_out: "Checked Out",
  absent:      "Absent",
};

const LEAVE_DOT = "bg-amber-500";
const LEAVE_BG  = "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";

// ── sub-components ────────────────────────────────────────────────────────────

function StatusDot({ status, isLeave = false }: { status: AttendanceStatus; isLeave?: boolean }) {
  const cls = isLeave ? LEAVE_DOT : STATUS_COLOR[status];
  return (
    <span className="relative inline-flex items-center justify-center w-3 h-3 flex-shrink-0">
      <span className={`w-2.5 h-2.5 rounded-full ${cls} block`} />
      {(status === "checked_in" || isLeave) && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${cls} opacity-40 animate-ping`} />
      )}
    </span>
  );
}

function Avatar({ name, color = "bg-indigo-500" }: { name: string; color?: string }) {
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-indigo-500","bg-emerald-500","bg-amber-500","bg-rose-500",
  "bg-violet-500","bg-cyan-500","bg-pink-500","bg-teal-500",
];
function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  const { user } = useUserStore();
  const {
    my, team,
    myLoading, teamLoading, checkInProgress,
    fetchMy, fetchTeam, checkIn, checkOut,
  } = useAttendanceStore();

  const [tick, setTick] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    fetchMy();
    if (isAdmin) fetchTeam();
  }, [isAdmin]); // eslint-disable-line

  // live timer
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // focus note textarea when it opens
  useEffect(() => {
    if (noteOpen) noteRef.current?.focus();
  }, [noteOpen]);

  const status = my?.status ?? "absent";
  const log    = my?.log ?? null;
  const elapsed = status === "checked_in" ? elapsedSince(log?.check_in_at) : null;

  // weekly progress (rough — hours today vs 8h)
  const todayHours = elapsed
    ? (() => {
        const [h, m, s] = elapsed.split(":").map(Number);
        return h + m / 60 + s / 3600;
      })()
    : (log?.hours_worked ?? 0);
  const progressPct = Math.min(100, (todayHours / 8) * 100);

  async function handleCheckIn() {
    if (noteOpen) {
      await checkIn(note.trim() || undefined);
      setNote("");
      setNoteOpen(false);
    } else {
      setNoteOpen(true);
    }
  }

  async function handleCheckOut() {
    await checkOut();
  }

  void tick; // suppress lint — used to re-render timer

  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your work hours and monitor team presence
        </p>
      </div>

      {/* ── My Status ─────────────────────────────────────────────────── */}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
        My Status
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Check-in card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-4">
          {myLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-700/50 rounded" />
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  status === "checked_in" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-700"
                }`}>
                  <Clock size={22} className={status === "checked_in" ? "text-emerald-500" : "text-slate-400"} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    Time Today
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-slate-800 dark:text-slate-100 leading-none">
                    {elapsed ?? formatHours(log?.hours_worked)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <StatusDot status={status} />
                    <span>
                      {STATUS_LABEL[status]}
                      {status === "checked_in" && log?.check_in_at && (
                        <> · since {formatTime(log.check_in_at)}</>
                      )}
                      {status === "checked_out" && log?.check_out_at && (
                        <> · checked out {formatTime(log.check_out_at)}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5">
                  <span>Today&apos;s progress</span>
                  <span>{formatHours(todayHours)} / 8h target</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Note input (shown when checking in) */}
              {noteOpen && (
                <div className="space-y-2">
                  <textarea
                    ref={noteRef}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Optional note (e.g. working from home)"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                  <button
                    onClick={() => setNoteOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* CTA */}
              {status === "checked_in" ? (
                <button
                  disabled={checkInProgress}
                  onClick={handleCheckOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition disabled:opacity-60"
                >
                  {checkInProgress ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Check Out
                </button>
              ) : (
                <button
                  disabled={checkInProgress}
                  onClick={handleCheckIn}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition disabled:opacity-60"
                >
                  {checkInProgress ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {noteOpen ? "Confirm Check In" : "Check In"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Today's snapshot card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            My Record
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Check-in",   value: formatTime(log?.check_in_at)  },
              { label: "Check-out",  value: formatTime(log?.check_out_at) },
              { label: "Total Hours",value: status === "checked_in" ? formatHours(todayHours) : formatHours(log?.hours_worked) },
              { label: "Status",     value: STATUS_LABEL[status]          },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-700/60 rounded-lg p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-base font-bold text-slate-700 dark:text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team Overview (admin/owner) ───────────────────────────────── */}
      {isAdmin && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Team Overview
            </p>
            <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded">
              Admin / Owner
            </span>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {teamLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 animate-pulse">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                ))
              : [
                  { label: "Checked In",  value: team?.checked_in ?? 0, color: "text-emerald-500" },
                  { label: "On Leave",    value: team?.on_leave   ?? 0, color: "text-amber-500"   },
                  { label: "Absent",      value: team?.absent     ?? 0, color: "text-slate-400"   },
                  { label: "Total",       value: team?.total      ?? 0, color: "text-indigo-500"  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-3">
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                  </div>
                ))
            }
          </div>

          {/* Member table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Member</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Check-in</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Check-out</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 animate-pulse">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" /><div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></div></td>
                        <td className="px-4 py-3"><div className="h-5 w-20 bg-slate-100 dark:bg-slate-700 rounded-full" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-3 w-12 bg-slate-100 dark:bg-slate-700 rounded" /></td>
                      </tr>
                    ))
                  ) : team?.members?.length ? (
                    team.members.map((m) => {
                      const isLeave = m.status === "absent" && false; // server sets on_leave via status field if needed
                      return (
                        <tr key={m.user_id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={m.name} color={colorFor(m.user_id)} />
                              <div>
                                <p className="font-medium text-slate-800 dark:text-slate-100">{m.name}</p>
                                <p className="text-xs text-slate-400 capitalize">{m.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isLeave ? LEAVE_BG : STATUS_BG[m.status]}`}>
                              <StatusDot status={m.status} isLeave={isLeave} />
                              {isLeave ? "On Leave" : STATUS_LABEL[m.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{formatTime(m.check_in_at)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{formatTime(m.check_out_at)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">{formatHours(m.hours_worked)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                          <Users size={28} />
                          <p className="text-sm">No team data yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* non-admin: no team section */}
      {!isAdmin && !myLoading && my === null && (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-300 dark:text-slate-600">
          <AlertCircle size={28} />
          <p className="text-sm">Could not load attendance data</p>
        </div>
      )}
    </div>
  );
}
