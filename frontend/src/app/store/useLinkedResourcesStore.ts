import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface LinkedResource {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface LinkedResourcesState {
  loading: boolean;
  error: string | null;
  description: string;
  documentationLinks: LinkedResource[];
  links: LinkedResource[];

  // Actions
  setLoading: (loading: boolean) => void;
  setData: (
    description: string,
    documentationLinks: LinkedResource[],
    links: LinkedResource[]
  ) => void;
  setError: (error: string | null) => void;
  updateDescription: (description: string) => void;

  // Documentation link actions
  addDocumentationLink: (link: LinkedResource) => void;
  updateDocumentationLink: (index: number, fields: Partial<LinkedResource>) => void;
  removeDocumentationLink: (index: number) => void;

  // External resource link actions
  addLink: (link: LinkedResource) => void;
  updateLink: (index: number, fields: Partial<LinkedResource>) => void;
  removeLink: (index: number) => void;

  // Bulk save from modal
  saveLinkedResources: (documentationLinks: LinkedResource[], links: LinkedResource[]) => Promise<void>;
}

export const useLinkedResourcesStore = create<LinkedResourcesState>()(
  devtools((set) => ({
    loading: true,
    error: null,
    description: "",
    documentationLinks: [],
    links: [],

    setLoading: (loading) => set({ loading }),

    setData: (description, documentationLinks, links) =>
      set({ description, documentationLinks, links, loading: false, error: null }),

    setError: (error) => set({ error, loading: false }),

    updateDescription: (description) =>
      set((state) => ({ ...state, description })),

    // Documentation links
    addDocumentationLink: (link) =>
      set((state) => ({
        documentationLinks: [...state.documentationLinks, link],
      })),

    updateDocumentationLink: (index, fields) =>
      set((state) => {
        const docs = [...state.documentationLinks];
        if (docs[index]) docs[index] = { ...docs[index], ...fields };
        return { documentationLinks: docs };
      }),

    removeDocumentationLink: (index) =>
      set((state) => ({
        documentationLinks: state.documentationLinks.filter((_, i) => i !== index),
      })),

    // External resource links
    addLink: (link) =>
      set((state) => ({
        links: [...state.links, link],
      })),

    updateLink: (index, fields) =>
      set((state) => {
        const updated = [...state.links];
        if (updated[index]) updated[index] = { ...updated[index], ...fields };
        return { links: updated };
      }),

    removeLink: (index) =>
      set((state) => ({
        links: state.links.filter((_, i) => i !== index),
      })),

    saveLinkedResources: async (documentationLinks, links) => {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      set({ documentationLinks, links });
    },
  }))
);
