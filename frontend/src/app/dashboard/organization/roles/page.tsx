const roles = [
  {
    name: "Owner",
    color: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    description: "Full control over the organization, members, and all settings.",
  },
  {
    name: "Admin",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    description: "Can invite/remove members and manage boards, but cannot change roles.",
  },
  {
    name: "Member",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    description: "Can create and edit tasks on boards they have access to.",
  },
  {
    name: "Viewer",
    color: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
    description: "Read-only access to boards. Cannot create or edit anything.",
  },
];

const permissions = [
  { label: "Edit organization name",     owner: true,  admin: true,  member: false, viewer: false },
  { label: "Invite members",             owner: true,  admin: true,  member: false, viewer: false },
  { label: "Remove members",             owner: true,  admin: true,  member: false, viewer: false },
  { label: "Change member roles",        owner: true,  admin: false, member: false, viewer: false },
  { label: "Create & delete boards",     owner: true,  admin: true,  member: false, viewer: false },
  { label: "Edit tasks",                 owner: true,  admin: true,  member: true,  viewer: false },
  { label: "View boards",                owner: true,  admin: true,  member: true,  viewer: true  },
];

function Check() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Dash() {
  return <span className="text-gray-300 dark:text-slate-600 text-lg font-light">—</span>;
}

export default function RolesPage() {
  return (
    <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 bg-slate-100 dark:bg-slate-900 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <p className="font-semibold text-xl text-[var(--primary-text-color)]">
          Roles & Permissions
        </p>
      </div>

      {/* Role Definition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {roles.map((role) => (
          <div key={role.name} className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${role.dot}`} />
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${role.color}`}>
                {role.name}
              </span>
            </div>
            <p className="text-sm text-[#6B7280] dark:text-slate-400 leading-relaxed">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-3 border-b border-[var(--sidebar-option-background-color)] dark:border-slate-700">
          Permission Matrix
        </h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider rounded-l-lg w-1/2">
                Permission
              </th>
              {roles.map((r) => (
                <th
                  key={r.name}
                  className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider text-center"
                >
                  <span className={`px-2 py-1 rounded-full ${r.color}`}>{r.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {permissions.map((perm) => (
              <tr key={perm.label} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">{perm.label}</td>
                <td className="px-4 py-3 text-center">{perm.owner  ? <Check /> : <Dash />}</td>
                <td className="px-4 py-3 text-center">{perm.admin  ? <Check /> : <Dash />}</td>
                <td className="px-4 py-3 text-center">{perm.member ? <Check /> : <Dash />}</td>
                <td className="px-4 py-3 text-center">{perm.viewer ? <Check /> : <Dash />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
