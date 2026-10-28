import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

export interface LeaveType {
  id: string;
  org_id: string;
  name: string;
  default_days: number;
  is_active: boolean;
  created_at: string;
}

export interface LeaveBalance {
  user_id: string;
  leave_type_id: string;
  type_name: string;
  year: number;
  allocated: number;
  used: number;
  remaining: number;
}

export type LeaveStatus = "pending" | "approved" | "denied";

export interface LeaveRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  avatar_url?: string | null;
  org_id: string;
  leave_type_id: string;
  type_name?: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface SubmitLeavePayload {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface LeaveStore {
  types: LeaveType[];
  balances: LeaveBalance[];
  myRequests: LeaveRequest[];
  teamRequests: LeaveRequest[];
  loading: boolean;
  submitting: boolean;
  error: string | null;

  fetchTypes: () => Promise<void>;
  fetchBalances: () => Promise<void>;
  fetchMyRequests: () => Promise<void>;
  fetchTeamRequests: () => Promise<void>;
  submitRequest: (payload: SubmitLeavePayload) => Promise<void>;
  approveRequest: (id: string) => Promise<void>;
  denyRequest: (id: string) => Promise<void>;
}

export const useLeaveStore = create<LeaveStore>()(
  devtools(
    (set, get) => ({
      types: [],
      balances: [],
      myRequests: [],
      teamRequests: [],
      loading: false,
      submitting: false,
      error: null,

      fetchTypes: async () => {
        const data = await apiFetch<LeaveType[]>("/api/leave/types");
        set({ types: Array.isArray(data) ? data : [] });
      },

      fetchBalances: async () => {
        const data = await apiFetch<LeaveBalance[]>("/api/leave/balances");
        set({ balances: Array.isArray(data) ? data : [] });
      },

      fetchMyRequests: async () => {
        const data = await apiFetch<LeaveRequest[]>("/api/leave/requests/me");
        set({ myRequests: Array.isArray(data) ? data : [] });
      },

      fetchTeamRequests: async () => {
        const data = await apiFetch<LeaveRequest[]>("/api/leave/requests?status=pending");
        set({ teamRequests: Array.isArray(data) ? data : [] });
      },

      submitRequest: async (payload) => {
        set({ submitting: true, error: null });
        try {
          const req = await apiFetch<LeaveRequest>("/api/leave/requests", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          set((s) => ({ myRequests: [req, ...s.myRequests], submitting: false }));
          get().fetchBalances();
        } catch (e) {
          set({ error: (e as Error).message, submitting: false });
          throw e;
        }
      },

      approveRequest: async (id) => {
        await apiFetch(`/api/leave/requests/${id}/approve`, { method: "PATCH" });
        set((s) => ({
          teamRequests: s.teamRequests.map((r) =>
            r.id === id ? { ...r, status: "approved" as LeaveStatus } : r
          ),
        }));
      },

      denyRequest: async (id) => {
        await apiFetch(`/api/leave/requests/${id}/deny`, { method: "PATCH" });
        set((s) => ({
          teamRequests: s.teamRequests.map((r) =>
            r.id === id ? { ...r, status: "denied" as LeaveStatus } : r
          ),
        }));
      },
    }),
    { name: "leave" }
  )
);
