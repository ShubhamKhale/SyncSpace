import { Skeleton } from "@/app/components/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <Skeleton className="h-9 w-9 flex-shrink-0" type="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-16 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
