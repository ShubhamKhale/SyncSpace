"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, X } from "lucide-react";
import { LinkedResource } from "@/app/store/useLinkedResourcesStore";
import { PLATFORM_ICONS, platformByIcon } from "@/app/lib/platformIcons";
import AddLinkedItemModal from "./AddLinkedItemModal";
import SelectPopover from "./SelectPopover";

interface Props {
  initialDocs: LinkedResource[];
  initialLinks: LinkedResource[];
  onSave: (docs: LinkedResource[], links: LinkedResource[]) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}


export default function EditLinkedResourcesModal({
  initialDocs,
  initialLinks,
  onSave,
  onClose,
  isSaving = false,
}: Props) {
  const [docs,      setDocs]      = useState<LinkedResource[]>(initialDocs.map((d) => ({ ...d })));
  const [links,     setLinks]     = useState<LinkedResource[]>(initialLinks.map((l) => ({ ...l })));
  const [activeTab, setActiveTab] = useState<"docs" | "resources">("docs");

  // Which nested add modal is open
  const [addModal, setAddModal] = useState<"doc" | "resource" | null>(null);

  // ── Doc helpers ──────────────────────────────────────────────────────────────
  const updateDoc = (idx: number, fields: Partial<LinkedResource>) =>
    setDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, ...fields } : d)));
  const removeDoc = (idx: number) =>
    setDocs((prev) => prev.filter((_, i) => i !== idx));

  // ── Link helpers ─────────────────────────────────────────────────────────────
  const updateLink = (idx: number, fields: Partial<LinkedResource>) =>
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, ...fields } : l)));
  const removeLink = (idx: number) =>
    setLinks((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validDocs  = docs.filter((d) => d.title.trim() && d.url.trim());
    const validLinks = links.filter((l) => l.title.trim() && l.url.trim());
    await onSave(validDocs, validLinks);
  };

  const inputCls =
    "w-full text-sm border border-slate-300 dark:border-slate-500 rounded-md px-2.5 py-1.5 bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:placeholder:text-slate-400";

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-[560px] max-h-[88vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Edit Linked Resources</h2>
            <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:cursor-pointer transition">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0 px-6">
            {(["docs", "resources"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 text-sm font-medium px-1 py-3 border-b-2 mr-6 hover:cursor-pointer transition ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab === "docs" && <FileText size={14} />}
                {tab === "docs" ? "Documentation" : "Resources"}
                <span className="ml-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                  {tab === "docs" ? docs.length : links.length}
                </span>
              </button>
            ))}
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

              {/* ── Documentation tab ─────────────────────────────────────── */}
              {activeTab === "docs" && (
                <>
                  {/* Add button — top */}
                  <button
                    type="button"
                    onClick={() => setAddModal("doc")}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 rounded-lg py-2.5 hover:cursor-pointer transition"
                  >
                    <Plus size={14} />
                    Add documentation link
                  </button>

                  {docs.map((doc, idx) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 space-y-2 bg-slate-50 dark:bg-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Doc {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDoc(idx)}
                          className="text-slate-400 hover:text-red-500 hover:cursor-pointer transition"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => updateDoc(idx, { title: e.target.value })}
                        placeholder="Title"
                        className={inputCls}
                      />
                      <input
                        type="url"
                        value={doc.url}
                        onChange={(e) => updateDoc(idx, { url: e.target.value })}
                        placeholder="https://..."
                        className={inputCls}
                      />
                      <textarea
                        value={doc.description || ""}
                        onChange={(e) => updateDoc(idx, { description: e.target.value })}
                        placeholder="Description (optional)"
                        rows={2}
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  ))}
                </>
              )}

              {/* ── Resources tab ─────────────────────────────────────────── */}
              {activeTab === "resources" && (
                <>
                  {/* Add button — top */}
                  <button
                    type="button"
                    onClick={() => setAddModal("resource")}
                    className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 rounded-lg py-2.5 hover:cursor-pointer transition"
                  >
                    <Plus size={14} />
                    Add resource link
                  </button>

                  {links.map((link, idx) => {
                    const activePlatform = platformByIcon(link.icon ?? "");
                    return (
                      <div key={idx} className="border border-slate-200 rounded-lg p-3 space-y-2.5 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${link.color || "bg-slate-600"}`}>
                              {(link.icon || "?").toString().slice(0, 2)}
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              Resource {idx + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLink(idx)}
                            className="text-slate-400 hover:text-red-500 hover:cursor-pointer transition"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(idx, { title: e.target.value })}
                          placeholder="Resource title"
                          className={inputCls}
                        />

                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(idx, { url: e.target.value })}
                          placeholder="https://..."
                          className={inputCls}
                        />

                        <div>
                          <label className="block text-xs text-slate-500 mb-1">
                            Platform icon
                            <span className="ml-1 text-slate-400 font-normal">(auto-set from URL, or choose manually)</span>
                          </label>
                          <SelectPopover
                            value={activePlatform.value}
                            onChange={(val) => {
                              const p = PLATFORM_ICONS.find((p) => p.value === val) ?? PLATFORM_ICONS[0];
                              updateLink(idx, { icon: p.icon, color: p.color });
                            }}
                            options={PLATFORM_ICONS.map((p) => ({ value: p.value, label: `${p.label}  [${p.icon}]` }))}
                            triggerClassName={inputCls}
                            dropdownClassName="min-w-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Nested add modal — renders on top (z-60) */}
      {addModal && (
        <AddLinkedItemModal
          type={addModal}
          onAdd={(item) => {
            if (addModal === "doc") {
              setDocs((prev) => [...prev, item]);
              setActiveTab("docs");
            } else {
              setLinks((prev) => [...prev, item]);
              setActiveTab("resources");
            }
            setAddModal(null);
          }}
          onClose={() => setAddModal(null)}
        />
      )}
    </>
  );
}
