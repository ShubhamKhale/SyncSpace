import { create } from "zustand";
import { apiFetch, apiDelete } from "@/lib/api";

export interface BoardFlow {
  id: string;
  name: string;
  boardId: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt: string;
}

interface State {
  flows: BoardFlow[];
  loading: boolean;
  fetchFlows: (boardId: string) => Promise<void>;
  createFlow: (boardId: string, name?: string) => Promise<BoardFlow>;
  deleteFlow: (boardId: string, flowId: string) => Promise<void>;
  renameFlow: (boardId: string, flowId: string, name: string) => Promise<void>;
  duplicateFlow: (boardId: string, flowId: string) => Promise<BoardFlow>;
  migrateFlow: (boardId: string, localFlowId: string) => Promise<BoardFlow>;
}

// ── localStorage helpers (fallback when backend API not yet available) ──

function metaKey(boardId: string) { return `syncspace-flows-${boardId}`; }
function diagramKey(flowId: string) { return `syncspace-flow-${flowId}`; }

function loadMeta(boardId: string): BoardFlow[] {
  try {
    const raw = localStorage.getItem(metaKey(boardId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMeta(boardId: string, flows: BoardFlow[]) {
  localStorage.setItem(metaKey(boardId), JSON.stringify(flows));
}

function readNodeEdgeCount(flowId: string): { nodeCount: number; edgeCount: number } {
  try {
    const raw = localStorage.getItem(diagramKey(flowId));
    if (!raw) return { nodeCount: 0, edgeCount: 0 };
    const data = JSON.parse(raw);
    return {
      nodeCount: Array.isArray(data.nodes) ? data.nodes.length : 0,
      edgeCount: Array.isArray(data.edges) ? data.edges.length : 0,
    };
  } catch { return { nodeCount: 0, edgeCount: 0 }; }
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Store ──

export const useBoardFlowsStore = create<State>((set, get) => ({
  flows: [],
  loading: false,

  fetchFlows: async (boardId) => {
    set({ loading: true });
    try {
      const raw = await apiFetch<BoardFlow[]>(`/api/boards/${boardId}/flows`);
      // Prefer the title stored in the local diagram cache — it reflects the latest
      // rename done inside the editor (which may not have propagated to flow.name yet).
      const serverFlows = (raw ?? []).map((f) => {
        try {
          const cached = localStorage.getItem(diagramKey(f.id));
          if (cached) {
            const data = JSON.parse(cached);
            if (data.title && data.title !== "Untitled Diagram") return { ...f, name: data.title };
          }
        } catch {}
        return f;
      });
      const serverIds = new Set(serverFlows.map((f) => f.id));

      // Auto-migrate any localStorage-only flows that the server doesn't know about
      const localFlows = loadMeta(boardId);
      const unsynced = localFlows.filter((f) => !serverIds.has(f.id));

      const migrated: BoardFlow[] = [];
      for (const local of unsynced) {
        try {
          const created = await apiFetch<BoardFlow>(`/api/boards/${boardId}/flows`, {
            method: "POST",
            body: JSON.stringify({ name: local.name }),
          });
          const diagramData = localStorage.getItem(diagramKey(local.id));
          if (diagramData) {
            localStorage.setItem(diagramKey(created.id), diagramData);
            apiFetch(`/api/boards/${boardId}/flows/${created.id}/diagram`, {
              method: "PUT",
              body: diagramData,
            }).catch(() => {});
            localStorage.removeItem(diagramKey(local.id));
          }
          migrated.push(created);
        } catch {
          migrated.push(local); // keep local if migration fails
        }
      }

      const allFlows = [...(serverFlows ?? []), ...migrated];
      saveMeta(boardId, allFlows);
      set({ flows: allFlows });
    } catch {
      // Backend not ready — use localStorage
      const raw = loadMeta(boardId).map((f) => ({ ...f, ...readNodeEdgeCount(f.id) }));
      set({ flows: raw });
    } finally {
      set({ loading: false });
    }
  },

  createFlow: async (boardId, name) => {
    const flowName = name ?? `Untitled Flow ${get().flows.length + 1}`;
    try {
      const flow = await apiFetch<BoardFlow>(`/api/boards/${boardId}/flows`, {
        method: "POST",
        body: JSON.stringify({ name: flowName }),
      });
      set({ flows: [...get().flows, flow] });
      return flow;
    } catch {
      // Fallback to localStorage
      const now = new Date().toISOString();
      const flow: BoardFlow = {
        id: uid(),
        name: flowName,
        boardId,
        nodeCount: 0,
        edgeCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...get().flows, flow];
      saveMeta(boardId, updated);
      set({ flows: updated });
      return flow;
    }
  },

  deleteFlow: async (boardId, flowId) => {
    try {
      await apiDelete(`/api/boards/${boardId}/flows/${flowId}`);
    } catch {
      // Fallback: remove from localStorage
      localStorage.removeItem(diagramKey(flowId));
    }
    const updated = get().flows.filter((f) => f.id !== flowId);
    saveMeta(boardId, updated);
    set({ flows: updated });
  },

  renameFlow: async (boardId, flowId, name) => {
    try {
      const updated = await apiFetch<BoardFlow>(`/api/boards/${boardId}/flows/${flowId}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      set({ flows: get().flows.map((f) => (f.id === flowId ? updated : f)) });
    } catch {
      // Fallback: update locally
      const updated = get().flows.map((f) =>
        f.id === flowId ? { ...f, name, updatedAt: new Date().toISOString() } : f
      );
      saveMeta(boardId, updated);
      set({ flows: updated });
    }
  },

  migrateFlow: async (boardId, localFlowId) => {
    const localFlow = get().flows.find((f) => f.id === localFlowId);
    const flowName = localFlow?.name ?? "Untitled Flow";

    // Create on server — get a real UUID
    const serverFlow = await apiFetch<BoardFlow>(`/api/boards/${boardId}/flows`, {
      method: "POST",
      body: JSON.stringify({ name: flowName }),
    });

    // Move diagram data from old localStorage key to new key
    const oldDiagramData = localStorage.getItem(diagramKey(localFlowId));
    if (oldDiagramData) {
      localStorage.setItem(diagramKey(serverFlow.id), oldDiagramData);
      // Push existing diagram to server (best-effort)
      apiFetch(`/api/boards/${boardId}/flows/${serverFlow.id}/diagram`, {
        method: "PUT",
        body: oldDiagramData,
      }).catch(() => {});
      localStorage.removeItem(diagramKey(localFlowId));
    }

    // Replace old entry in store + localStorage metadata
    const updated = get().flows.map((f) => (f.id === localFlowId ? serverFlow : f));
    if (!updated.find((f) => f.id === serverFlow.id)) updated.push(serverFlow);
    saveMeta(boardId, updated);
    set({ flows: updated });

    return serverFlow;
  },

  duplicateFlow: async (boardId, flowId) => {
    try {
      const newFlow = await apiFetch<BoardFlow>(
        `/api/boards/${boardId}/flows/${flowId}/duplicate`,
        { method: "POST", body: JSON.stringify({}) }
      );
      set({ flows: [...get().flows, newFlow] });
      return newFlow;
    } catch {
      // Fallback: copy in localStorage
      const source = get().flows.find((f) => f.id === flowId);
      if (!source) throw new Error("Flow not found");
      const now = new Date().toISOString();
      const newFlow: BoardFlow = {
        id: uid(),
        name: `${source.name} (Copy)`,
        boardId,
        nodeCount: source.nodeCount,
        edgeCount: source.edgeCount,
        createdAt: now,
        updatedAt: now,
      };
      const srcData = localStorage.getItem(diagramKey(flowId));
      if (srcData) localStorage.setItem(diagramKey(newFlow.id), srcData);
      const updated = [...get().flows, newFlow];
      saveMeta(boardId, updated);
      set({ flows: updated });
      return newFlow;
    }
  },
}));
