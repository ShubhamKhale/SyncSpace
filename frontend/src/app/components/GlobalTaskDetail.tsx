"use client";

import { useGlobalTaskStore } from "../store/globalTaskStore";


export default function GlobalTaskDrawer() {
  const selectedTask = useGlobalTaskStore((state) => state.selectedTask);

  if (!selectedTask) return null;   

  return (   
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 shadow-xl z-[9999]">
      <div className="p-5">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{selectedTask.title}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedTask.description}</p>
      </div>
    </div>
  );
}
