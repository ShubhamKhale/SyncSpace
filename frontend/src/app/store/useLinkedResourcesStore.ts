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

interface LinkedResourcesState {
  boardId: string | null;
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
    loading: true,
    error: null,
    description: "",
    documentationLinks: [],
    links: [],

    fetchResources: async (boardId: string) => {
      set({ boardId, loading: true, error: null });
      try {
        const data = await apiFetch<{ id?: string; label?: string; url?: string; title?: string }[]>(
          `/api/boards/${boardId}/linked-resources`
        );
        const arr = Array.isArray(data) ? data : [];
        const mapped: LinkedResource[] = arr.map((r) => ({
          title: r.label ?? r.title ?? "",
          url: r.url ?? "",
        }));
        set({
          description: "",
          documentationLinks: [],
          links: mapped,
          loading: false,
        });
      } catch (err) {
        set({ error: (err as Error).message, loading: false });
      }
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
