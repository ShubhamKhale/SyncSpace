"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "../icons/AppLogo";
import BoardIcon from "../icons/BoardIcon";
import DashboardIcon from "../icons/DashboardIcon";
import HistoryIcon from "../icons/HistoryIcon";
import NotificationsIcon from "../icons/NotificationsIcon";
import PlusIcon from "../icons/PlusIcon";
import ProfileIcon from "../icons/ProfileIcon";
import SettingsIcon from "../icons/SettingsIcon";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the current path is for an individual board
  const isBoardPage = /^\/dashboard\/boards\/[^/]+$/.test(pathname || "");

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      Icon: DashboardIcon,
    },
    {
      href: "/dashboard/boards",
      label: "Boards",
      Icon: BoardIcon,
    },
    {
      href: "/dashboard/history",
      label: "History",
      Icon: HistoryIcon,
    },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      Icon: NotificationsIcon,
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      Icon: SettingsIcon,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      Icon: ProfileIcon,
    },
  ];

  return (
    <div className="grid grid-cols-[280px_1fr] h-screen">
      {!isBoardPage && (
        <aside className="flex flex-col justify-between border border-[var(--sidebar-border-color)]">
          <div>
            <div className="flex p-4 items-center space-x-3 border-b border-b-[var(--sidebar-border-color)]">
              <p className="text-lg font-bold text-[var(--primary-button-background-color)]">
                SyncSpace
              </p>
              <AppLogo width={40} height={40} />
            </div>

            <div className="mx-3">
              <button className="mt-5 w-full flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer px-16 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
                <PlusIcon width={20} height={20} className="mt-1" />
                <p>New Board</p>
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {navLinks.map(({ href, label, Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link key={href} href={href}>
                    <div
                      className={`py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 rounded-md ${
                        isActive
                          ? "bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-highlight-name-color)]"
                          : "hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)]"
                      }`}
                    >
                      <Icon
                        width={20}
                        height={20}
                        fill={isActive ? "#3B82F6" : "#374151"}
                      />
                      <p className="font-medium">{label}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-3 py-4 flex items-center space-x-5 border-t border-t-[var(--sidebar-border-color)]">
            <p className="text-center flex items-center rounded-full w-10 h-10 p-3 bg-[var(--primary-background-color)] text-[var(--primary-button-background-color)]">
              JS
            </p>
            <div>
              <p className="text-sm">John Smith</p>
              <p className="text-xs">john@example.com</p>
            </div>
          </div>
        </aside>
      )}

      <main className={isBoardPage ? "col-span-2 overflow-y-auto scrollbar-hide" : "overflow-y-auto scrollbar-hide"}>
        {children}
      </main>
    </div>
  );
}
