import {
  BoardSidebarSkeleton,
  BoardTaskFlowSkeleton,
  LinkedResourcesSkeleton,
} from "@/app/components/Skeleton";

export default function BoardLoading() {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 h-screen flex overflow-hidden rounded-2xl shadow-lg">
      {/* Left Sidebar Skeleton */}
      <div className="w-64 flex-shrink-0">
        <BoardSidebarSkeleton />
      </div>

      {/* Main Content Skeleton */}
      <div className="flex flex-col flex-1 bg-slate-50 dark:bg-slate-800 overflow-hidden">
        <BoardTaskFlowSkeleton />
      </div>

      {/* Right Sidebar Skeleton */}
      <div className="w-72 flex-shrink-0">
        <LinkedResourcesSkeleton />
      </div>
    </div>
  );
}
