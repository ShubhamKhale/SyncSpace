"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              SyncSpace hit an unexpected error. Try reloading — if it keeps happening, let us know.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
