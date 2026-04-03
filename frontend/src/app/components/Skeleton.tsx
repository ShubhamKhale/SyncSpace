import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
  type?: "text" | "circle" | "rect";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "w-full h-4",
  count = 1,
  type = "text",
}) => {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse rounded";

  if (type === "circle") {
    return (
      <div className={`${baseClasses} rounded-full ${className}`}></div>
    );
  }

  if (type === "rect") {
    return (
      <div className={`${baseClasses} rounded-md ${className}`}></div>
    );
  }

  // text type
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${className} ${
            i === count - 1 ? "w-4/5" : "w-full"
          }`}
        ></div>
      ))}
    </div>
  );
};

export const BoardSidebarSkeleton: React.FC = () => {
  return (
    <aside className="flex flex-col justify-between w-68 h-screen border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {/* Top Section */}
      <div>
        <div className="px-5 py-6 text-[#6B7280]">
          {/* Title Skeleton */}
          <Skeleton className="h-5 w-full mb-4" />

          {/* Board Details Skeleton */}
          <div className="space-y-3 mb-6">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Tags Skeleton */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Skeleton className="h-8 w-full rounded-3xl" />
            <Skeleton className="h-8 w-full rounded-3xl" />
            <Skeleton className="h-8 w-full rounded-3xl" />
          </div>

          {/* Board Health Skeleton */}
          <div className="mt-8">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="mt-8">
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Section Skeleton */}
      <div className="px-5 py-4 flex items-center space-x-4 border-t border-gray-200 dark:border-slate-700">
        <Skeleton className="h-10 w-10" type="circle" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </aside>
  );
};

export const BoardTaskFlowSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar skeleton */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
      {/* Kanban columns skeleton */}
      <div className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-900 py-6 px-6 flex gap-4">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="bg-white dark:bg-slate-800 rounded-lg w-56 flex-shrink-0 p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <Skeleton className="h-5 w-24 mb-3" />
            {[1, 2, 3].map((card) => (
              <div key={card} className="bg-slate-50 dark:bg-slate-700 rounded-md p-3 space-y-2 border border-slate-200 dark:border-slate-600">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LinkedResourcesSkeleton: React.FC = () => {
  return (
    <div className="w-76 space-y-6 border-l border-gray-200 dark:border-slate-700 p-4">
      {/* Description Section */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>

      {/* Documentation Section */}
      <div>
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8" type="rect" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links Section */}
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Skeleton className="h-8 w-8" type="rect" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
