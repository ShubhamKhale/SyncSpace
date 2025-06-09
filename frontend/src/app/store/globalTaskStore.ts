import { create } from "zustand";
import { Task } from "./useTaskStore"; 

interface GlobalTask {
  selectedTaskListTitle: string | null;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  setSelectedTaskListTitle: (title: string | null) => void;
}      

export const useGlobalTaskStore = create<GlobalTask>((set) => ({
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task }),     
  selectedTaskListTitle: null,
  setSelectedTaskListTitle: (title) => set({ selectedTaskListTitle: title }),
}));
