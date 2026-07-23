import { useUserStore, UserRole } from "@/app/store/useUserStore";

export type { UserRole };

export interface EditPermissions {
  canEditBoardMetadata: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canReorderTasks: boolean;
}

export const useEditMode = (roleOverride?: UserRole | null): EditPermissions => {
  const storeRole = useUserStore((s) => s.user?.role);
  const role = roleOverride ?? storeRole ?? "viewer";

  return {
    canEditBoardMetadata: role === "owner" || role === "admin",
    canEditTasks: role === "owner" || role === "admin" || role === "member",
    canDeleteTasks: role === "owner",
    canReorderTasks: role === "owner" || role === "admin" || role === "member",
  };
};
