import { Skeleton } from "@/app/components/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-6 bg-gray-100 dark:bg-slate-900 min-h-screen">
      {/* Avatar + name */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex items-center gap-5 mb-6">
        <Skeleton className="h-20 w-20" type="circle" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      {/* Fields */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" type="rect" />
          </div>
        ))}
        <Skeleton className="h-10 w-32 rounded-lg" type="rect" />
      </div>
    </div>
  );
}
