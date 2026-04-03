"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, darkModeToggle } = useTheme();

  // Check if the current path is for an individual board
  const isBoardPage = /^\/dashboard\/boards\/[^/]+$/.test(pathname || "");

  const navLinks = [
    { href: "/dashboard",              label: "Dashboard",    Icon: DashboardIcon    },
    { href: "/dashboard/boards",       label: "Boards",       Icon: BoardIcon        },
    { href: "/dashboard/history",      label: "History",      Icon: HistoryIcon      },
    { href: "/dashboard/notifications",label: "Notifications",Icon: NotificationsIcon},
    { href: "/dashboard/organization", label: "Organization", Icon: OrganizationIcon },
    { href: "/dashboard/settings",     label: "Settings",     Icon: SettingsIcon     },
    { href: "/dashboard/profile",      label: "Profile",      Icon: ProfileIcon      },
  ];

  const NavContent = () => (
    <>
      <div>
        <div className="flex p-4 items-center space-x-3 border-b border-b-[var(--sidebar-border-color)]">
          <p className="text-lg font-bold text-[var(--primary-button-background-color)]">
            SyncSpace
          </p>
          <AppLogo width={40} height={40} />
        </div>

        <div className="mt-8 space-y-3">
          {navLinks.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname?.startsWith(href + "/"));
            return (
              <Link key={href} href={href} onClick={() => setMobileNavOpen(false)}>
                <div
                  className={`py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 rounded-md ${
                    isActive
                      ? "bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-highlight-name-color)]"
                      : "hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)]"
                  }`}
                >
                  <Icon width={20} height={20} fill={isActive ? "#3B82F6" : "#374151"} />
                  <p className="font-medium">{label}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="px-3 py-4 flex items-center justify-between border-t border-t-[var(--sidebar-border-color)]">
        <div className="flex items-center space-x-3">
          <p className="text-center flex items-center rounded-full w-10 h-10 p-3 bg-[var(--primary-background-color)] text-[var(--primary-button-background-color)]">
            JS
          </p>
          <div>
            <p className="text-sm text-[var(--primary-text-color)]">John Smith</p>
            <p className="text-xs text-[var(--tertiary-text-color)]">john@example.com</p>
          </div>
        </div>
        <button
          onClick={darkModeToggle}
          className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-screen bg-slate-100 dark:bg-slate-900">
      {/* Desktop sidebar */}
      {!isBoardPage && (
        <aside className="hidden lg:flex flex-col justify-between border border-[var(--sidebar-border-color)] bg-slate-50 dark:bg-slate-800">
          <NavContent />
        </aside>
      )}

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-50 dark:bg-slate-800 flex flex-col justify-between border-r border-[var(--sidebar-border-color)] shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition"
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
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1 rounded-md text-slate-600 hover:bg-slate-200 transition"
            >
              <Menu size={22} />
            </button>
            <p className="text-base font-bold text-[var(--primary-button-background-color)]">
              SyncSpace
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
