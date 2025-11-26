"use client";
import React, { useState } from "react";
import AppLogo from "../icons/AppLogo";
import GoogleIcon from "../icons/GoogleIcon";
import GithubIcon from "../icons/GithubIcon";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

const Page = () => {
  const { data: session } = useSession();
  console.log("session", session);
  // {session?.user?.name}

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid h-screen pt-3 py-12 bg-[var(--primary-background-color)] place-items-center">
      <div className="flex items-center space-x-3">
        <p className="text-2xl font-bold text-[var(--primary-button-background-color)]">
          SyncSpace
        </p>
        <AppLogo />
      </div>
      <p className="mt-2 text-2xl text-[var(--primary-text-color)]">
        Sign in to your account
      </p>
      <p className="mt-1 text-sm text-[var(--secondary-text-color)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup">
          <span className="ml-3 hover:underline hover:cursor-pointer text-[var(--primary-button-background-color)]">
            Sign up
          </span>
        </Link>
      </p>

      {/* <button onClick={() => signOut()}>Sign out</button> */}
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
        <div className="mt-2 space-y-5">
          <div>
            <p className="text-sm text-[var(--quaternary-text-color)]">
              Email address
            </p>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color))] focus:border-[var(--primary-button-background-color)]"
            />
          </div>
          <div>
            <p className="text-sm text-[var(--quaternary-text-color)]">
              Password
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color)] focus:border-[var(--primary-button-background-color)] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38%] hover:cursor-pointer text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-28 mb-4">
            <label className="flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
              <input type="checkbox" className="mr-2 h-4 w-4 hover:cursor-pointer" />
              Remember me
            </label>
            <a
              href="#"
              className="text-sm mr-6 text-[var(--primary-button-background-color)] hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <button className="rounded-md hover:cursor-pointer w-full px-3 py-2 bg-[var(--primary-button-background-color)] text-white hover:bg-white hover:text-[var(--primary-button-background-color)] hover:border hover:border-[var(--primary-button-background-color)] text-center">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
