import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch, encryptedFetch } from "@/lib/api";
import {
  mapTask,
  toCreateBody,
  toPatchBody,
  type BoardMember,
  type BoardTask,
  type CreateTaskPayload,
  type TaskPatch,
} from "./useBoardTaskStore";

/** A task from the org-wide list — a BoardTask plus the board it belongs to. */
export interface OrgTask extends BoardTask {
  boardId: string;
  boardTitle: string;
}

export interface BoardOption {
  id: string;
  title: string;
}

interface OrgMemberRaw {
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
}

function toOrgTask(raw: Record<string, unknown>, members: BoardMember[], boards: BoardOption[]): OrgTask {
  const boardId = (raw.board_id ?? "") as string;
  return {
    ...mapTask(raw, members),
    boardId,
    boardTitle: ((raw.board_title as string) || boards.find((b) => b.id === boardId)?.title) ?? "",
  };
}

let inflight: Promise<void> | null = null;

interface OrgTasksState {
  tasks: OrgTask[];
  members: BoardMember[];
  boards: BoardOption[];
  loading: boolean;
  loaded: boolean;
  error: string | null;

  /** Stale-while-revalidate: `loading` only on the first load; later calls refresh silently. */
  fetchAll: () => Promise<void>;
  createTask: (boardId: string, payload: CreateTaskPayload) => Promise<void>;
  updateTask: (taskId: string, patch: TaskPatch) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useOrgTasksStore = create<OrgTasksState>()(
  devtools((set, get) => ({
    tasks: [],
    members: [],
    boards: [],
    loading: false,
    loaded: false,
    error: null,

    fetchAll: () => {
      if (inflight) return inflight;
      if (!get().loaded) set({ loading: true, error: null });

      inflight = (async () => {
        try {
          // Members resolve assignee names and boards feed the board picker
          // (including boards with no tasks yet). Their failures fall back to
          // the cache rather than hiding the tasks.
          const [raw, membersRaw, boardsRaw] = await Promise.all([
            apiFetch<Record<string, unknown>[]>("/api/tasks"),
            apiFetch<OrgMemberRaw[]>("/api/organization/members").catch(() => null),
            encryptedFetch<unknown>("/api/boards", "GET").catch(() => null),
          ]);
          const members: BoardMember[] = Array.isArray(membersRaw)
            ? membersRaw
                .filter((m) => m.status === "active")
                .map((m) => ({ id: m.user_id, name: m.name, email: m.email, role: m.role, avatar_url: m.avatar_url }))
            : get().members;
          const boards: BoardOption[] = Array.isArray(boardsRaw)
            ? (boardsRaw as Record<string, unknown>[]).map((b) => ({ id: b.id as string, title: (b.title as string) ?? "" }))
            : get().boards;
          const arr = Array.isArray(raw) ? raw : [];
          set({
            tasks: arr.map((t) => toOrgTask(t, members, boards)),
            members,
            boards,
            loading: false,
            loaded: true,
            error: null,
          });
        } catch (err) {
          // A failed background refresh keeps the cached tasks on screen.
          if (get().loaded) set({ loading: false });
          else set({ error: (err as Error).message, loading: false });
        } finally {
          inflight = null;
        }
      })();
      return inflight;
    },

    createTask: async (boardId, payload) => {
      const raw = await apiFetch<Record<string, unknown>>(`/api/boards/${boardId}/tasks`, {
        method: "POST",
        body: JSON.stringify(toCreateBody(payload)),
      });
      const task = toOrgTask(raw, get().members, get().boards);
      set((s) => ({ tasks: [...s.tasks, task] }));
    },

    updateTask: async (taskId, patch) => {
      const prev = get().tasks.find((t) => t.id === taskId);
      if (!prev) return;
      const optimistic: OrgTask = { ...prev, ...patch };
      if (patch.assigneeId !== undefined) {
        optimistic.assignee = get().members.find((m) => m.id === patch.assigneeId)?.name ?? "";
      }
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? optimistic : t)) }));
      try {
        const raw = await apiFetch<Record<string, unknown>>(`/api/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify(toPatchBody(patch)),
        });
        if (raw && typeof raw === "object" && raw.id) {
          const saved = toOrgTask(raw, get().members, get().boards);
          set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? saved : t)) }));
        }
      } catch (err) {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? prev : t)) }));
        throw err;
      }
    },

    deleteTask: async (taskId) => {
      const prevTasks = get().tasks;
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
      try {
        await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      } catch (err) {
        set({ tasks: prevTasks });
        throw err;
      }
    },
  }))
);
