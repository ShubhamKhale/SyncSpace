import Link from "next/link";
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
  return (
    <div className="grid grid-cols-[280px_1fr] h-screen">
      <aside className="flex flex-col justify-between border border-[var(--sidebar-border-color)]">
        <div>
          <div className="flex p-4 items-center space-x-3 border-b border-b-[var(--sidebar-border-color)]">
            <p className="text-lg font-bold text-[var(--primary-button-background-color)]">
              SyncSpace
            </p>
            <AppLogo width={40} height={40} />
          </div>
          <div className=" mx-3">
            <button className=" mt-5 w-full flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-16 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
              <PlusIcon width={20} height={20} className="mt-1" />
              <p>New Board</p>
            </button>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/dashboard">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 bg-[var(--sidebar-option-background-color)] rounded-md">
                <DashboardIcon width={20} height={20} fill="#3B82F6" />
                <p className="font-medium text-[var(--sidebar-option-highlight-name-color)]">
                  Dashboard
                </p>
              </div>
            </Link>
            <Link href="/dashboard/boards">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)] rounded-md">
                <BoardIcon width={20} height={20} />
                <p className="font-medium ">Boards</p>
              </div>
            </Link>

            <Link href="/dashboard/history">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)] rounded-md">
                <HistoryIcon width={20} height={20} />
                <p className="font-medium">History</p>
              </div>
            </Link>

            <Link href="/dashboard/notifications">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)] rounded-md">
                <NotificationsIcon width={20} height={20} />
                <p className="font-medium">Notifications</p>
              </div>
            </Link>

            <Link href="/dashboard/settings">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)] rounded-md">
                <SettingsIcon width={20} height={20} />
                <p className="font-medium">Settings</p>
              </div>
            </Link>

            <Link href="/dashboard/profile">
              <div className="py-3 px-4 mx-2 cursor-pointer flex items-center space-x-3 hover:bg-[var(--sidebar-option-background-color)] text-[var(--sidebar-option-name-color)] hover:text-[var(--sidebar-option-highlight-name-color)] rounded-md">
                <ProfileIcon width={20} height={20} />
                <p className="font-medium">Profile</p>
              </div>
            </Link>
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
      <main className=" overflow-y-auto scrollbar-hide">{children}</main>
    </div>
  );
}
