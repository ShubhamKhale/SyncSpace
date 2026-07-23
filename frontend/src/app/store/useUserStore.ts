import { create } from "zustand";
import { apiFetch, clearAuthTokens } from "@/lib/api";

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole | null;
  orgId: string | null;
  hasOrg: boolean;
}

interface UserStore {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    if (get().loading || get().user) return;
    set({ loading: true });
    try {
      const data = await apiFetch<Record<string, unknown>>("/api/user/me");
      const user: User = {
        id: data.id as string,
        name: (data.name as string) || "",
        email: (data.email as string) || "",
        avatarUrl: (data.avatarUrl ?? data.avatar_url ?? null) as string | null,
        role: (data.role as UserRole) ?? null,
        orgId: (data.orgId ?? data.org_id ?? null) as string | null,
        hasOrg: Boolean(data.hasOrg ?? data.has_org ?? false),
      };
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setUser: (user: User) => set({ user }),

  clearUser: () => {
    clearAuthTokens();
    set({ user: null });
  },
}));

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}
