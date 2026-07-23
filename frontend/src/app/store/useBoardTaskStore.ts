import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export type Priority = "high" | "medium" | "low";

export interface CreateTaskPayload {
  title: string;
  stage: string;
  priority?: Priority;
  description?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  timeEstimate?: number;
  tags?: string[];
}

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

function mapTask(raw: Record<string, unknown>): BoardTask {
  return {
    id: raw.id as string,
    stage: raw.stage as string,
    title: raw.title as string,
    tags: (raw.tags ?? []) as string[],
    startDate: ((raw.startDate ?? raw.start_date) ?? "") as string,
    endDate: ((raw.endDate ?? raw.end_date ?? raw.due_date) ?? "") as string,
    assignee: ((raw.assignee ?? raw.assignee_id) ?? "") as string,
    priority: (raw.priority ?? "medium") as Priority,
    comments: (raw.comments ?? 0) as number,
    attachments: (raw.attachments ?? 0) as number,
    flagged: (raw.flagged ?? false) as boolean,
  };
}

interface BoardTaskState {
  tasks: BoardTask[];
  loading: boolean;
  error: string | null;
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;
  currentBoardId: string | null;

  fetchTasks: (boardId: string) => Promise<void>;
  createTask: (boardId: string, payload: CreateTaskPayload) => Promise<void>;
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

function resetKey(
  set: (fn: (s: BoardTaskState) => Partial<BoardTaskState>) => void,
  key: string,
  ms = 1200
) {
  setTimeout(
    () => set((s) => ({ saveStates: { ...s.saveStates, [key]: "idle" } })),
    ms
  );
}

function patchTask(body: object) {
  return (taskId: string) =>
    apiFetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
}

export const useBoardTaskStore = create<BoardTaskState>()(
  devtools((set, get) => ({
    tasks: [],
    loading: false,
    error: null,
    saveStates: {},
    currentBoardId: null,

    fetchTasks: async (boardId: string) => {
      set({ loading: true, error: null, currentBoardId: boardId });
      try {
        const raw = await apiFetch<Record<string, unknown>[]>(
          `/api/boards/${boardId}/tasks`
        );
        const arr = Array.isArray(raw) ? raw : [];
        set({ tasks: arr.map(mapTask), loading: false });
      } catch (err) {
        set({ error: (err as Error).message, loading: false });
      }
    },

    createTask: async (boardId: string, payload: CreateTaskPayload) => {
      try {
        const raw = await apiFetch<Record<string, unknown>>(
          `/api/boards/${boardId}/tasks`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        const task = mapTask(raw);
        set((s) => ({ tasks: [...s.tasks, task] }));
      } catch (err) {
        set({ error: (err as Error).message });
        throw err;
      }
    },

    setTasks: (tasks) => set({ tasks }),

    updateTaskTitle: async (taskId: string, title: string) => {
      const key = `${taskId}-title`;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await patchTask({ title })(taskId);
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
          saveStates: { ...s.saveStates, [key]: "success" },
        }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    },

    updateTaskPriority: async (taskId: string, priority: Priority) => {
      const key = `${taskId}-priority`;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await patchTask({ priority })(taskId);
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, priority } : t
          ),
          saveStates: { ...s.saveStates, [key]: "success" },
        }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    },

    updateTaskDates: async (
      taskId: string,
      startDate: string,
      endDate: string
    ) => {
      const key = `${taskId}-dates`;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await patchTask({ startDate, endDate })(taskId);
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, startDate, endDate } : t
          ),
          saveStates: { ...s.saveStates, [key]: "success" },
        }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    },

    updateTaskAssignee: async (taskId: string, assignee: string) => {
      const key = `${taskId}-assignee`;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await patchTask({ assignee })(taskId);
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, assignee } : t
          ),
          saveStates: { ...s.saveStates, [key]: "success" },
        }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    },

    updateTaskStage: async (taskId: string, stage: string) => {
      const key = `${taskId}-stage`;
      const boardId = get().currentBoardId;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await apiFetch(
          `/api/tasks/${taskId}/stage${boardId ? `?board_id=${boardId}` : ""}`,
          {
            method: "PATCH",
            body: JSON.stringify({ stage, position: 0 }),
          }
        );
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, stage } : t)),
          saveStates: { ...s.saveStates, [key]: "success" },
        }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    },

    setSaveState: (field, state) =>
      set((s) => ({ saveStates: { ...s.saveStates, [field]: state } })),
  }))
);
