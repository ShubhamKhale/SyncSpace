import React from "react";

/** Skeleton for the org-wide Flows page (also used as its Suspense fallback). */
export function FlowsPageSkeleton() {
  return (
    <div className="p-6 lg:p-8 min-h-full bg-[#F8F9FC] dark:bg-slate-900" aria-busy="true" aria-label="Loading flows">
      <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      </div>
      {[1, 2].map((s) => (
        <div key={s} className="mb-8">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FlowsLoading() {
  return <FlowsPageSkeleton />;
}
