"use client";
import React, { useState } from "react";
import AppLogo from "../icons/AppLogo";
import GoogleIcon from "../icons/GoogleIcon";
import GithubIcon from "../icons/GithubIcon";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { storeAuthTokens, API } from "@/lib/api";
import { useUserStore, User } from "@/app/store/useUserStore";

const Page = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Invalid email or password");
        return;
      }
      const { token, session_key, user } = json.data;
      storeAuthTokens(token, session_key, user.id);
      setUser(user as User);
      router.push(user.hasOrg ? "/dashboard" : "/onboarding");
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white dark:bg-slate-900">
      {/* Left panel */}
      <div className="hidden md:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-50 via-indigo-50 to-violet-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
        <div className="pointer-events-none absolute -top-16 right-0 w-80 h-80 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative inline-flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-indigo-500" />
          <p className="text-slate-900 dark:text-slate-100 text-lg font-bold">SyncSpace</p>
        </div>

        <div className="relative space-y-4 max-w-md">
          <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            &ldquo;We replaced three tools with SyncSpace. Our architecture reviews are now 20 minutes instead of a full afternoon.&rdquo;
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dana Ruiz — Eng Lead, Fielding Labs</p>
        </div>

        <div className="relative flex items-center gap-10">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">2,400+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Teams onboard</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">98.9%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uptime SLA</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">4.8/5</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average rating</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="md:hidden inline-flex items-center gap-3 mb-8">
          <p className="text-2xl font-bold text-indigo-500">SyncSpace</p>
          <AppLogo />
        </div>

        <div className="max-w-sm w-full mx-auto md:mx-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to pick up where your team left off.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full rounded-lg hover:cursor-pointer py-2.5 flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <GoogleIcon width={20} height={20} />
              <p className="font-medium text-sm">Continue with Google</p>
            </button>
            <button
              onClick={() => signIn("github")}
              className="w-full rounded-lg hover:cursor-pointer py-2.5 flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <GithubIcon width={20} height={20} />
              <p className="font-medium text-sm">Continue with GitHub</p>
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700" />
            <span className="mx-4 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
              or continue with email
            </span>
            <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 mt-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42%] hover:cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center hover:cursor-pointer text-sm text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="mr-2 h-4 w-4 hover:cursor-pointer accent-indigo-500" />
                Remember me
              </label>
              <a href="#" className="text-sm text-indigo-500 hover:underline">
                Forgot your password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-500 hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
