"use client";
import HistoryIcon from "@/app/icons/HistoryIcon";
import { formatTimeAgo } from "@/utils/timeUtils";
import { apiFetch } from "@/lib/api";
import React, { useEffect, useState } from "react";

interface ActivityLog {
  id: string;
  entity_type: "board" | "task" | "org" | string;
  entity_id: string;
  actor_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_name: string;
}

const ENTITY_LABEL: Record<string, string> = {
  board: "board",
  task: "task",
  org: "organization",
};

const PAGE_SIZE = 20;

const HistoryPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch<{ logs: ActivityLog[]; total: number }>(
      `/api/activity-logs?limit=${PAGE_SIZE}&offset=${offset}`
    )
      .then((data) => {
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [offset]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="bg-[#F8F9FC] dark:bg-slate-900 min-h-screen pt-6 px-4 md:px-8 lg:px-12 pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Activity History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All actions across your organization</p>
        </div>
        {total > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500">{total} total events</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
          Loading activity…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-24 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <HistoryIcon width={36} height={36} fill="currentColor" />
          <p className="text-sm">No activity yet</p>
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="max-w-2xl">
          {logs.map((log, index) => {
            const epochSec = Math.floor(new Date(log.created_at).getTime() / 1000);
            const entityLabel = ENTITY_LABEL[log.entity_type] ?? log.entity_type;
            const metaName =
              (log.metadata?.name as string) ||
              (log.metadata?.title as string) ||
              (log.metadata?.board_name as string) ||
              null;

            return (
              <div key={log.id} className="flex items-start gap-4">
                {/* Timeline spine */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#EEF2FF] dark:bg-[#6366F1]/20 flex items-center justify-center z-10">
                    <HistoryIcon width={18} height={18} fill="#6366F1" />
                  </div>
                  {index !== logs.length - 1 && (
                    <div className="w-0.5 bg-slate-200 dark:bg-slate-700 flex-1 mt-1 mb-1 min-h-[24px]" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-6 pt-1.5 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-100 leading-snug">
                    <span className="font-semibold">{log.actor_name}</span>
                    <span className="text-slate-500 dark:text-slate-400 mx-1.5">{log.action}</span>
                    <span className="text-slate-500 dark:text-slate-400">{entityLabel}</span>
                    {metaName && (
                      <span className="ml-1.5 font-medium text-[#6366F1]">{metaName}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatTimeAgo(epochSec)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setOffset(o => o + PAGE_SIZE)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
