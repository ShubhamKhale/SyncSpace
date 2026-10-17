import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export interface LinkedResource {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;
}

// In-flight requests keyed by board ID (one shared request per board).
const inflight = new Map<string, Promise<void>>();

interface LinkedResourcesState {
  boardId: string | null;
  /** Board whose resources are currently loaded — revisits skip the skeleton. */
  loadedBoardId: string | null;
  loading: boolean;
  error: string | null;
  description: string;
  documentationLinks: LinkedResource[];
  links: LinkedResource[];

  fetchResources: (boardId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setData: (
    description: string,
    documentationLinks: LinkedResource[],
    links: LinkedResource[]
  ) => void;
  setError: (error: string | null) => void;
  updateDescription: (description: string) => void;
  addDocumentationLink: (link: LinkedResource) => void;
  updateDocumentationLink: (
    index: number,
    fields: Partial<LinkedResource>
  ) => void;
  removeDocumentationLink: (index: number) => void;
  addLink: (link: LinkedResource) => void;
  updateLink: (index: number, fields: Partial<LinkedResource>) => void;
  removeLink: (index: number) => void;
  saveLinkedResources: (
    documentationLinks: LinkedResource[],
    links: LinkedResource[]
  ) => Promise<void>;
}

export const useLinkedResourcesStore = create<LinkedResourcesState>()(
  devtools((set, get) => ({
    boardId: null,
    loadedBoardId: null,
    loading: true,
    error: null,
    description: "",
    documentationLinks: [],
    links: [],

    // Stale-while-revalidate: skeleton only on a board's first load.
    fetchResources: (boardId: string) => {
      const pending = inflight.get(boardId);
      if (pending) return pending;

      const cached = get().loadedBoardId === boardId;
      if (cached) set({ boardId });
      else set({ boardId, loadedBoardId: null, loading: true, error: null, description: "", documentationLinks: [], links: [] });

      const request = (async () => {
        try {
          const data = await apiFetch<{ id?: string; label?: string; url?: string; title?: string }[]>(
            `/api/boards/${boardId}/linked-resources`
          );
          // The user may have switched boards while this was in flight.
          if (get().boardId !== boardId) return;
          const arr = Array.isArray(data) ? data : [];
          const mapped: LinkedResource[] = arr.map((r) => ({
            title: r.label ?? r.title ?? "",
            url: r.url ?? "",
          }));
          set({
            description: "",
            documentationLinks: [],
            links: mapped,
            loadedBoardId: boardId,
            loading: false,
            error: null,
          });
        } catch (err) {
          if (get().boardId !== boardId) return;
          // A failed background refresh keeps the cached resources on screen.
          if (get().loadedBoardId === boardId) set({ loading: false });
          else set({ error: (err as Error).message, loading: false });
        } finally {
          inflight.delete(boardId);
        }
      })();
      inflight.set(boardId, request);
      return request;
    },

    setLoading: (loading) => set({ loading }),

    setData: (description, documentationLinks, links) =>
      set({ description, documentationLinks, links, loading: false, error: null }),

    setError: (error) => set({ error, loading: false }),

    updateDescription: (description) => set({ description }),

    addDocumentationLink: (link) =>
      set((s) => ({ documentationLinks: [...s.documentationLinks, link] })),

    updateDocumentationLink: (index, fields) =>
      set((s) => {
        const docs = [...s.documentationLinks];
        if (docs[index]) docs[index] = { ...docs[index], ...fields };
        return { documentationLinks: docs };
      }),

    removeDocumentationLink: (index) =>
      set((s) => ({
        documentationLinks: s.documentationLinks.filter((_, i) => i !== index),
      })),

    addLink: (link) =>
      set((s) => ({ links: [...s.links, link] })),

    updateLink: (index, fields) =>
      set((s) => {
        const updated = [...s.links];
        if (updated[index]) updated[index] = { ...updated[index], ...fields };
        return { links: updated };
      }),

    removeLink: (index) =>
      set((s) => ({ links: s.links.filter((_, i) => i !== index) })),

    saveLinkedResources: async (documentationLinks, links) => {
      const boardId = get().boardId;
      if (!boardId) return;
      try {
        const all = [...documentationLinks, ...links];
        await apiFetch(`/api/boards/${boardId}/linked-resources`, {
          method: "PUT",
          body: JSON.stringify({
            resources: all.map((r) => ({
              label: r.title ?? "",
              url: r.url ?? "",
            })),
          }),
        });
        set({ documentationLinks, links });
      } catch (err) {
        set({ error: (err as Error).message });
      }
    },
  }))
);
