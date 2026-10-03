import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export type Priority = "high" | "medium" | "low";

export interface Subtask {
  id: string; // "" for a subtask not yet saved — the backend assigns one
  text: string;
  completed: boolean;
}

/** A member of the board's org, as returned by GET /api/boards/:id/members. */
export interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

export interface CreateTaskPayload {
  title: string;
  stage: string;
  priority?: Priority;
  description?: string;
  assigneeId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (sent as due_date)
  timeEstimate?: string;
  tags?: string[];
  referenceLink?: string;
  flowDiagramLink?: string;
  subtasks?: Subtask[];
}

/** Partial update for PATCH /api/tasks/:id. Undefined = unchanged, "" clears a date / unassigns. */
export type TaskPatch = Partial<
  Pick<
    BoardTask,
    | "title" | "description" | "priority" | "stage" | "assigneeId"
    | "startDate" | "endDate" | "tags" | "timeEstimate"
    | "referenceLink" | "flowDiagramLink" | "subtasks"
  >
>;

export interface BoardTask {
  id: string;
  stage: string;
  title: string;
  description: string;
  tags: string[];
  startDate: string; // YYYY-MM-DD or ""
  endDate: string;   // YYYY-MM-DD or "" (backend: due_date)
  assigneeId: string;
  assignee: string;  // display name resolved from board members, "" if unassigned
  priority: Priority;
  timeEstimate: string;
  referenceLink: string;
  flowDiagramLink: string;
  subtasks: Subtask[];
  comments: number;
  attachments: number;
  flagged: boolean;
}

/** RFC3339 (or anything Date-parsable) → YYYY-MM-DD, the format every date widget uses. */
function toDay(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  return raw.slice(0, 10);
}

/** YYYY-MM-DD → RFC3339 at UTC midnight, as the backend requires. */
function toRfc3339(day: string): string {
  return `${day}T00:00:00Z`;
}

function mapTask(raw: Record<string, unknown>, members: BoardMember[]): BoardTask {
  const assigneeId = (raw.assignee_id ?? "") as string;
  return {
    id: raw.id as string,
    stage: raw.stage as string,
    title: raw.title as string,
    description: (raw.description ?? "") as string,
    tags: (raw.tags ?? []) as string[],
    startDate: toDay(raw.start_date),
    endDate: toDay(raw.due_date),
    assigneeId,
    assignee: members.find((m) => m.id === assigneeId)?.name ?? "",
    priority: (raw.priority ?? "medium") as Priority,
    timeEstimate: (raw.time_estimate ?? "") as string,
    referenceLink: (raw.reference_link ?? "") as string,
    flowDiagramLink: (raw.flow_diagram_link ?? "") as string,
    subtasks: (raw.subtasks ?? []) as Subtask[],
    comments: 0,
    attachments: Array.isArray(raw.attachments) ? raw.attachments.length : 0,
    flagged: false,
  };
}

/** Converts a frontend patch into the backend's snake_case PATCH body. */
function toPatchBody(p: TaskPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (p.title !== undefined) body.title = p.title;
  if (p.description !== undefined) body.description = p.description;
  if (p.priority !== undefined) body.priority = p.priority;
  if (p.stage !== undefined) body.stage = p.stage;
  if (p.assigneeId !== undefined) body.assignee_id = p.assigneeId;
  if (p.startDate !== undefined) {
    if (p.startDate) body.start_date = toRfc3339(p.startDate);
    else body.clear_start_date = true;
  }
  if (p.endDate !== undefined) {
    if (p.endDate) body.due_date = toRfc3339(p.endDate);
    else body.clear_due_date = true;
  }
  if (p.tags !== undefined) body.tags = p.tags;
  if (p.timeEstimate !== undefined) body.time_estimate = p.timeEstimate;
  if (p.referenceLink !== undefined) body.reference_link = p.referenceLink;
  if (p.flowDiagramLink !== undefined) body.flow_diagram_link = p.flowDiagramLink;
  if (p.subtasks !== undefined) body.subtasks = p.subtasks;
  return body;
}

type SaveState = "idle" | "loading" | "success" | "error";

interface BoardTaskState {
  tasks: BoardTask[];
  members: BoardMember[];
  loading: boolean;
  error: string | null;
  saveStates: Record<string, SaveState>;
  currentBoardId: string | null;

  fetchTasks: (boardId: string) => Promise<void>;
  createTask: (boardId: string, payload: CreateTaskPayload) => Promise<void>;
  /** Applies a partial update; throws on failure after rolling back. */
  updateTask: (taskId: string, patch: TaskPatch) => Promise<void>;
  /** Deletes a task; throws on failure after restoring it. */
  deleteTask: (taskId: string) => Promise<void>;
  setTasks: (tasks: BoardTask[]) => void;
  updateTaskTitle: (taskId: string, title: string) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: Priority) => Promise<void>;
  updateTaskDates: (taskId: string, startDate: string, endDate: string) => Promise<void>;
  updateTaskAssignee: (taskId: string, assigneeId: string) => Promise<void>;
  updateTaskStage: (taskId: string, stage: string) => Promise<void>;
  setSaveState: (field: string, state: SaveState) => void;
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

