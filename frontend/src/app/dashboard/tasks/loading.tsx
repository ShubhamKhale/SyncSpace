import React from "react";

/** Skeleton for the org-wide Tasks page (also used as its Suspense fallback). */
export function TasksPageSkeleton() {
  return (
    <div className="p-6 lg:p-8 min-h-full bg-[#F8F9FC] dark:bg-slate-900" aria-busy="true" aria-label="Loading tasks">
      <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
      <div className="flex justify-between gap-3 mb-3">
        <div className="h-10 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-2 mb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
            <div className="h-4 flex-[2.4] bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 flex-[1.3] bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TasksLoading() {
  return <TasksPageSkeleton />;
}
