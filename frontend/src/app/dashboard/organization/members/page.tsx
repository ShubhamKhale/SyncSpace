import { Member } from "../types";
import MembersTable from "../components/MembersTable";
import TeamMembersIcon from "../../../icons/TeamMembers";

export default async function MembersPage() {
  const members: Member[] = [
    {
      id: "u1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "owner",
      status: "active",
    },
    {
      id: "u2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "admin",
      status: "active",
    },
    {
      id: "u3",
      name: "Carol Lee",
      email: "carol@example.com",
      role: "member",
      status: "invited",
    },
    {
      id: "u4",
      name: "David Park",
      email: "david@example.com",
      role: "viewer",
      status: "active",
    },
  ];

  const currentUserRole: "owner" | "admin" | "member" | "viewer" = "admin";

  const activeCount = members.filter((m) => m.status === "active").length;
  const invitedCount = members.filter((m) => m.status === "invited").length;

  return (
    <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-slate-100 dark:bg-slate-900 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <p className="font-semibold text-xl text-[var(--primary-text-color)]">
          Members
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] dark:text-slate-400 text-base">Total Members</p>
            <p className="text-black dark:text-slate-100 text-xl font-semibold">{members.length}</p>
          </div>
          <TeamMembersIcon />
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

      {/* Members Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <MembersTable members={members} currentUserRole={currentUserRole} />
      </div>
    </div>
  );
}
