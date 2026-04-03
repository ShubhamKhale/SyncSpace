"use client";

import { useState } from "react";
import { Member, Role, Status } from "../types";
import RoleDropdown from "./RoleDropdown";
import InviteMemberModal from "./InviteMemberModal";

interface Props {
  members: Member[];
  currentUserRole: Role;
}

const roleStyles: Record<Role, string> = {
  owner: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  member: "bg-green-100 text-green-700",
  viewer: "bg-gray-100 text-gray-600",
};

const statusStyles: Record<Status, string> = {
  active: "bg-green-100 text-green-700",
  invited: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-600",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
];

export default function MembersTable({ members, currentUserRole }: Props) {
  const [showInvite, setShowInvite] = useState(false);
  const [list, setList] = useState<Member[]>(members);

  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";
  const canRemove = currentUserRole === "owner" || currentUserRole === "admin";
  const canChangeRole = currentUserRole === "owner";

  const handleRemove = (id: string) => {
    if (!canRemove) return;
    setList((l) => l.filter((m) => m.id !== id));
  };

  const handleRoleChange = (id: string, newRole: Role) => {
    setList((l) =>
      l.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  return (
    <>
      {/* Table header row */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--sidebar-option-background-color)]">
        <p className="font-semibold text-base text-gray-900 dark:text-slate-100">
          All Members
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full">
            {list.length}
          </span>
        </p>
        {canInvite && (
          <button
            className="px-4 py-2 bg-[var(--primary-button-background-color)] text-white rounded-lg text-sm hover:bg-blue-700 transition hover:cursor-pointer"
            onClick={() => setShowInvite(true)}
          >
            + Invite Member
          </button>
        )}
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-700 text-left">
            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider rounded-l-lg">
              Member
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Status
            </th>
            {canRemove && (
              <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider rounded-r-lg">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {list.map((m, index) => (
            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              {/* Member name + avatar */}
              <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                      avatarColors[index % avatarColors.length]
                    }`}
                  >
                    {getInitials(m.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {m.name}
                  </span>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{m.email}</td>

              {/* Role */}
              <td className="px-4 py-3">
                {canChangeRole ? (
                  <RoleDropdown
                    current={m.role}
                    onChange={(r) => handleRoleChange(m.id, r)}
                  />
                ) : (
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${roleStyles[m.role]}`}
                  >
                    {m.role}
                  </span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusStyles[m.status]}`}
                >
                  {m.status}
                </span>
              </td>

              {/* Actions */}
              {canRemove && (
                <td className="px-4 py-3">
                  <button
                    className="text-sm text-red-500 hover:text-red-700 hover:cursor-pointer transition-colors"
                    onClick={() => handleRemove(m.id)}
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showInvite && <InviteMemberModal onClose={() => setShowInvite(false)} />}
    </>
  );
}
