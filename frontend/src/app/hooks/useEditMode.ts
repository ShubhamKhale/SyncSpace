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
    // Mirrors the backend's taskWriteRoles (owner/admin/member may delete).
    canDeleteTasks: role === "owner" || role === "admin" || role === "member",
    canReorderTasks: role === "owner" || role === "admin" || role === "member",
  };
};
