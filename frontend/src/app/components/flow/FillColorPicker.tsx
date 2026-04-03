"use client";

import { useRef, useState, useEffect } from "react";
import { Plus } from "react-feather";
import ShapeFillIcon from "@/app/icons/ShapeFill";

interface FillColorPickerProps {
  onColorSelect: (color: string) => void;
  defaultColor?: string;
}

const PRESET_FILL_COLORS = [
  // White to Black grayscale
  "#ffffff",
  "#f3f3f3",
  "#d9d9d9",
  "#bfbfbf",
  "#a6a6a6",
  "#808080",
  "#595959",
  "#404040",
  "#000000",

  // Light pastels
  "#f0f0ff",
  "#ffe0f0",
  "#ffe0e0",
  "#ffe8d9",
  "#fff8d9",
  "#f0ffd9",
  "#e0f0d9", 
  "#e0f0ff",
  "#e0ffff",
  "#f0e0ff", 

  // Medium colors
  "#d9d9ff",
  "#ffd9e8",
  "#ffd9d9",
  "#ffd9bf",
  "#fff0d9",
  "#e8ffd9",
  "#d9f0e0",
  "#d9f0ff",

  // Bold colors
  "#8080ff",
  "#ff80d9",
  "#ff8080",
  "#ff9966",
  "#ffcc00",
  "#ccff00",
  "#80ff80",
  "#00ff80",
  "#0080ff",

  // Deep colors
  "#3333ff",
  "#ff33cc",
  "#ff3333",
  "#ff6633",
  "#ffff00",
  "#33ff00",
  "#00cc00",
  "#008080",
  "#0033ff",
];

export const FillColorPicker = ({ onColorSelect, defaultColor = "#FFFFFF" }: FillColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
    setIsOpen(false);
  };

  const handleCustomColor = () => {
    colorInputRef.current?.click();
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    if (!customColors.includes(color)) {
      setCustomColors([color, ...customColors]);
    }
    handleColorClick(color);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 8, left: rect.left });
          }
          setIsOpen(!isOpen);
        }}
        className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-300 hover:cursor-pointer flex items-center"
        title="Fill Color"
      >
        <div className="flex items-center gap-1">
          <ShapeFillIcon width={16} height={16} fill={selectedColor} />
          {/* <div
            className="w-3 h-3 rounded-full border border-gray-600"
            style={{ backgroundColor: selectedColor }}
          /> */}
        </div>
      </button>

      {isOpen && (
        <div
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
          className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-80"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Select a fill color
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preset Colors Grid */}
          <div className="grid grid-cols-9 gap-2 mb-4">
            {PRESET_FILL_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? "border-blue-500 scale-110"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom Colors Section */}
          {customColors.length > 0 && (
            <div className="mb-4 pb-4 border-t border-gray-300 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-3">Custom colors</p>
              <div className="flex flex-wrap gap-2">
                {customColors.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className={`w-7 h-7 rounded border-2 transition-all hover:scale-110 ${
                      selectedColor === color
                        ? "border-blue-500 scale-110"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Color Button */}
          <button
            onClick={handleCustomColor}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Plus size={16} />
            <span>Add custom color</span>
          </button>

          {/* Hidden Color Input */}
          <input
            ref={colorInputRef}
            type="color"
            style={{ display: "none" }}
            onChange={handleCustomColorChange}
          />
        </div>
      )}
    </div>
  );
};
