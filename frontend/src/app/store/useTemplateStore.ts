import { create } from "zustand";
import { devtools } from "zustand/middleware";

const RECENT_KEY = "syncspace-recent-templates";
const MAX_RECENT = 6;

interface TemplateStore {
  isOpen: boolean;
  selectedCategory: string;
  searchQuery: string;
  recentIds: string[];

  openModal: () => void;
  closeModal: () => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  addRecent: (id: string) => void;
  loadRecentsFromStorage: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      selectedCategory: "All",
      searchQuery: "",
      recentIds: [],

      openModal: () =>
        set({ isOpen: true, selectedCategory: "All", searchQuery: "" }),

      closeModal: () => set({ isOpen: false }),

      setCategory: (category) => set({ selectedCategory: category }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      addRecent: (id) => {
        const prev = get().recentIds.filter((r) => r !== id);
        const next = [id, ...prev].slice(0, MAX_RECENT);
        set({ recentIds: next });
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch {}
      },

      loadRecentsFromStorage: () => {
        try {
          const raw = localStorage.getItem(RECENT_KEY);
          if (raw) set({ recentIds: JSON.parse(raw) });
        } catch {}
      },
    }),
    { name: "TemplateStore" }
  )
);
