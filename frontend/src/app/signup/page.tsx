"use client";
import React, { useState } from "react";
import AppLogo from "../icons/AppLogo";
import GoogleIcon from "../icons/GoogleIcon";
import GithubIcon from "../icons/GithubIcon";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { storeAuthTokens } from "@/lib/api";
import { useUserStore, User } from "@/app/store/useUserStore";

const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

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

  return (
    <div className="grid pt-3 py-12 bg-[var(--primary-background-color)] h-screen place-items-center">
      <div className="flex items-center space-x-3">
        <p className="text-2xl font-bold text-[var(--primary-button-background-color)]">
          SyncSpace
        </p>
        <AppLogo />
      </div>
      <p className="mt-2 text-2xl text-[var(--primary-text-color)]">
        Create your account
      </p>
      <p className="mt-1 text-sm text-[var(--secondary-text-color)]">
        Already have an account?{" "}
        <Link href="/signin">
          <span className="ml-3 hover:underline hover:cursor-pointer text-[var(--primary-button-background-color)]">
            Sign in
          </span>
        </Link>
      </p>

      <div className="mt-3 px-10 py-10 flex flex-col rounded-lg bg-white">
        <div
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="rounded-md hover:cursor-pointer py-2 space-x-3 flex items-center justify-center border border-[#D1D5DB]"
        >
          <GoogleIcon width={20} height={20} />
          <p className="ml-2 font-medium text-sm">Continue with Google</p>
        </div>
        <div
          onClick={() => signIn("github")}
          className="mt-5 rounded-md hover:cursor-pointer py-2 space-x-3 flex items-center justify-center border border-[#D1D5DB]"
        >
          <GithubIcon width={20} height={20} />
          <p className="ml-2 font-medium text-sm">Continue with Github</p>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-[#D1D5DB]"></div>
          <span className="mx-4 text-[var(--tertiary-text-color)] text-sm whitespace-nowrap">
            Or continue with email
          </span>
          <div className="flex-grow h-px bg-[#D1D5DB]"></div>
        </div>

        <form onSubmit={handleSignUp} className="mt-2 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between space-x-5">
            <div>
              <div>
                <p className="text-sm text-[var(--quaternary-text-color)]">
                  Full Name
                </p>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color)] focus:border-[var(--primary-button-background-color)]"
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[var(--quaternary-text-color)]">
                  Email address
                </p>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color)] focus:border-[var(--primary-button-background-color)]"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <p className="text-sm text-[var(--quaternary-text-color)]">
                  Password
                </p>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color)] focus:border-[var(--primary-button-background-color)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative mt-4">
                <p className="text-sm text-[var(--quaternary-text-color)]">
                  Confirm Password
                </p>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color)] focus:border-[var(--primary-button-background-color)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 hover:cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <label className="flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
              <input
                type="checkbox"
                required
                className="mr-2 h-4 w-4 hover:cursor-pointer"
              />
              I agree to the
            </label>
            <a
              href="#"
              className="text-sm text-[var(--primary-button-background-color)] hover:underline"
            >
              Terms and Services
            </a>
            <p className="text-sm text-[var(--quaternary-text-color)]">and</p>
            <a
              href="#"
              className="text-sm text-[var(--primary-button-background-color)] hover:underline"
            >
              Privacy Policy
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md hover:cursor-pointer w-full px-3 py-2 bg-[var(--primary-button-background-color)] text-white hover:bg-white hover:text-[var(--primary-button-background-color)] hover:border hover:border-[var(--primary-button-background-color)] text-center disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
