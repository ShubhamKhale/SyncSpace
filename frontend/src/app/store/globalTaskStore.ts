// store/globalTaskStore.ts
import { create } from "zustand";
import { Task } from "./useTaskStore"; // adjust path if Task type is defined elsewhere

interface GlobalTask {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

export const useGlobalTaskStore = create<GlobalTask>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),
}));
