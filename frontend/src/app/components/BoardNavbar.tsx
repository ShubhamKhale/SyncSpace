import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";

const BoardNavbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-indigo-500 font-semibold text-lg">SyncSpace</Link>
        <nav className="flex gap-6 text-slate-500 dark:text-slate-400 text-sm">
          <Link href="/dashboard" className="hover:text-slate-800 dark:hover:text-slate-100 transition">Dashboard</Link>
          <Link href="/dashboard/boards" className="hover:text-slate-800 dark:hover:text-slate-100 transition">Boards</Link>
          <Link href="/dashboard/history" className="hover:text-slate-800 dark:hover:text-slate-100 transition">History</Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Search className="text-slate-400 dark:text-slate-500" size={18} />
      </div>
    </div>
  );
};

export default BoardNavbar;
