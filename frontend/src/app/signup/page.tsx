import React from "react";
import AppLogo from "../icons/AppLogo";
import GoogleIcon from "../icons/GoogleIcon";
import GithubIcon from "../icons/GithubIcon";

const Page = () => {
  return (
    <div className="grid pt-3 py-12 bg-[var(--primary-background-color)] place-items-center">
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
        <span className="ml-3 hover:underline hover:cursor-pointer text-[var(--primary-button-background-color)]">
          Sign in
        </span>
      </p>

      <div className="mt-3 px-10 py-10 flex flex-col rounded-lg bg-white">
        <div className="rounded-md hover:cursor-pointer py-2 space-x-3 flex items-center justify-center border border-[#D1D5DB]">
          <GoogleIcon width={20} height={20} />
          <p className="ml-2 font-medium text-sm">Continue with Google</p>
        </div>
        <div className="mt-5 rounded-md hover:cursor-pointer py-2 space-x-3 flex items-center justify-center border border-[#D1D5DB]">
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
              Full Name 
            </p>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color))] focus:border-[var(--primary-button-background-color)]"
            />
          </div>
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
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color))] focus:border-[var(--primary-button-background-color)]"
            />
          </div>
          <div>
            <p className="text-sm text-[var(--quaternary-text-color)]">
              Confirm Password
            </p>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-3 py-2 mt-1 placeholder:text-[var(--placeholder-text-color)] border border-[#D1D5DB] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--quaternary-text-color))] focus:border-[var(--primary-button-background-color)]"
            />
          </div>
          <div className="flex items-center justify-between space-x-2 mb-4">
            <label className="flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
              <input type="checkbox" className="mr-2 h-4 w-4" />
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
          <button className="rounded-md hover:cursor-pointer w-full px-3 py-2 bg-[var(--primary-button-background-color)] text-white hover:bg-white hover:text-[var(--primary-button-background-color)] hover:border hover:border-[var(--primary-button-background-color)] text-center">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
