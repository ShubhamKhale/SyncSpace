"use client";

import { useState } from "react";
import { Organization } from "./types";
import TeamMembersIcon from "../../icons/TeamMembers";
import TaskBoardIcon from "../../icons/TaskBoardIcon";
import OrganizationIcon from "../../icons/OrganizationIcon";

export default function OrganizationOverviewPage() {
  const [org, setOrg] = useState<Organization>({
    id: "org-1",
    name: "Acme Corp",
    memberCount: 12,
    boardCount: 8,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(org.name);

  const currentUserRole: "admin" | "owner" | "member" = "owner";

  const handleSave = async () => {
    setOrg({ ...org, name: editName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(org.name);
    setIsEditing(false);
  };

  return (
    <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-slate-100 dark:bg-slate-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="font-semibold text-xl text-[var(--primary-text-color)]">
          Organization Overview
        </p>
        {(currentUserRole === "owner" || currentUserRole === "admin") && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-[var(--primary-button-background-color)] text-white rounded-lg hover:bg-blue-700 transition hover:cursor-pointer"
          >
            {isEditing ? "Cancel" : "Edit Organization"}
          </button>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && (currentUserRole === "owner" || currentUserRole === "admin") && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-3 border-b border-[var(--sidebar-option-background-color)]">
            Edit Organization
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition hover:cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[var(--primary-button-background-color)] text-white rounded-lg hover:bg-blue-700 transition hover:cursor-pointer text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Total Members</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{org.memberCount}</p>
          </div>
          <TeamMembersIcon />
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Total Boards</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{org.boardCount}</p>
          </div>
          <TaskBoardIcon />
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Your Role</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold capitalize">{currentUserRole}</p>
          </div>
          <OrganizationIcon />
        </div>
      </div>

      {/* Organization Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-3 border-b border-[var(--sidebar-option-background-color)]">
          Organization Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400 w-40">Name</span>
            <span className="text-sm text-gray-900 dark:text-slate-100 font-medium">{org.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400 w-40">Organization ID</span>
            <span className="text-sm text-gray-400 dark:text-slate-300 font-mono">{org.id}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400 w-40">Your Role</span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 capitalize">
              {currentUserRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
