"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";
import { useUserStore, getInitials } from "@/app/store/useUserStore";
import { isAuthenticated } from "@/lib/api";
import AppLogo from "../icons/AppLogo";
import BoardIcon from "../icons/BoardIcon";
import DashboardIcon from "../icons/DashboardIcon";
import HistoryIcon from "../icons/HistoryIcon";
import NotificationsIcon from "../icons/NotificationsIcon";
import ProfileIcon from "../icons/ProfileIcon";
import SettingsIcon from "../icons/SettingsIcon";
import OrganizationIcon from "../icons/OrganizationIcon";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, darkModeToggle } = useTheme();
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }
    fetchUser();
  }, []);

  // Check if the current path is a board-scoped full-screen view (overview, tasks kanban, or flow editor)
  const isBoardPage =
    /^\/dashboard\/boards\/[^/]+$/.test(pathname ?? "") ||
    /^\/dashboard\/boards\/[^/]+\/tasks$/.test(pathname ?? "") ||
    /^\/dashboard\/boards\/[^/]+\/flows\/[^/]+$/.test(pathname ?? "");

  const navGroups = [
    [
      { href: "/dashboard",              label: "Dashboard",    Icon: DashboardIcon    },
      { href: "/dashboard/boards",       label: "Boards",       Icon: BoardIcon        },
    ],
    [
      { href: "/dashboard/history",      label: "History",      Icon: HistoryIcon      },
      { href: "/dashboard/notifications",label: "Notifications",Icon: NotificationsIcon},
      { href: "/dashboard/organization", label: "Organization", Icon: OrganizationIcon },
    ],
    [
      { href: "/dashboard/settings",     label: "Settings",     Icon: SettingsIcon     },
      { href: "/dashboard/profile",      label: "Profile",      Icon: ProfileIcon      },
    ],
  ];

  const NavContent = () => (
    <>
      <div>
        <div className="flex px-5 py-4 items-center space-x-3 border-b border-[var(--sidebar-border-color)]">
          <AppLogo width={32} height={32} />
          <p className="text-lg font-bold text-[var(--primary-button-background-color)]">
            SyncSpace
          </p>
        </div>

        <div className="mt-5 px-3 space-y-1">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && (
                <p className="mt-4 mb-1.5 px-3 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {gi === 1 ? "Workspace" : "Account"}
                </p>
              )}
              <div className="space-y-0.5">
                {group.map(({ href, label, Icon }) => {
                  const isActive =
                    pathname === href ||
                    (href !== "/dashboard" && pathname?.startsWith(href + "/"));
                  return (
                    <Link key={href} href={href} onClick={() => setMobileNavOpen(false)}>
                      <div
                        className={`py-2.5 px-3 cursor-pointer flex items-center space-x-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-l-[3px] border-indigo-500"
                            : "text-[#6B7280] dark:text-[#6B7194] hover:bg-slate-50 dark:hover:bg-[#181C30] hover:text-slate-800 dark:hover:text-[#C8CDE7] border-l-[3px] border-transparent"
                        }`}
                      >
                        <Icon width={18} height={18} fill={isActive ? "var(--color-indigo-500)" : "#9CA3AF"} />
                        <p className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{label}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--sidebar-border-color)]">
        {/* User row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center rounded-full w-9 h-9 bg-indigo-500 text-white text-sm font-semibold flex-shrink-0">
            {user ? getInitials(user.name) : "…"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name || "Loading…"}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
          </div>
        </div>
        {/* Theme toggle row */}
        <button
          onClick={darkModeToggle}
          className="w-full flex items-center justify-between px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#181C30] transition border-t border-[var(--sidebar-border-color)]"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="flex items-center gap-2.5">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm font-medium">{theme === "dark" ? "Dark" : "Light"}</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-400">toggle</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] h-screen bg-[#F8F9FC] dark:bg-slate-900">
      {/* Desktop sidebar */}
      {!isBoardPage && (
        <aside className="hidden lg:flex flex-col justify-between bg-white dark:bg-slate-800 border-r border-[var(--sidebar-border-color)] dark:border-slate-700">
          <NavContent />
        </aside>
      )}

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-800 flex flex-col justify-between border-r border-[var(--sidebar-border-color)] shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            <NavContent />
          </aside>
        </div>
      )}

      <main
        className={
          isBoardPage
            ? "col-span-full overflow-y-auto scrollbar-hide"
            : "overflow-y-auto scrollbar-hide"
        }
      >
        {/* Mobile hamburger bar */}
        {!isBoardPage && (
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-[var(--sidebar-border-color)] dark:border-slate-700">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition"
            >
              <Menu size={22} />
            </button>
            <AppLogo width={28} height={28} />
            <p className="text-base font-bold text-indigo-500">
              SyncSpace
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
