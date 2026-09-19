"use client";
import React, { useState } from "react";
import AppLogo from "../icons/AppLogo";
import GoogleIcon from "../icons/GoogleIcon";
import GithubIcon from "../icons/GithubIcon";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { storeAuthTokens, API } from "@/lib/api";
import { useUserStore, User } from "@/app/store/useUserStore";

const Page = () => {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const inviteToken =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("invite_token")
          : null;
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ...(inviteToken ? { invite_token: inviteToken } : {}) }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Registration failed");
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

  const inputCls =
    "w-full px-3 py-2.5 mt-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";

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
            &ldquo;Onboarding our whole design + eng org took less than ten minutes. It just clicked.&rdquo;
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Marcus Ito — Head of Product, Loom Bay</p>
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

        <div className="max-w-md w-full mx-auto md:mx-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Free for teams up to 10. No credit card required.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full rounded-lg hover:cursor-pointer py-2.5 flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <GoogleIcon width={20} height={20} />
              <p className="font-medium text-sm">Sign up with Google</p>
            </button>
            <button
              onClick={() => signIn("github")}
              className="w-full rounded-lg hover:cursor-pointer py-2.5 flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <GithubIcon width={20} height={20} />
              <p className="font-medium text-sm">Sign up with GitHub</p>
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700" />
            <span className="mx-4 text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
              or use your email
            </span>
            <div className="flex-grow h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={inputCls}
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
                    placeholder="Create a password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[42%] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-300 font-medium">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[42%] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 hover:cursor-pointer">
              <input type="checkbox" required className="mt-0.5 h-4 w-4 hover:cursor-pointer accent-indigo-500" />
              <span>
                I agree to the{" "}
                <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/signin" className="text-indigo-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
