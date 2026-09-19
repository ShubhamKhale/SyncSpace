"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-slate-900 px-4">
      <div className="text-center max-w-sm">
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This page hit an unexpected error. You can try again or head back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition"
          >
            Back to dashboard
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
