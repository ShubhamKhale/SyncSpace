import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Priority = "high" | "medium" | "low";

export interface BoardTask {
  id: string;
  stage: string;
  title: string;
  tags: string[];
  startDate: string;
  endDate: string;
  assignee: string;
  priority: Priority;
  comments: number;
  attachments: number;
  flagged: boolean;
}

interface BoardTaskState {
  tasks: BoardTask[];
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;

  // Actions
  setTasks: (tasks: BoardTask[]) => void;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: Priority) => Promise<void>;
  updateTaskDates: (
    taskId: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  updateTaskAssignee: (taskId: string, assignee: string) => Promise<void>;
  updateTaskStage: (taskId: string, stage: string) => Promise<void>;
  setSaveState: (
    field: string,
    state: "idle" | "loading" | "success" | "error"
  ) => void;
}

export const useBoardTaskStore = create<BoardTaskState>()(
  devtools((set) => ({
    tasks: [],
    saveStates: {},

    setTasks: (tasks) => set({ tasks }),

    updateTaskTitle: async (taskId: string, title: string) => {
      set((state) => ({
        saveStates: { ...state.saveStates, [`${taskId}-title`]: "loading" },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, title } : t
          ),
          saveStates: {
            ...state.saveStates,
            [`${taskId}-title`]: "success",
          },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: {
                ...state.saveStates,
                [`${taskId}-title`]: "idle",
              },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: { ...state.saveStates, [`${taskId}-title`]: "error" },
        }));
      }
    },

    updateTaskPriority: async (taskId: string, priority: Priority) => {
      set((state) => ({
        saveStates: {
          ...state.saveStates,
          [`${taskId}-priority`]: "loading",
        },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, priority } : t
          ),
          saveStates: {
            ...state.saveStates,
            [`${taskId}-priority`]: "success",
          },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: {
                ...state.saveStates,
                [`${taskId}-priority`]: "idle",
              },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: {
            ...state.saveStates,
            [`${taskId}-priority`]: "error",
          },
        }));
      }
    },

    updateTaskDates: async (
      taskId: string,
      startDate: string,
      endDate: string
    ) => {
      set((state) => ({
        saveStates: {
          ...state.saveStates,
          [`${taskId}-dates`]: "loading",
        },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, startDate, endDate } : t
          ),
          saveStates: {
            ...state.saveStates,
            [`${taskId}-dates`]: "success",
          },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: {
                ...state.saveStates,
                [`${taskId}-dates`]: "idle",
              },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: {
            ...state.saveStates,
            [`${taskId}-dates`]: "error",
          },
        }));
      }
    },

    updateTaskAssignee: async (taskId: string, assignee: string) => {
      set((state) => ({
        saveStates: {
          ...state.saveStates,
          [`${taskId}-assignee`]: "loading",
        },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, assignee } : t
          ),
          saveStates: {
            ...state.saveStates,
            [`${taskId}-assignee`]: "success",
          },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: {
                ...state.saveStates,
                [`${taskId}-assignee`]: "idle",
              },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: {
            ...state.saveStates,
            [`${taskId}-assignee`]: "error",
          },
        }));
      }
    },

    updateTaskStage: async (taskId: string, stage: string) => {
      set((state) => ({
        saveStates: {
          ...state.saveStates,
          [`${taskId}-stage`]: "loading",
        },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, stage } : t
          ),
          saveStates: {
            ...state.saveStates,
            [`${taskId}-stage`]: "success",
          },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: {
                ...state.saveStates,
                [`${taskId}-stage`]: "idle",
              },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: {
            ...state.saveStates,
            [`${taskId}-stage`]: "error",
          },
        }));
      }
    },

    setSaveState: (field, state) =>
      set((prevState) => ({
        saveStates: { ...prevState.saveStates, [field]: state },
      })),
  }))
);
