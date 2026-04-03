"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/organization", label: "Overview" },
    { href: "/dashboard/organization/members", label: "Members" },
    { href: "/dashboard/organization/roles", label: "Roles & Permissions" },
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-900 h-full">
      <div className="px-4 md:px-8 py-4 border-b bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
        <nav className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}>
                <span
                  className={`cursor-pointer pb-2 font-medium text-sm ${
                    isActive
                      ? "border-b-2 border-[var(--primary-button-background-color)] text-[var(--primary-button-background-color)]"
                      : "text-[var(--quaternary-text-color)] hover:text-[var(--primary-button-background-color)]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
