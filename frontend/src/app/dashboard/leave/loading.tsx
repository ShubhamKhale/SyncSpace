import { Skeleton } from "@/app/components/Skeleton";

export default function LeaveLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-screen">
      <div className="flex items-start justify-between mb-7">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 mb-6">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Balance cards */}
      <Skeleton className="h-3 w-28 mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3 animate-pulse">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-4">
              <Skeleton className="h-7 w-8" /><Skeleton className="h-7 w-8" /><Skeleton className="h-7 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Request history table */}
      <Skeleton className="h-3 w-24 mb-3" />
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
