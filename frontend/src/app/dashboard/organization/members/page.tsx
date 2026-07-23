"use client";

import { useEffect, useState } from "react";
import { Member } from "../types";
import MembersTable from "../components/MembersTable";
import TeamMembersIcon from "../../../icons/TeamMembers";
import { apiFetch } from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUserStore();
  const currentUserRole = user?.role ?? "viewer";

  useEffect(() => {
    apiFetch<Member[]>("/api/organization/members")
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount  = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-slate-100 dark:bg-slate-900 min-h-full">
      <div className="mb-6">
        <p className="font-semibold text-xl text-[var(--primary-text-color)]">
          Members
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Total Members</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{members.length}</p>
          </div>
          <TeamMembersIcon className="w-10 h-10 flex-shrink-0" />
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Active</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Pending Invites</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{invitedCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        {loading ? (
          <p className="text-sm text-[var(--tertiary-text-color)]">Loading members…</p>
        ) : (
          <MembersTable members={members} currentUserRole={currentUserRole} />
        )}
      </div>
    </div>
  );
}
