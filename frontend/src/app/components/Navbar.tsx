import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-indigo-500" />
        <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">SyncSpace</p>
      </Link>
      <div className="hidden md:inline-flex items-center text-sm font-medium gap-10 text-slate-600 dark:text-slate-300">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link>
        <Link href="/#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</Link>
        <Link href="/#pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing</Link>
      </div>
      <div className="inline-flex items-center gap-4">
        <Link href="/signin" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
