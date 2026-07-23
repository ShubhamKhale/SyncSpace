"use client";

import { useEffect, useState } from "react";
import { Organization } from "./types";
import TeamMembersIcon from "../../icons/TeamMembers";
import TaskBoardIcon from "../../icons/TaskBoardIcon";
import OrganizationIcon from "../../icons/OrganizationIcon";
import { apiFetch } from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";

export default function OrganizationOverviewPage() {
  const [org, setOrg] = useState<Organization>({
    id: "",
    name: "",
    memberCount: 0,
    boardCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const { user } = useUserStore();
  const currentUserRole = user?.role ?? "viewer";

  useEffect(() => {
    apiFetch<Record<string, unknown>>("/api/organization")
      .then((data) => {
        const mapped: Organization = {
          id: data.id as string,
          name: data.name as string,
          memberCount: (data.memberCount ?? data.member_count ?? 0) as number,
          boardCount: (data.boardCount ?? data.board_count ?? 0) as number,
        };
        setOrg(mapped);
        setEditName(mapped.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/organization/${org.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName }),
      });
      setOrg((prev) => ({ ...prev, name: editName }));
      setIsEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleCancel = () => {
    setEditName(org.name);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-slate-100 dark:bg-slate-900 min-h-full flex items-center justify-center">
        <p className="text-[var(--tertiary-text-color)]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-semibold text-xl text-slate-800 dark:text-slate-100">
          Organization Overview
        </h1>
        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition text-sm font-medium"
          >
            {isEditing ? "Cancel" : "Edit Organization"}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
            Edit Organization
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 px-5 py-4 flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Members</p>
            <p className="text-slate-800 dark:text-slate-100 text-2xl font-bold">{org.memberCount}</p>
          </div>
          <TeamMembersIcon className="w-10 h-10 flex-shrink-0" />
        </div>
        <div className="bg-white dark:bg-slate-800 px-5 py-4 flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Total Boards</p>
            <p className="text-slate-800 dark:text-slate-100 text-2xl font-bold">{org.boardCount}</p>
          </div>
          <TaskBoardIcon className="w-10 h-10 flex-shrink-0" />
        </div>
        <div className="bg-white dark:bg-slate-800 px-5 py-4 flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your Role</p>
            <p className="text-slate-800 dark:text-slate-100 text-2xl font-bold capitalize">{currentUserRole}</p>
          </div>
          <OrganizationIcon width={40} height={40} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          Organization Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-40">Name</span>
            <span className="text-sm text-slate-800 dark:text-slate-100 font-medium">{org.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-40">Organization ID</span>
            <span className="text-sm text-slate-400 dark:text-slate-300 font-mono">{org.id}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-40">Your Role</span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 capitalize">
              {currentUserRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
