"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { X, Search } from "lucide-react";
import { useTemplateStore } from "@/app/store/useTemplateStore";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  RECOMMENDED_IDS,
  POPULAR_IDS,
  type Template,
} from "./templateData";
import { TemplateCard } from "./TemplateCard";

const SAVE_KEY = "syncspace-diagram";

interface TemplateModalProps {
  diagram: any; // useDiagram return object
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({
  title,
  templates,
  onSelect,
}: {
  title: string;
  templates: Template[];
  onSelect: (t: Template) => void;
}) {
  if (templates.length === 0) return null;
  return (
    <div className="mb-8">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-500 uppercase mb-3">
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function TemplateModal({ diagram }: TemplateModalProps) {
  const store = useTemplateStore();
  const backdropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") store.closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [store]);

  // ── Apply template ──────────────────────────────────────────────────────
  const handleApply = useCallback(
    (template: Template) => {
      diagram.takeSnapshot(); // undo point before replacing canvas
      diagram.uploadJson(JSON.stringify(template.data), { fitView: true }); // setNodes + setEdges
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(template.data));
      } catch {}
      store.addRecent(template.id);
      store.closeModal();
    },
    [diagram, store]
  );

  // ── Filtered templates ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = store.searchQuery.trim().toLowerCase();
    const cat = store.selectedCategory;
    return TEMPLATES.filter((t) => {
      const matchesCat = cat === "All" || t.category === cat;
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [store.searchQuery, store.selectedCategory]);

  const isSearching = store.searchQuery.trim().length > 0;

  // ── Section sets (only when not searching) ──────────────────────────────
  const recommended = useMemo(
    () => TEMPLATES.filter((t) => RECOMMENDED_IDS.includes(t.id)),
    []
  );
  const recent = useMemo(
    () =>
      store.recentIds
        .map((id) => TEMPLATES.find((t) => t.id === id))
        .filter(Boolean) as Template[],
    [store.recentIds]
  );
  const popular = useMemo(
    () => TEMPLATES.filter((t) => POPULAR_IDS.includes(t.id)),
    []
  );

  const displayedAll = useMemo(() => {
    if (store.selectedCategory === "All") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === store.selectedCategory);
  }, [store.selectedCategory]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) store.closeModal();
      }}
    >
      {/* Panel */}
      <div
        className="relative flex flex-col bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl
                   w-[92vw] max-w-5xl max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-100 flex-shrink-0">
            Templates
          </h2>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-gray-800/70 border border-gray-700/50 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search templates…"
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none"
            />
            {store.searchQuery && (
              <button
                onClick={() => store.setSearchQuery("")}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Close */}
          <button
            onClick={store.closeModal}
            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-gray-200 hover:bg-gray-700/60
                       rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Categories */}
          <div className="w-44 flex-shrink-0 border-r border-gray-800 py-4 px-2 overflow-y-auto scrollbar-hide">
            <p className="text-[9px] font-semibold tracking-[0.14em] text-gray-600 uppercase px-2 mb-2">
              Categories
            </p>
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = store.selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    store.setCategory(cat);
                    store.setSearchQuery("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-100 ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right: Template grid */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5">
            {/* Search results: flat filtered list */}
            {isSearching ? (
              filtered.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-500 uppercase mb-3">
                    Results ({filtered.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filtered.map((t) => (
                      <TemplateCard key={t.id} template={t} onClick={handleApply} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <span className="text-3xl mb-3">🔍</span>
                  <p className="text-sm">No templates match &ldquo;{store.searchQuery}&rdquo;</p>
                  <button
                    onClick={() => store.setSearchQuery("")}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )
            ) : store.selectedCategory === "All" ? (
              // Sectioned view for "All"
              <>
                <Section title="Recommended" templates={recommended} onSelect={handleApply} />
                {recent.length > 0 && (
                  <Section title="Recently Used" templates={recent} onSelect={handleApply} />
                )}
                <Section title="Popular" templates={popular} onSelect={handleApply} />
                <Section title="All Templates" templates={displayedAll} onSelect={handleApply} />
              </>
            ) : (
              // Flat view for a specific category
              <>
                {filtered.length > 0 ? (
                  <Section
                    title={store.selectedCategory}
                    templates={filtered}
                    onSelect={handleApply}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <span className="text-3xl mb-3">📭</span>
                    <p className="text-sm">No templates in this category yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
