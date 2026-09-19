"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "../icons/AppLogo";
import { API } from "@/lib/api";

interface InviteInfo {
  org_name: string;
  email: string;
  role: string;
  token: string;
}

export default function InvitePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setError("No invite token provided.");
      setLoading(false);
      return;
    }
    setToken(t);

    fetch(`${API}/api/organization/invite/verify?token=${t}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success === false || json.error) {
          setError(json.error ?? "Invalid or expired invite link.");
        } else {
          const data = json.data ?? json;
          setInfo({
            org_name: data.org_name ?? data.orgName ?? "your organization",
            email: data.email ?? "",
            role: data.role ?? "member",
            token: t,
          });
        }
      })
      .catch(() => setError("Could not verify invite. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = () => {
    router.push(`/signup?invite_token=${token}`);
  };

  const handleSignIn = () => {
    router.push(`/signin?invite_token=${token}`);
  };

  return (
    <div className="min-h-screen bg-[var(--primary-background-color)] flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AppLogo />
        </div>

        {loading && (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Verifying invite…</p>
        )}

        {!loading && error && (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-2xl">✗</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite Invalid</h2>
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => router.push("/signin")}
              className="mt-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Go to Sign In
            </button>
          </div>
        )}

        {!loading && info && (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
              <span className="text-2xl">✉</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                You&apos;re invited!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Join <span className="font-semibold text-slate-800 dark:text-slate-100">{info.org_name}</span> on SyncSpace
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg px-4 py-3 text-sm text-left space-y-1">
              {info.email && (
                <p className="text-slate-600 dark:text-slate-300">
                  <span className="font-medium">Email:</span> {info.email}
                </p>
              )}
              <p className="text-slate-600 dark:text-slate-300 capitalize">
                <span className="font-medium">Role:</span> {info.role}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleAccept}
                className="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Accept &amp; Create Account
              </button>
              <button
                onClick={handleSignIn}
                className="w-full px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                I already have an account — Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
