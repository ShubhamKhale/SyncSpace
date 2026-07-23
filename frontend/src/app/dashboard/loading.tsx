import { Skeleton } from "@/app/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 rounded-lg shadow-md flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-10" />
            </div>
            <Skeleton className="h-10 w-10" type="rect" />
          </div>
        ))}
      </div>

      {/* Chart grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-52 w-full" type="rect" />
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex items-center justify-between gap-3">
                <Skeleton className="h-10 w-10" type="rect" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
