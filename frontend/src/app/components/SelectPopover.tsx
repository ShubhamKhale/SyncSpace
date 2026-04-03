"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Popover from "./Popover";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectPopoverProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  triggerClassName?: string;
  dropdownClassName?: string;
}

export default function SelectPopover({
  value,
  onChange,
  options,
  triggerClassName = "",
  dropdownClassName = "",
}: SelectPopoverProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      button={
        <button
          type="button"
          className={`flex items-center justify-between gap-2 text-left hover:cursor-pointer ${triggerClassName}`}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown
            size={13}
            className={`flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      }
      className={`bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-md overflow-hidden z-50 ${dropdownClassName}`}
    >
      <ul className="py-1 max-h-52 overflow-y-auto">
        {options.map((opt) => (
          <li
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-600 ${
              opt.value === value
                ? "text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/30"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>{opt.label}</span>
            {opt.value === value && (
              <Check size={13} className="text-blue-600 flex-shrink-0 ml-3" />
            )}
          </li>
        ))}
      </ul>
    </Popover>
  );
}
