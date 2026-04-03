// shared types for organization module

export interface Organization {
  id: string;
  name: string;
  memberCount: number;
  boardCount: number;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export type Status = "active" | "invited" | "suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
}
