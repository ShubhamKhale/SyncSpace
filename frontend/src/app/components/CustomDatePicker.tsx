"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function parseDate(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmt(val: string): string {
  const d = parseDate(val);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minDate?: string;
}

export default function CustomDatePicker({ value, onChange, placeholder = "Pick date", minDate }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selected = parseDate(value);
  const minD = parseDate(minDate ?? "");

  const [view, setView] = useState<Date>(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setView(new Date(year, month - 1, 1));
  const nextMonth = () => setView(new Date(year, month + 1, 1));

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    onChange(toIso(d));
    setOpen(false);
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    return selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
  };

  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const isDisabled = (day: number) => {
    if (!minD) return false;
    const d = new Date(year, month, day);
    return d < minD;
  };

  return (
    <div ref={ref} className="relative min-w-0">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] ${
          open
            ? "border-[#6366F1] bg-white dark:bg-slate-700"
            : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500"
        }`}
      >
        <CalendarDays size={13} className={value ? "text-[#6366F1]" : "text-slate-400"} />
        <span className={`flex-1 text-left truncate ${value ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
          {value ? fmt(value) : placeholder}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-50 mt-1.5 left-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 select-none">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              const dis = isDisabled(day);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={dis}
                  onClick={() => selectDay(day)}
                  className={`h-8 w-full flex items-center justify-center rounded-lg text-sm font-medium transition
                    ${dis ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "cursor-pointer"}
                    ${sel
                      ? "bg-[#6366F1] text-white shadow-sm"
                      : tod
                        ? "bg-[#EEF2FF] text-[#6366F1] dark:bg-[#6366F1]/20"
                        : !dis
                          ? "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          : ""
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center px-1">
            <button
              type="button"
              onClick={() => { onChange(toIso(today)); setOpen(false); }}
              className="text-xs font-semibold text-[#6366F1] hover:underline"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs text-slate-400 hover:text-red-500 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
