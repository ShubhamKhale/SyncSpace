"use client";
import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterMenuProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  /** Single-choice menus replace the selection instead of toggling. */
  single?: boolean;
}

/** Compact multi-select filter button with a checkbox dropdown. */
export default function FilterMenu({ label, options, selected, onChange, single = false }: FilterMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const toggle = (value: string) => {
    if (single) {
      onChange(selected[0] === value ? [] : [value]);
      setOpen(false);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const active = selected.length > 0;
  const summary =
    selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? label
      : selected.length > 1
        ? `${label} · ${selected.length}`
        : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${
          active
            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
        }`}
      >
        <span className="max-w-[140px] truncate">{summary}</span>
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-multiselectable={!single}
          className="absolute z-30 mt-1 min-w-[180px] max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1"
        >
          {options.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No options</li>}
          {options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={on}
                onClick={() => toggle(o.value)}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <span
                  className={`w-4 h-4 flex items-center justify-center rounded border ${
                    on ? "bg-indigo-500 border-indigo-500" : "border-slate-300 dark:border-slate-500"
                  }`}
                >
                  {on && <Check size={11} className="text-white dark:text-slate-900" />}
                </span>
                <span className="truncate">{o.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
