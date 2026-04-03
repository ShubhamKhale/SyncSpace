import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface BoardTag {
  label: string;
  color: string;      // hex or tailwind color key
  textColor: string;  // contrasting text color
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
}

export interface BoardDetailsUpdate {
  title: string;
  description: string;
  tags: BoardTag[];
  status: BoardStatus;
  coverColor: string;
}

interface BoardState {
  board: Board | null;
  loading: boolean;
  error: string | null;
  saveStates: Record<string, "idle" | "loading" | "success" | "error">;

  // Actions
  setBoard: (board: Board) => void;
  updateBoardTitle: (title: string) => Promise<void>;
  updateBoardDescription: (description: string) => Promise<void>;
  updateBoardDetails: (details: BoardDetailsUpdate) => Promise<void>;
  setSaveState: (
    field: string,
    state: "idle" | "loading" | "success" | "error"
  ) => void;
}

export const useBoardStore = create<BoardState>()(
  devtools((set) => ({
    board: null,
    loading: false,
    error: null,
    saveStates: {},

    setBoard: (board) => set({ board }),

    updateBoardTitle: async (title: string) => {
      set((state) => ({
        saveStates: { ...state.saveStates, title: "loading" },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          board: state.board ? { ...state.board, title } : null,
          saveStates: { ...state.saveStates, title: "success" },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: { ...state.saveStates, title: "idle" },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: { ...state.saveStates, title: "error" },
          error: "Failed to update title",
        }));
      }
    },

    updateBoardDescription: async (description: string) => {
      set((state) => ({
        saveStates: { ...state.saveStates, description: "loading" },
      }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          board: state.board ? { ...state.board, description } : null,
          saveStates: { ...state.saveStates, description: "success" },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: { ...state.saveStates, description: "idle" },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: { ...state.saveStates, description: "error" },
          error: "Failed to update description",
        }));
      }
    },

    updateBoardDetails: async (details: BoardDetailsUpdate) => {
      set((state) => ({
        saveStates: { ...state.saveStates, details: "loading" },
      }));
      try {
        // TODO: Replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 300));
        set((state) => ({
          board: state.board
            ? {
                ...state.board,
                title: details.title,
                description: details.description,
                tags: details.tags,
                status: details.status,
                coverColor: details.coverColor,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : null,
          saveStates: { ...state.saveStates, details: "success" },
        }));
        setTimeout(
          () =>
            set((state) => ({
              saveStates: { ...state.saveStates, details: "idle" },
            })),
          1200
        );
      } catch {
        set((state) => ({
          saveStates: { ...state.saveStates, details: "error" },
          error: "Failed to update board details",
        }));
      }
    },

    setSaveState: (field, state) =>
      set((prevState) => ({
        saveStates: { ...prevState.saveStates, [field]: state },
      })),
  }))
);
