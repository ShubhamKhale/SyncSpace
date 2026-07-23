"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Check, X } from "lucide-react";

interface NotificationPrefs {
  comments: boolean;
  invites: boolean;
  product_updates: boolean;
}

const PREFS_CONFIG = [
  {
    key: "comments" as keyof NotificationPrefs,
    label: "Comments",
    desc: "Get notified when someone comments on your boards.",
  },
  {
    key: "invites" as keyof NotificationPrefs,
    label: "Invites",
    desc: "Get notified when you are invited to a board.",
  },
  {
    key: "product_updates" as keyof NotificationPrefs,
    label: "Product Updates",
    desc: "Get notified about new features and updates.",
  },
];

type ToastType = "success" | "error";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    comments: true,
    invites: true,
    product_updates: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; msg: string } | null>(null);

  useEffect(() => {
    apiFetch<NotificationPrefs>("/api/settings/notifications")
      .then(data => setPrefs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: ToastType, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch<NotificationPrefs>("/api/settings/notifications", {
        method: "PATCH",
        body: JSON.stringify(prefs),
      });
      setPrefs(updated);
      showToast("success", "Preferences saved.");
    } catch (err) {
      showToast("error", (err as Error).message ?? "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationPrefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="bg-[#F8F9FC] dark:bg-slate-900 min-h-screen pt-6 px-4 md:px-8 lg:px-12 pb-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "success"
            ? <Check size={16} />
            : <X size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account preferences.</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-base text-slate-800 dark:text-slate-100">Notifications</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your notification preferences.</p>
        </div>

        {/* Prefs list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-400 text-center">Loading preferences…</div>
          ) : (
            PREFS_CONFIG.map(({ key, label, desc }) => (
              <div
                key={key}
                onClick={() => toggle(key)}
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition group"
              >
                <div>
                  <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
                {/* Toggle */}
                <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  prefs[key] ? "bg-[#6366F1]" : "bg-slate-200 dark:bg-slate-600"
                }`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    prefs[key] ? "translate-x-5" : "translate-x-0"
                  }`} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
