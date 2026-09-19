"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { apiFetch, API } from "@/lib/api";
import { Check, X } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar_url?: string;
}

const inputCls = "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition";

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    apiFetch<UserProfile>("/api/user/me")
      .then((user) => {
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setAvatarPreview(user.avatarUrl ?? user.avatar_url ?? "");
      })
      .catch(() => {});
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      showToast("error", "Only PNG, JPG, JPEG allowed.");
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast("error", "Image must be under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setAvatarUploading(true);
    try {
      const jwt = localStorage.getItem("ss_jwt");
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch(`${API}/api/user/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: form,
      });
      const json = await res.json();
      if (json.success === false) throw new Error(json.error ?? "Upload failed");
      const url: string = json.data?.avatar_url ?? "";
      if (url) setAvatarPreview(url);
      showToast("success", "Avatar updated.");
    } catch (err) {
      showToast("error", (err as Error).message ?? "Avatar upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, email }),
      });
      showToast("success", "Profile saved.");
    } catch (err) {
      showToast("error", (err as Error).message ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F8F9FC] dark:bg-slate-900 min-h-screen pt-6 px-4 md:px-8 lg:px-12 pb-10">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      <h1 className="text-slate-800 dark:text-slate-100 font-semibold text-xl mb-6">
        Profile
      </h1>

      <div className="rounded-xl mt-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Personal Information</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your profile information visible to other users.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" className="w-14 h-14 rounded-full object-cover flex-shrink-0" width={56} height={56} />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-lg font-bold flex-shrink-0">
                {name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div className="space-y-1">
              <button
                className={`rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition ${avatarUploading ? "opacity-60 pointer-events-none" : ""}`}
                onClick={handleAvatarClick}
              >
                {avatarUploading ? "Uploading…" : "Change avatar"}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, JPEG up to 1MB</p>
              <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input className={inputCls} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
