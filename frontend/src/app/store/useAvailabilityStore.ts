import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import type { AttendanceStatus } from "./useAttendanceStore";

export interface MemberAvailability {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  status: AttendanceStatus;
  check_in_at: string | null;
}

interface AvailabilityStore {
  members: MemberAvailability[];
  loaded: boolean;
  fetch: () => Promise<void>;
  getStatus: (userId: string) => AttendanceStatus | null;
}

export const useAvailabilityStore = create<AvailabilityStore>((set, get) => ({
  members: [],
  loaded: false,

  fetch: async () => {
    if (get().loaded) return;
    try {
      const data = await apiFetch<MemberAvailability[]>("/api/members/availability");
      set({ members: Array.isArray(data) ? data : [], loaded: true });
    } catch {
      // availability is best-effort — don't break the UI
    }
  },

  getStatus: (userId) => {
    return get().members.find((m) => m.user_id === userId)?.status ?? null;
  },
}));
