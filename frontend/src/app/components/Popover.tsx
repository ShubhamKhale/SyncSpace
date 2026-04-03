"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

interface PopoverProps {
  button: ReactNode; // element that toggles popover
  children: ReactNode; // content shown when open
  open?: boolean; // controlled open state
  onOpenChange?: (open: boolean) => void;
  className?: string; // optional classes for content wrapper
}

export default function Popover({
  button,
  children,
  open: controlledOpen,
  onOpenChange,
  className = "",
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const ref = useRef<HTMLDivElement>(null);

  const toggle = (value?: boolean) => {
    const next = value !== undefined ? value : !open;
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        toggle(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <div className="" onClick={() => toggle()}>{button}</div>
      {open && (
        <div className={`absolute z-10 mt-1 ${className}`}>{children}</div>
      )}
    </div>
  );
}
