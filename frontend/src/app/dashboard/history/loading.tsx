import { Skeleton } from "@/app/components/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      <Skeleton className="h-7 w-40 mb-6" />
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 space-y-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 flex-shrink-0" type="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3 w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
