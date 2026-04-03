"use client";

import { useState } from "react";
import Popover from "../../../components/Popover";
import { Role } from "../types";

interface Props {
  current: Role;
  onChange: (r: Role) => void;
}

// role selector built on generic Popover
export default function RoleDropdown({ current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const roles: Role[] = ["owner", "admin", "member", "viewer"];

  return (
    <Popover
      button={
        <button
          type="button"
          className="border border-gray-200 dark:border-slate-600 px-2.5 py-1 text-xs font-medium rounded-full text-left flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-slate-300 transition hover:cursor-pointer"
        >
          <span className="capitalize">{current}</span>
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      }
      open={open}
      onOpenChange={setOpen}
      className="w-full"
    >
      <div className="w-full bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded shadow-lg">
        {roles.map((r) => (
          <div
            key={r}
            className={`px-3 py-2 text-sm cursor-pointer capitalize hover:bg-gray-100 dark:hover:bg-slate-600 dark:text-slate-200 ${
              r === current ? "font-semibold" : ""
            }`}
            onClick={() => {
              onChange(r);
              setOpen(false);
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </Popover>
  );
}
