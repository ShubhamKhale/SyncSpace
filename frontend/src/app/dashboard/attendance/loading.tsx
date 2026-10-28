import { Skeleton } from "@/app/components/Skeleton";

export default function AttendanceLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-screen">
      <Skeleton className="h-7 w-44 mb-2" />
      <Skeleton className="h-4 w-72 mb-7" />

      <Skeleton className="h-3 w-20 mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <Skeleton className="h-3 w-24 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/60 rounded-lg p-3 space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Skeleton className="h-3 w-28 mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-10" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-700/50">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" type="circle" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
