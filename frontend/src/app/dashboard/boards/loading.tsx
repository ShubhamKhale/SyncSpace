import { Skeleton } from "@/app/components/Skeleton";

export default function BoardsLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" type="rect" />
          <Skeleton className="h-9 w-9 rounded-lg" type="rect" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Board grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="h-36 w-full rounded-none" type="rect" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
