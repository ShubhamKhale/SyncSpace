import { BoardTaskFlowSkeleton } from "@/app/components/Skeleton";

export default function TasksLoading() {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 h-screen flex flex-col overflow-hidden">
      <BoardTaskFlowSkeleton />
    </div>
  );
}
