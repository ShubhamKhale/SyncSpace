export type UserRole = "owner" | "editor" | "viewer";

export interface EditPermissions {
  canEditBoardMetadata: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canReorderTasks: boolean;
}

export const useEditMode = (userRole?: UserRole): EditPermissions => {
  const role = userRole || "viewer";

  return {
    canEditBoardMetadata: role === "owner",
    canEditTasks: role === "owner" || role === "editor",
    canDeleteTasks: role === "owner",
    canReorderTasks: role === "owner" || role === "editor",
  };
};
