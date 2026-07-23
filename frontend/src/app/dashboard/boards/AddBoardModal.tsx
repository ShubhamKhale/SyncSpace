"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown, ChevronRight, ImagePlus, LayoutGrid, Plus, X,
} from "lucide-react";
import { encryptedFetch, apiFetch } from "@/lib/api";
import { writeLocalMeta } from "@/app/store/useBoardStore";
import type { BoardTag, BoardStatus } from "@/app/store/useBoardStore";

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

interface Resource {
  label: string;
  url: string;
}

const COLORS = [
  "#2563EB", "#7C3AED", "#DC2626", "#D97706",
  "#059669", "#0891B2", "#DB2777", "#374151",
];

const TAG_COLORS = [
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#FCE7F3", text: "#BE185D" },
  { bg: "#FEE2E2", text: "#B91C1C" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#E0F2FE", text: "#0369A1" },
  { bg: "#F3F4F6", text: "#374151" },
];

const STATUS_OPTIONS: { value: BoardStatus; label: string; dot: string }[] = [
  { value: "active",    label: "Active",    dot: "bg-emerald-400" },
  { value: "on-hold",   label: "On Hold",   dot: "bg-amber-400"   },
  { value: "archived",  label: "Archived",  dot: "bg-slate-400"   },
];

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop&q=60";

const inputClass =
  "rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-full transition";
const labelClass =
  "block text-xs font-medium text-[var(--tertiary-text-color)] uppercase tracking-wide mb-1.5";
const sectionHeaderClass =
  "flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 py-2 hover:text-slate-700 dark:hover:text-slate-200 transition hover:cursor-pointer select-none";

export default function AddBoardModal({ onClose, onCreated }: Props) {
  // Core
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  // Additional details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [coverColor, setCoverColor]   = useState(COLORS[0]);
  const [status, setStatus]           = useState<BoardStatus>("active");
  const [tags, setTags]               = useState<BoardTag[]>([]);
  const [tagInput, setTagInput]       = useState("");
  const [tagColorIdx, setTagColorIdx] = useState(0);

  // Linked resources
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [resources, setResources]         = useState<Resource[]>([]);
  const [resourceError, setResourceError] = useState("");

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

  const addTag = () => {
    const label = tagInput.trim();
    if (!label) return;
    if (tags.find((t) => t.label.toLowerCase() === label.toLowerCase())) return;
    const { bg, text } = TAG_COLORS[tagColorIdx % TAG_COLORS.length];
    setTags([...tags, { label, color: bg, textColor: text }]);
    setTagInput("");
    setTagColorIdx((i) => (i + 1) % TAG_COLORS.length);
  };

  const addResource = () => {
    setResources([...resources, { label: "", url: "" }]);
  };

  const updateResource = (idx: number, field: keyof Resource, value: string) => {
    setResources((rs) => rs.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const removeResource = (idx: number) => {
    setResources((rs) => rs.filter((_, i) => i !== idx));
  };

  const validateResources = (): boolean => {
    for (const r of resources) {
      if (r.url && !r.url.startsWith("http")) {
        setResourceError(`URL "${r.url}" must start with http`);
        return false;
      }
    }
    setResourceError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResources()) return;
    setError("");
    setSubmitting(true);
    try {
      const board = await encryptedFetch<{ id: string }>(
        "/api/boards", "POST", { title, description }
      );
      const boardId = board?.id;
      if (boardId) {
        writeLocalMeta(boardId, { tags, status, coverColor });
        const validResources = resources.filter((r) => r.url.trim());
        if (validResources.length > 0) {
          try {
            await apiFetch(`/api/boards/${boardId}/linked-resources`, {
              method: "PUT",
              body: JSON.stringify({
                resources: validResources.map((r) => ({
                  label: r.label || r.url,
                  url: r.url,
                })),
              }),
            });
          } catch {
            // Board created — linked resources failed, non-blocking
          }
        }
      }
      onCreated?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
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
              <label className={labelClass}>Title <span className="text-red-400">*</span></label>
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
              <label className={labelClass}>Description <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
              <textarea
                rows={2}
                className={`${inputClass} resize-none`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of this board…"
              />
            </div>

            {/* ── Additional Details (collapsible) ────────────────────── */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className={`${sectionHeaderClass} px-4`}
              >
                <span>Additional Details</span>
                {detailsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {detailsOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-3">

                  {/* Cover Color */}
                  <div>
                    <label className={labelClass}>Cover Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCoverColor(c)}
                          className="w-7 h-7 rounded-full transition hover:scale-110 hover:cursor-pointer"
                          style={{
                            backgroundColor: c,
                            outline: coverColor === c ? `2px solid ${c}` : "none",
                            outlineOffset: "2px",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={labelClass}>Status</label>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(opt.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition hover:cursor-pointer ${
                            status === opt.value
                              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={labelClass}>Tags <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tag.color, color: tag.textColor }}
                        >
                          {tag.label}
                          <button
                            type="button"
                            onClick={() => setTags(tags.filter((t) => t.label !== tag.label))}
                            className="hover:opacity-60 hover:cursor-pointer leading-none"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className={`${inputClass} flex-1`}
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Tag label…"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition hover:cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Linked Resources (collapsible) ──────────────────────── */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setResourcesOpen((o) => !o)}
                className={`${sectionHeaderClass} px-4`}
              >
                <span>Linked Resources</span>
                {resourcesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {resourcesOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
                  {resources.map((r, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1.5">
                        <input
                          className={inputClass}
                          value={r.label}
                          onChange={(e) => updateResource(idx, "label", e.target.value)}
                          placeholder="Label (e.g. Figma)"
                        />
                        <input
                          className={inputClass}
                          value={r.url}
                          onChange={(e) => updateResource(idx, "url", e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResource(idx)}
                        className="mt-2 p-1.5 text-slate-400 hover:text-red-500 transition hover:cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {resourceError && (
                    <p className="text-xs text-red-500">{resourceError}</p>
                  )}
                  <button
                    type="button"
                    onClick={addResource}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer"
                  >
                    <Plus size={12} />
                    Add Resource
                  </button>
                </div>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className={labelClass}>Cover Image <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
              <div
                className="relative h-24 w-full rounded-xl overflow-hidden mb-2 group"
                style={{
                  backgroundImage: `url(${coverSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-slate-700 text-xs font-medium hover:bg-white hover:cursor-pointer"
                  >
                    <ImagePlus size={14} />
                    {imagePreview ? "Change" : "Upload"}
                  </button>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition hover:cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer"
              >
                <ImagePlus size={13} />
                {imagePreview ? "Change cover image" : "Upload cover image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-2">
            {error && <p className="text-xs text-red-500 text-right">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-[var(--primary-text-color)] hover:bg-slate-50 dark:hover:bg-slate-700 transition hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-[var(--primary-button-background-color)] text-white hover:opacity-90 transition hover:cursor-pointer disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create Board"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
