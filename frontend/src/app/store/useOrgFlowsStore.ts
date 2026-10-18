import { create } from "zustand";
import { apiDelete, apiFetch, encryptedFetch } from "@/lib/api";
import type { BoardFlow } from "./useBoardFlowsStore";
import type { BoardOption } from "./useOrgTasksStore";

/** A flow from the org-wide list — BoardFlow plus its board's title. */
export interface OrgFlow extends BoardFlow {
  boardTitle: string;
}

/**
 * Prefer the title in the editor's local diagram cache — it reflects a rename
 * made inside the editor that may not have reached flow.name yet (same rule
 * as useBoardFlowsStore).
 */
function withCachedTitle<T extends BoardFlow>(f: T): T {
  try {
    const cached = localStorage.getItem(`syncspace-flow-${f.id}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (data.title && data.title !== "Untitled Diagram") return { ...f, name: data.title };
    }
  } catch {}
  return f;
}

let inflight: Promise<void> | null = null;

interface OrgFlowsState {
  flows: OrgFlow[];
  boards: BoardOption[];
  loading: boolean;
  loaded: boolean;
  error: string | null;

  /** Stale-while-revalidate: `loading` only on the first load; later calls refresh silently. */
  fetchAll: () => Promise<void>;
  createFlow: (boardId: string) => Promise<OrgFlow>;
  renameFlow: (flow: OrgFlow, name: string) => Promise<void>;
  duplicateFlow: (flow: OrgFlow) => Promise<void>;
  deleteFlow: (flow: OrgFlow) => Promise<void>;
}

export const useOrgFlowsStore = create<OrgFlowsState>((set, get) => {
  const boardTitle = (boardId: string) => get().boards.find((b) => b.id === boardId)?.title ?? "";

  return {
    flows: [],
    boards: [],
    loading: false,
    loaded: false,
    error: null,

    fetchAll: () => {
      if (inflight) return inflight;
      if (!get().loaded) set({ loading: true, error: null });

      inflight = (async () => {
        try {
          // Boards also cover ones with no flows yet, for the New Flow picker.
          const [raw, boardsRaw] = await Promise.all([
            apiFetch<OrgFlow[]>("/api/flows"),
            encryptedFetch<unknown>("/api/boards", "GET").catch(() => null),
          ]);
          const boards: BoardOption[] = Array.isArray(boardsRaw)
            ? (boardsRaw as Record<string, unknown>[]).map((b) => ({ id: b.id as string, title: (b.title as string) ?? "" }))
            : get().boards;
          const flows = (Array.isArray(raw) ? raw : []).map((f) => withCachedTitle(f));
          set({ flows, boards, loading: false, loaded: true, error: null });
        } catch (err) {
          // A failed background refresh keeps the cached flows on screen.
          if (get().loaded) set({ loading: false });
          else set({ error: (err as Error).message, loading: false });
        } finally {
          inflight = null;
        }
      })();
      return inflight;
    },

    createFlow: async (boardId) => {
      const count = get().flows.filter((f) => f.boardId === boardId).length;
      const flow = await apiFetch<BoardFlow>(`/api/boards/${boardId}/flows`, {
        method: "POST",
        body: JSON.stringify({ name: `Untitled Flow ${count + 1}` }),
      });
      const created: OrgFlow = { ...flow, boardTitle: boardTitle(boardId) };
      set((s) => ({ flows: [created, ...s.flows] }));
      return created;
    },

    renameFlow: async (flow, name) => {
      const prev = get().flows;
      set({ flows: prev.map((f) => (f.id === flow.id ? { ...f, name } : f)) });
      try {
        const updated = await apiFetch<BoardFlow>(`/api/boards/${flow.boardId}/flows/${flow.id}`, {
          method: "PUT",
          body: JSON.stringify({ name }),
        });
        set((s) => ({ flows: s.flows.map((f) => (f.id === flow.id ? { ...f, ...updated, boardTitle: f.boardTitle } : f)) }));
      } catch (err) {
        set({ flows: prev });
        throw err;
      }
    },

    duplicateFlow: async (flow) => {
      const copy = await apiFetch<BoardFlow>(`/api/boards/${flow.boardId}/flows/${flow.id}/duplicate`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      set((s) => ({ flows: [{ ...copy, boardTitle: flow.boardTitle }, ...s.flows] }));
    },

    deleteFlow: async (flow) => {
      const prev = get().flows;
      set({ flows: prev.filter((f) => f.id !== flow.id) });
      try {
        await apiDelete(`/api/boards/${flow.boardId}/flows/${flow.id}`);
      } catch (err) {
        set({ flows: prev });
        throw err;
      }
    },
  };
});
