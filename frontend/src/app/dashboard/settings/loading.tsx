import { Skeleton } from "@/app/components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      <Skeleton className="h-7 w-32 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
