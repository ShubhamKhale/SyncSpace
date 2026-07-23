"use client";

import { useState } from "react";
import Popover from "../../../components/Popover";
import { Role } from "../types";
import { apiFetch } from "@/lib/api";

interface Props {
  onClose: () => void;
}

const INVITABLE_ROLES: Role[] = ["admin", "member", "viewer"];

export default function InviteMemberModal({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await apiFetch("/api/organization/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      setSuccess(`Invite sent to ${email}`);
      setEmail("");
      setRole("member");
    } catch (err) {
      setError((err as Error).message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-4 pb-3 border-b border-[var(--sidebar-option-background-color)] dark:border-slate-700">
          Invite New Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
              {success}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 px-3 py-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <Popover
              button={
                <button
                  type="button"
                  className="w-full border dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 px-2 py-3 text-sm text-left flex justify-between items-center hover:cursor-pointer rounded"
                >
                  <span className="capitalize">{role}</span>
                  <svg
                    className="w-4 h-4 ml-1 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              }
              open={roleOpen}
              onOpenChange={setRoleOpen}
              className="w-full"
            >
              <div className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded shadow-lg">
                {INVITABLE_ROLES.map((r) => (
                  <div
                    key={r}
                    className={`px-3 py-2 text-sm cursor-pointer capitalize hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-slate-200 ${
                      r === role ? "font-semibold" : ""
                    }`}
                    onClick={() => {
                      setRole(r);
                      setRoleOpen(false);
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </Popover>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-slate-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition hover:cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-sm rounded-lg hover:bg-blue-700 transition hover:cursor-pointer disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
