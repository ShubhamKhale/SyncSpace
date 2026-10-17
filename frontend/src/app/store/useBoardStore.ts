import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch, encryptedFetch } from "@/lib/api";

export interface BoardTag {
  label: string;
  color: string;
  textColor: string;
}

export type BoardStatus = "active" | "on-hold" | "archived";

export interface Board {
  id: string;
  title: string;
  description: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  tags: BoardTag[];
  status: BoardStatus;
  coverColor: string;
  flowId?: string;
}

export interface BoardDetailsUpdate {
  title: string;
  description: string;
  tags: BoardTag[];
  status: BoardStatus;
  coverColor: string;
}

export interface LocalBoardMeta {
  tags: BoardTag[];
  status: BoardStatus;
  coverColor: string;
}

const META_PREFIX = "ss_board_meta_";

function readLocalMeta(boardId: string): LocalBoardMeta | null {
  try {
    const raw = localStorage.getItem(`${META_PREFIX}${boardId}`);
    return raw ? (JSON.parse(raw) as LocalBoardMeta) : null;
  } catch {
    return null;
  }
}

export function writeLocalMeta(boardId: string, meta: LocalBoardMeta): void {
  try {
    localStorage.setItem(`${META_PREFIX}${boardId}`, JSON.stringify(meta));
  } catch {}
}

// Normalises snake_case or camelCase backend responses into the Board shape
function mapBoard(raw: Record<string, unknown>): Board {
  const id = raw.id as string;
  const meta = typeof window !== "undefined" ? readLocalMeta(id) : null;
  return {
    id,
    title: (raw.title as string) ?? "",
    description: ((raw.description ?? "") as string),
    owner: (((raw.owner ?? raw.owner_id) ?? "") as string),
    createdAt: (((raw.createdAt ?? raw.created_at) ?? "") as string),
    updatedAt: (((raw.updatedAt ?? raw.updated_at) ?? "") as string),
    // Prefer backend fields, fall back to localStorage, then defaults
    tags: (raw.tags as BoardTag[] | undefined) ?? meta?.tags ?? [],
    status: ((raw.status as BoardStatus | undefined) ?? meta?.status ?? "active"),
    coverColor: (((raw.coverColor ?? raw.cover_color) as string | undefined) ?? meta?.coverColor ?? "#2563EB"),
    flowId: ((raw.flowId ?? raw.flow_id) as string | undefined),
  };
}

export interface BoardActivityItem {
  id?: string;
  actor?: string;
  user?: string;
  action: string;
  target?: string;
  item?: string;
  createdAt?: string;
  created_at?: string;
  time?: string;
}

export interface BoardHealth {
  status?: "healthy" | "warning" | "critical";
  overdueTasks?: number;
  bottlenecks?: number;
  atRisk?: number;
  overdue_tasks?: number;
  at_risk?: number;
}

/** Sidebar extras cached per board so revisits render instantly. */
interface BoardInsights {
  health: BoardHealth | null;
  activity: BoardActivityItem[];
}

// In-flight requests keyed by board ID — the sidebar, kanban and tasks page
// all request the same board on mount; they share one request.
const boardInflight = new Map<string, Promise<void>>();
const insightsInflight = new Map<string, Promise<void>>();

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;
  insights: Record<string, BoardInsights>;

  /**
   * Stale-while-revalidate: shows the skeleton (`loading`) only when this
   * board isn't already loaded; otherwise refreshes silently in the
   * background and keeps the cached board on failure.
   */
  fetchBoard: (boardId: string) => Promise<void>;
  /** Same caching rules for the sidebar's health + recent activity. */
  fetchBoardInsights: (boardId: string) => Promise<void>;
  setBoard: (board: Board) => void;
  updateBoardTitle: (title: string) => Promise<void>;
  updateBoardDescription: (description: string) => Promise<void>;
  updateBoardDetails: (details: BoardDetailsUpdate) => Promise<void>;
  setSaveState: (
    field: string,
    state: "idle" | "loading" | "success" | "error"
  ) => void;
}

function resetSaveStateAfter(
  set: (fn: (s: BoardState) => Partial<BoardState>) => void,
  field: string,
  ms = 1200
) {
  setTimeout(
    () =>
      set((s) => ({
        saveStates: { ...s.saveStates, [field]: "idle" },
      })),
    ms
  );
}