export const useBoardTaskStore = create<BoardTaskState>()(
  devtools((set, get) => {
    /** Applies the patch locally (resolving the assignee name) and returns the new task. */
    const applyLocal = (task: BoardTask, patch: TaskPatch): BoardTask => {
      const next = { ...task, ...patch };
      if (patch.assigneeId !== undefined) {
        next.assignee = get().members.find((m) => m.id === patch.assigneeId)?.name ?? "";
      }
      return next;
    };

    /** Shared path for the inline single-field editors: optimistic update + save-state badge. */
    const saveField = async (taskId: string, field: string, patch: TaskPatch) => {
      const key = `${taskId}-${field}`;
      set((s) => ({ saveStates: { ...s.saveStates, [key]: "loading" } }));
      try {
        await get().updateTask(taskId, patch);
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "success" } }));
        resetKey(set, key);
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, [key]: "error" } }));
      }
    };

    return {
      tasks: [],
      members: [],
      loading: false,
      error: null,
      saveStates: {},
      currentBoardId: null,

      fetchTasks: async (boardId: string) => {
        set({ loading: true, error: null, currentBoardId: boardId });
        try {
          // Members are needed to resolve assignee IDs to names. A members
          // failure shouldn't hide the tasks, so it falls back to [].
          const [raw, members] = await Promise.all([
            apiFetch<Record<string, unknown>[]>(`/api/boards/${boardId}/tasks`),
            apiFetch<BoardMember[]>(`/api/boards/${boardId}/members`).catch(() => [] as BoardMember[]),
          ]);
          const memberList = Array.isArray(members) ? members : [];
          const arr = Array.isArray(raw) ? raw : [];
          set({ members: memberList, tasks: arr.map((t) => mapTask(t, memberList)), loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      createTask: async (boardId: string, payload: CreateTaskPayload) => {
        const body: Record<string, unknown> = {
          title: payload.title,
          stage: payload.stage,
          priority: payload.priority,
          description: payload.description,
          assignee_id: payload.assigneeId,
          start_date: payload.startDate ? toRfc3339(payload.startDate) : undefined,
          due_date: payload.endDate ? toRfc3339(payload.endDate) : undefined,
          time_estimate: payload.timeEstimate,
          tags: payload.tags,
          reference_link: payload.referenceLink,
          flow_diagram_link: payload.flowDiagramLink,
          subtasks: payload.subtasks,
        };
        try {
          const raw = await apiFetch<Record<string, unknown>>(
            `/api/boards/${boardId}/tasks`,
            { method: "POST", body: JSON.stringify(body) }
          );
          const task = mapTask(raw, get().members);
          set((s) => ({ tasks: [...s.tasks, task] }));
        } catch (err) {
          set({ error: (err as Error).message });
          throw err;
        }
      },

      updateTask: async (taskId: string, patch: TaskPatch) => {
        const prev = get().tasks.find((t) => t.id === taskId);
        if (!prev) return;
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? applyLocal(t, patch) : t)) }));
        try {
          const raw = await apiFetch<Record<string, unknown>>(`/api/tasks/${taskId}`, {
            method: "PATCH",
            body: JSON.stringify(toPatchBody(patch)),
          });
          // Reconcile with the server's copy (e.g. generated subtask IDs).
          if (raw && typeof raw === "object" && raw.id) {
            const saved = mapTask(raw, get().members);
            set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? saved : t)) }));
          }
        } catch (err) {
          set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) }));
          throw err;
        }
      },

      deleteTask: async (taskId: string) => {
        const prevTasks = get().tasks;
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
        try {
          await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        } catch (err) {
          set({ tasks: prevTasks });
          throw err;
        }
      },

      setTasks: (tasks) => set({ tasks }),

      updateTaskTitle: (taskId, title) => saveField(taskId, "title", { title }),
      updateTaskPriority: (taskId, priority) => saveField(taskId, "priority", { priority }),
      updateTaskDates: (taskId, startDate, endDate) =>
        saveField(taskId, "dates", { startDate, endDate }),
      updateTaskAssignee: (taskId, assigneeId) =>
        saveField(taskId, "assignee", { assigneeId }),

      updateTaskStage: async (taskId: string, stage: string) => {
        const key = `${taskId}-stage`;
        const boardId = get().currentBoardId;
        const prev = get().tasks.find((t) => t.id === taskId);
        // Optimistic so the card lands in its new column immediately on drop.
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, stage } : t)),
          saveStates: { ...s.saveStates, [key]: "loading" },
        }));
        try {
          await apiFetch(
            `/api/tasks/${taskId}/stage${boardId ? `?board_id=${boardId}` : ""}`,
            {
              method: "PATCH",
              body: JSON.stringify({ stage, position: 0 }),
            }
          );
          set((s) => ({ saveStates: { ...s.saveStates, [key]: "success" } }));
          resetKey(set, key);
        } catch {
          set((s) => ({
            tasks: prev ? s.tasks.map((t) => (t.id === taskId ? prev : t)) : s.tasks,
            saveStates: { ...s.saveStates, [key]: "error" },
          }));
        }
      },

      setSaveState: (field, state) =>
        set((s) => ({ saveStates: { ...s.saveStates, [field]: state } })),
    };
  })
);
