"use client";

import { useGlobalTaskStore } from "../store/globalTaskStore";


export default function GlobalTaskDrawer() {
  const selectedTask = useGlobalTaskStore((state) => state.selectedTask);

  if (!selectedTask) return null;   

  return (   
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-lg z-[9999]">
      <div className="p-4">
        <h2 className="text-xl font-bold">{selectedTask.title}</h2>
        <p className="mt-2">{selectedTask.description}</p>
      </div>
    </div>
  );
}
