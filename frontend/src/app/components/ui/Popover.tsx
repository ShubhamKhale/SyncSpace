// "use client";

// import { useEffect, useRef, useState } from "react";

// interface PopoverProps {
//   trigger: React.ReactNode;
//   children: React.ReactNode;
//   width?: string;
// }

// export const Popover = ({ trigger, children, width = "w-40" }: PopoverProps) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={ref}>
//       <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

//       {open && (
//         <div
//           className={`absolute z-50 mt-2 ${width} bg-[#1F1F23] border border-[#2F2F35] rounded-md shadow-lg`}
//         >
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import { useEffect, useRef, useState } from "react";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export const Popover = ({ trigger, children, width = "w-40" }: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Outside click — capture phase (same as SharedUsers)
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {trigger}
      </div>

      {/* Popover content */}
      {open && (
        <div
          className={`
            absolute z-50 mt-2
            ${width}
            bg-[#1F1F23]
            border border-[#2F2F35]
            rounded-md shadow-lg
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
};
