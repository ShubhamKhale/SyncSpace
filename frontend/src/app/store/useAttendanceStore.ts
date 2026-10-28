import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export type AttendanceStatus = "checked_in" | "checked_out" | "on_leave" | "absent";

export interface AttendanceLog {
  id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  hours_worked: number | null;
  note: string | null;
  date: string;
}

export interface MemberAttendance {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  status: AttendanceStatus;
  check_in_at: string | null;
  check_out_at: string | null;
  hours_worked: number | null;
  role: string;
}

export interface TeamAttendance {
  checked_in: number;
  on_leave: number;
  absent: number;
  total: number;
  members: MemberAttendance[];
}

export interface MyAttendance {
  status: AttendanceStatus;
  log: AttendanceLog | null;
}

interface AttendanceStore {
  my: MyAttendance | null;
  team: TeamAttendance | null;
  myLoading: boolean;
  teamLoading: boolean;
  checkInProgress: boolean;
  error: string | null;

  fetchMy: () => Promise<void>;
  fetchTeam: () => Promise<void>;
  checkIn: (note?: string) => Promise<void>;
  checkOut: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    (set, get) => ({
      my: null,
      team: null,
      myLoading: false,
      teamLoading: false,
      checkInProgress: false,
      error: null,

      fetchMy: async () => {
        if (get().myLoading) return;
        set({ myLoading: true, error: null });
        try {
          const data = await apiFetch<MyAttendance>("/api/attendance/me");
          set({ my: data, myLoading: false });
        } catch (e) {
          set({ error: (e as Error).message, myLoading: false });
        }
      },

      fetchTeam: async () => {
        if (get().teamLoading) return;
        set({ teamLoading: true });
        try {
          const data = await apiFetch<TeamAttendance>("/api/attendance/team");
          set({ team: data, teamLoading: false });
        } catch {
          set({ teamLoading: false });
        }
      },

      checkIn: async (note?: string) => {
        set({ checkInProgress: true, error: null });
        try {
          const data = await apiFetch<AttendanceLog>("/api/attendance/check-in", {
            method: "POST",
            body: JSON.stringify({ note: note ?? null }),
          });
          set({ my: { status: "checked_in", log: data }, checkInProgress: false });
          // refresh team counts optimistically
          get().fetchTeam();
        } catch (e) {
          set({ error: (e as Error).message, checkInProgress: false });
          throw e;
        }
      },

      checkOut: async () => {
        set({ checkInProgress: true, error: null });
        try {
          const data = await apiFetch<AttendanceLog>("/api/attendance/check-out", {
            method: "POST",
          });
          set({ my: { status: "checked_out", log: data }, checkInProgress: false });
          get().fetchTeam();
        } catch (e) {
          set({ error: (e as Error).message, checkInProgress: false });
          throw e;
        }
      },
    }),
    { name: "attendance" }
  )
);
