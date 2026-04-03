"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, X, Check, ImagePlus } from "lucide-react";
import Popover from "@/app/components/Popover";

interface Props {
  onClose: () => void;
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=60";

const availableMembers = [
  { name: "Alice Johnson", email: "alice@example.com" },
  { name: "Bob Smith",     email: "bob@example.com" },
  { name: "Carol Lee",     email: "carol@example.com" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const inputClass =
  "rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-full transition";
const labelClass =
  "block text-xs font-medium text-[var(--tertiary-text-color)] uppercase tracking-wide mb-1.5";

export default function AddBoardModal({ onClose }: Props) {
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [members, setMembers]           = useState<string[]>([]);
  const [membersOpen, setMembersOpen]   = useState(false);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const coverSrc = imagePreview || DEFAULT_COVER;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      alert("Please upload a valid image (PNG, JPG, JPEG, WEBP)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create board", { title, description, image: coverSrc, members });
    onClose();
  };

  const toggleMember = (email: string) => {
    setMembers((s) =>
      s.includes(email) ? s.filter((m) => m !== email) : [...s, email]
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <LayoutGrid size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-[var(--primary-text-color)]">
              Create New Board
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition hover:cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">

            {/* Title */}
            <div>
              <label className={labelClass}>Title</label>
              <input
                required
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Product Roadmap"
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this board…"
              />
            </div>

            {/* Cover */}
            <div>
              <label className={labelClass}>Cover Image</label>

              {/* Preview banner */}
              <div
                className="relative h-28 w-full rounded-xl overflow-hidden mb-3 group"
                style={{
                  backgroundImage: `url(${coverSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-slate-700 text-xs font-medium hover:bg-white hover:cursor-pointer"
                  >
                    <ImagePlus size={14} />
                    {imagePreview ? "Change image" : "Upload image"}
                  </button>
                </div>

                {/* Remove uploaded image */}
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition hover:cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Upload button (always visible below preview) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer"
              >
                <ImagePlus size={13} />
                {imagePreview ? "Change cover image" : "Upload cover image"}
              </button>
              <p className="mt-1 text-[11px] text-[var(--tertiary-text-color)]">
                PNG, JPG, JPEG, WEBP · Default image used if none uploaded
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Members */}
            <div>
              <label className={labelClass}>Members</label>
              <Popover
                button={
                  <button
                    type="button"
                    className={`${inputClass} flex justify-between items-center hover:cursor-pointer`}
                  >
                    <span className="text-slate-400">
                      {members.length === 0
                        ? "Select members…"
                        : `${members.length} member${members.length > 1 ? "s" : ""} selected`}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-400 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                }
                open={membersOpen}
                onOpenChange={setMembersOpen}
                className="w-full"
              >
                <div className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {availableMembers.map((u) => {
                    const selected = members.includes(u.email);
                    return (
                      <div
                        key={u.email}
                        onClick={() => toggleMember(u.email)}
                        className={`px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition ${
                          selected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center shrink-0">
                          {initials(u.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate text-[var(--primary-text-color)] ${selected ? "font-semibold" : ""}`}>
                            {u.name}
                          </p>
                          <p className="text-xs text-[var(--tertiary-text-color)] truncate">{u.email}</p>
                        </div>
                        {selected && <Check size={16} className="text-blue-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </Popover>

              {/* Member chips */}
              {members.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {members.map((email) => {
                    const member = availableMembers.find((m) => m.email === email);
                    if (!member) return null;
                    return (
                      <span
                        key={email}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 rounded-full pl-1 pr-2 py-1"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-semibold flex items-center justify-center">
                          {initials(member.name)}
                        </div>
                        <span className="text-xs text-[var(--primary-text-color)] truncate max-w-[8rem]">
                          {member.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleMember(email)}
                          className="text-slate-400 hover:text-red-500 transition hover:cursor-pointer leading-none"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-[var(--primary-text-color)] hover:bg-slate-50 dark:hover:bg-slate-700 transition hover:cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium rounded-lg bg-[var(--primary-button-background-color)] text-white hover:opacity-90 transition hover:cursor-pointer"
            >
              Create Board
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
