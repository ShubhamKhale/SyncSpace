// "use client";

// import { useRef } from "react";

// interface ColorPaletteProps {
//   onSelect: (color: string | null) => void;
//   showTransparent?: boolean;
// }

// const COLORS = [
//   "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#E0E0E0", "#F5F5F5", "#FFFFFF",
//   "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF",
//   "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#D9D2E9",
// ];

// export const ColorPalette = ({
//   onSelect,
//   showTransparent = false,
// }: ColorPaletteProps) => {
//   const colorInputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className="w-64 p-3 bg-[#18181B] rounded-xl shadow-xl border border-white/5">
//       {/* Color grid */}
//       <div className="grid grid-cols-8 gap-3">
//         {showTransparent && (
//           <button
//             title="No fill"
//             onClick={() => onSelect(null)}
//             className="w-7 h-7 rounded-full border border-dashed border-gray-500 hover:border-white transition"
//           />
//         )}

//         {COLORS.map((color) => (
//           <button
//             key={color}
//             title={color}
//             onClick={() => onSelect(color)}
//             className="w-7 h-7 rounded-full border border-black/20 hover:scale-110 hover:ring-2 hover:ring-white/40 transition"
//             style={{ backgroundColor: color }}
//           />
//         ))}
//       </div>

//       {/* Divider */}
//       <div className="my-3 h-px bg-white/10" />

//       {/* Custom color */}
//       <div className="flex items-center gap-2">
//         <div className="relative w-7 h-7">
//           {/* Native color picker (invisible but positioned correctly) */}
//           <input
//             ref={colorInputRef}
//             type="color"
//             title="Custom color"
//             onChange={(e) => onSelect(e.target.value)}
//             className="absolute inset-0 opacity-0 cursor-pointer"
//           />

//           {/* Visible + button */}
//           <div className="w-7 h-7 rounded-full bg-[#27272A] flex items-center justify-center text-sm hover:bg-[#323238] transition pointer-events-none">
//             +
//           </div>
//         </div>

//         <span className="text-xs text-gray-400">
//           Custom color
//         </span>
//       </div>
//     </div>
//   );
// };

"use client";

import { useRef } from "react";

interface ColorPaletteProps {
  onSelect: (color: string | null) => void;
  showTransparent?: boolean;
}

// const COLORS = [
//   "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#E0E0E0", "#F5F5F5", "#FFFFFF",
//   "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF",
//   "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#D9D2E9",
// ];

const COLORS = [
  // Neutrals
  { name: "Black", value: "#000000" },
  { name: "Charcoal", value: "#434343" },
  { name: "Slate", value: "#666666" },
  { name: "Stone", value: "#999999" },
  { name: "Ash", value: "#B7B7B7" },
  { name: "Mist", value: "#E0E0E0" },
  { name: "Fog", value: "#F5F5F5" },
  { name: "White", value: "#FFFFFF" },

  // Primary
  { name: "Red", value: "#FF0000" },
  { name: "Orange", value: "#FF9900" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Green", value: "#00FF00" },
  { name: "Cyan", value: "#00FFFF" },
  { name: "Sky Blue", value: "#4A86E8" },
  { name: "Blue", value: "#0000FF" },
  { name: "Purple", value: "#9900FF" },

  // Pastels
  { name: "Blush", value: "#F4CCCC" },
  { name: "Peach", value: "#FCE5CD" },
  { name: "Butter", value: "#FFF2CC" },
  { name: "Mint", value: "#D9EAD3" },
  { name: "Ice", value: "#D0E0E3" },
  { name: "Sky", value: "#C9DAF8" },
  { name: "Lavender", value: "#D9D2E9" },
];

export const ColorPalette = ({
  onSelect,
  showTransparent = false,
}: ColorPaletteProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full flex items-center justify-between space-x-4 gap-4 p-3 bg-[#18181B] rounded-xl shadow-xl border border-white/5">
      {/*  Color grid */}
      <div className="grid grid-cols-8 gap-x-8 gap-y-4">
        {showTransparent && (
          <button
            title="No fill"
            onClick={() => onSelect(null)}
            className="w-7 h-7 rounded-full border border-dashed border-gray-500 hover:border-white transition"
          />
        )}

        {COLORS.map(({ name, value }) => (
          <button
            key={value}
            title={name}
            onClick={() => onSelect(value)}
            className="w-7 h-7 rounded-full border border-black/20 hover:scale-110 hover:ring-2 hover:ring-white/40 transition"
            style={{ backgroundColor: value }}
          />
        ))}
      </div>

      {/*  Custom color selector */}
      <div className="flex flex-col items-center justify-center gap-2 pl-3 border-l border-white/10">
        <div className="relative w-9 h-9">
          {/* Native color picker (position-safe) */}
          <input
            ref={colorInputRef}
            type="color"
            title="Custom color"
            onChange={(e) => onSelect(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />

          {/* Visible + button */}
          <div className="w-9 h-9 rounded-full bg-[#27272A] flex items-center justify-center text-lg hover:bg-[#323238] transition pointer-events-none">
            +
          </div>
        </div>

        <span className="text-[10px] text-gray-400 text-center">Custom</span>
      </div>
    </div>
  );
};
