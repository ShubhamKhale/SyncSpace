"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, encryptedFetch, isAuthenticated } from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";
import AppLogo from "../icons/AppLogo";

const COLORS = [
  "#2563EB", "#7C3AED", "#DC2626", "#D97706",
  "#059669", "#0891B2", "#DB2777", "#374151",
];

const STEPS = ["Create Organization", "Invite Team", "Create First Board"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, fetchUser, setUser } = useUserStore();
  const [step, setStep] = useState(0);

  // Step 1
  const [orgName, setOrgName] = useState("");
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");

  // Step 2
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [sentInvites, setSentInvites] = useState<string[]>([]);

  // Step 3
  const [boardName, setBoardName] = useState("");
  const [boardColor, setBoardColor] = useState(COLORS[0]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState("");

  const checkedInitialOrgRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }
    if (!user) {
      fetchUser();
      return;
    }
    if (!checkedInitialOrgRef.current) {
      checkedInitialOrgRef.current = true;
      if (user.hasOrg) {
        router.push("/dashboard");
      }
    }
  }, [user]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError("");
    setOrgLoading(true);
    try {
      const data = await apiFetch<{ id: string; name: string }>("/api/organization", {
        method: "POST",
        body: JSON.stringify({ name: orgName }),
      });
      if (user) {
        setUser({ ...user, orgId: data.id, hasOrg: true, role: "owner" });
      }
      setStep(1);
    } catch (err) {
      setOrgError((err as Error).message || "Failed to create organization");
    } finally {
      setOrgLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteLoading(true);
    try {
      await apiFetch("/api/organization/invite", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      setSentInvites((prev) => [...prev, inviteEmail]);
      setInviteEmail("");
    } catch (err) {
      setInviteError((err as Error).message || "Failed to send invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setBoardError("");
    setBoardLoading(true);
    try {
      await encryptedFetch("/api/boards", "POST", {
        title: boardName,
        description: "",
        coverColor: boardColor,
      });
      router.push("/dashboard");
    } catch (err) {
      setBoardError((err as Error).message || "Failed to create board");
    } finally {
      setBoardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-background-color)] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <p className="text-2xl font-bold text-[var(--primary-button-background-color)]">SyncSpace</p>
        <AppLogo />
      </div>

      {/* Progress steps */}
      <div className="flex items-center space-x-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  i < step
                    ? "bg-[var(--primary-button-background-color)] text-white"
                    : i === step
                    ? "bg-[var(--primary-button-background-color)] text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <p className={`text-xs mt-1 whitespace-nowrap ${i === step ? "text-[var(--primary-button-background-color)] font-medium" : "text-gray-400"}`}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mb-4 mx-1 ${i < step ? "bg-[var(--primary-button-background-color)]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step cards */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* STEP 1: Create Organization */}
        {step === 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Name your organization</h2>
            <p className="text-sm text-gray-500 mb-6">This is how your team will identify your workspace.</p>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              {orgError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{orgError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={orgLoading}
                className="w-full py-2.5 bg-[var(--primary-button-background-color)] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 hover:cursor-pointer"
              >
                {orgLoading ? "Creating…" : "Create Organization →"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Invite Team */}
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Invite your team</h2>
            <p className="text-sm text-gray-500 mb-6">They&apos;ll receive an email to join your organization.</p>
            <form onSubmit={handleSendInvite} className="space-y-4">
              {inviteError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{inviteError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "member" | "viewer")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {sentInvites.length > 0 && (
                <div className="space-y-1">
                  {sentInvites.map((email) => (
                    <p key={email} className="text-xs text-green-600 flex items-center gap-1">
                      <span>✓</span> Invite sent to {email}
                    </p>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={inviteLoading || !inviteEmail}
                className="w-full py-2.5 bg-[var(--primary-button-background-color)] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 hover:cursor-pointer"
              >
                {inviteLoading ? "Sending…" : "Send Invite"}
              </button>
            </form>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-3 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition hover:cursor-pointer"
            >
              Skip for now →
            </button>
          </>
        )}

        {/* STEP 3: Create First Board */}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your first board</h2>
            <p className="text-sm text-gray-500 mb-6">Boards are where your team organizes work.</p>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              {boardError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{boardError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Board name</label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Product Roadmap"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBoardColor(c)}
                      className={`w-8 h-8 rounded-full transition hover:cursor-pointer ${boardColor === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={boardLoading || !boardName}
                className="w-full py-2.5 bg-[var(--primary-button-background-color)] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 hover:cursor-pointer"
              >
                {boardLoading ? "Creating…" : "Create Board & Go to Dashboard →"}
              </button>
            </form>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-3 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition hover:cursor-pointer"
            >
              Skip, go to dashboard →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
