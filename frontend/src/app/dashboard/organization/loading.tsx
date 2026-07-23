import { Skeleton } from "@/app/components/Skeleton";

export default function OrganizationLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Tab bar */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg" type="rect" />
        ))}
      </div>
      {/* Members list */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-10 w-10" type="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