export const useBoardStore = create<BoardState>()(
  devtools((set, get) => ({
    board: null,
    loading: false,
    error: null,
    saveStates: {},
    insights: {},

    fetchBoard: (boardId: string) => {
      const pending = boardInflight.get(boardId);
      if (pending) return pending;

      const cached = get().board?.id === boardId;
      // First load of this board: clear any other board's data and show the
      // skeleton. Revisit: keep showing the cached board while refreshing.
      if (!cached) set({ board: null, loading: true, error: null });

      const request = (async () => {
        try {
          const list = await encryptedFetch<unknown>("/api/boards", "GET");
          const arr = Array.isArray(list) ? list : [];
          const raw = arr.find(
            (b: unknown) => (b as Record<string, unknown>).id === boardId
          ) as Record<string, unknown> | undefined;
          if (!raw) throw new Error("Board not found");
          set({ board: mapBoard(raw), loading: false, error: null });
        } catch (err) {
          // A failed background refresh keeps the cached board on screen.
          if (get().board?.id === boardId) set({ loading: false });
          else set({ error: (err as Error).message, loading: false });
        } finally {
          boardInflight.delete(boardId);
        }
      })();
      boardInflight.set(boardId, request);
      return request;
    },

    fetchBoardInsights: (boardId: string) => {
      const pending = insightsInflight.get(boardId);
      if (pending) return pending;

      const request = (async () => {
        const prev = get().insights[boardId];
        // Each half falls back to its cached value (or empty) independently.
        const [activity, health] = await Promise.all([
          apiFetch<BoardActivityItem[]>(`/api/boards/${boardId}/activity`)
            .then((d) => (Array.isArray(d) ? d : []))
            .catch(() => prev?.activity ?? []),
          apiFetch<BoardHealth>(`/api/boards/${boardId}/health`)
            .catch(() => prev?.health ?? null),
        ]);
        set((s) => ({ insights: { ...s.insights, [boardId]: { activity, health } } }));
        insightsInflight.delete(boardId);
      })();
      insightsInflight.set(boardId, request);
      return request;
    },

    setBoard: (board) => set({ board }),

    updateBoardTitle: async (title: string) => {
      const boardId = get().board?.id;
      if (!boardId) return;
      set((s) => ({ saveStates: { ...s.saveStates, title: "loading" } }));
      // Optimistic update immediately
      set((s) => ({ board: s.board ? { ...s.board, title } : null }));
      try {
        await apiFetch(`/api/boards/${boardId}`, {
          method: "PATCH",
          body: JSON.stringify({ title }),
        });
        set((s) => ({ saveStates: { ...s.saveStates, title: "success" } }));
        resetSaveStateAfter(set, "title");
      } catch {
        // Keep optimistic update even if backend PATCH missing; show idle
        set((s) => ({ saveStates: { ...s.saveStates, title: "idle" } }));
      }
    },

    updateBoardDescription: async (description: string) => {
      const boardId = get().board?.id;
      if (!boardId) return;
      set((s) => ({
        saveStates: { ...s.saveStates, description: "loading" },
        board: s.board ? { ...s.board, description } : null,
      }));
      try {
        await apiFetch(`/api/boards/${boardId}`, {
          method: "PATCH",
          body: JSON.stringify({ description }),
        });
        set((s) => ({ saveStates: { ...s.saveStates, description: "success" } }));
        resetSaveStateAfter(set, "description");
      } catch {
        set((s) => ({ saveStates: { ...s.saveStates, description: "idle" } }));
      }
    },

    updateBoardDetails: async (details: BoardDetailsUpdate) => {
      const boardId = get().board?.id;
      if (!boardId) return;
      set((s) => ({ saveStates: { ...s.saveStates, details: "loading" } }));

      // Persist frontend-only fields (tags, status, coverColor) to localStorage immediately
      writeLocalMeta(boardId, {
        tags: details.tags,
        status: details.status,
        coverColor: details.coverColor,
      });

      // Optimistic update
      set((s) => ({
        board: s.board
          ? { ...s.board, ...details, updatedAt: new Date().toISOString().split("T")[0] }
          : null,
        saveStates: { ...s.saveStates, details: "success" },
      }));
      resetSaveStateAfter(set, "details");

      // Also try backend PATCH for title/description (silently ignore if endpoint missing)
      try {
        await apiFetch(`/api/boards/${boardId}`, {
          method: "PATCH",
          body: JSON.stringify({ title: details.title, description: details.description }),
        });
      } catch {
        // Backend PATCH not available yet — localStorage already persisted frontend fields
      }
    },

    setSaveState: (field, state) =>
      set((s) => ({ saveStates: { ...s.saveStates, [field]: state } })),
  }))
);
