"use client";

import MenuIcon from "@/app/icons/MenuIcon";
import { useCallback } from "react";
import { Bold, Italic, Underline, Lock, Copy } from "react-feather";
import { Popover } from "../../ui/Popover";
import ShareIcon from "@/app/icons/ShareIcon";
import { SharedUsers } from "../../ui/SharedUsers";
import { ColorPalette } from "../../ui/ColorPalette";
import { PaintBucket, Type } from "lucide-react";
import { Menu } from "../Menu";

interface HeaderProps {
  diagram: any;
  themeHook: any;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  toggleLeftSidebar: () => void;
}

export const FlowHeader = ({
  diagram,
  themeHook,
  isRightSidebarOpen,
  toggleRightSidebar,
  toggleLeftSidebar,
}: HeaderProps) => {
  const applyNodeStyle = useCallback(
    (style: any) => {
      if (!diagram.selectedNodes?.length) return;
      diagram.updateNodesStyle(style);
    },
    [diagram]
  );

  const applyEdgeStyle = useCallback(
    (style: any) => {
      if (!diagram.selectedEdges?.length) return;
      diagram.updateEdgesStyle(style);
    },
    [diagram]
  );

  const sharedUsersFromBackend = [
    {
      id: "u_101",
      name: "John Doe",
    },
    {
      id: "u_102",
      name: "Amit Sharma",
    },
    {
      id: "u_103",
      name: "Riya Patel",
    },
    {
      id: "u_104",
      name: "Kunal Verma",
    },
  ];

  return (
    <div className="w-full border-b bg-[#27272A] text-white px-4 py-4 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center space-x-4">
        <MenuIcon />
        <p className="font-semibold text-[#E4E4E7] text-lg">Untitled Diagram</p>
      </div>

      <div className="flex gap-2 px-4 py-3 bg-[#18181B] space-x-6 rounded-md">
        {/* Font Family */}
        <Popover
          trigger={
            <button className="px-3 py-1 border rounded bg-[#18181B] hover:bg-[#222] hover:cursor-pointer">
              Inter
            </button>
          }
        >
          <div className="flex flex-col text-sm">
            {[
              "Inter, sans-serif",
              "Arial, sans-serif",
              "Roboto, sans-serif",
              "Georgia, serif",
              "Courier New, monospace",
            ].map((font) => (
              <button
                key={font}
                onClick={() => diagram.updateSelectedNodesFontFamily(font)}
                className="px-3 py-2 text-left hover:bg-[#2A2A30]"
                style={{ fontFamily: font }}
              >
                {font.split(",")[0]}
              </button>
            ))}
          </div>
        </Popover>

        {/* Font Size */}
        <Popover
          width="w-24"
          trigger={
            <button className="px-3 py-1 border rounded bg-[#18181B] hover:bg-[#222] hover:cursor-pointer">
              16px
            </button>
          }
        >
          <div className="flex flex-col text-sm max-h-48 overflow-y-auto">
            {[12, 14, 16, 18, 20, 24, 32, 36, 40, 44, 48, 52].map((size) => (
              <button
                key={size}
                onClick={() => diagram.updateSelectedNodesFontSize(size)}
                className="px-3 py-2 hover:bg-[#2A2A30]"
              >
                {size}px
              </button>
            ))}
          </div>
        </Popover>

        {/* TEXT STYLES */}
        <button
          className="hover:cursor-pointer"
          onClick={() =>
            diagram.toggleNodeStyle("fontWeight", "bold", "normal")
          }
        >
          <Bold size={16} />
        </button>

        <button
          className="hover:cursor-pointer"
          onClick={() =>
            diagram.toggleNodeStyle("fontStyle", "italic", "normal")
          }
        >
          <Italic size={16} />
        </button>

        <button
          className="hover:cursor-pointer"
          onClick={() =>
            diagram.toggleNodeStyle("textDecoration", "underline", "none")
          }
        >
          <Underline size={16} />
        </button>

        {/* TEXT COLOR */}
        <Popover
          width="w-[400px]"
          trigger={
            <button
              title="Text color"
              className="w-8 h-8 rounded border flex items-center justify-center bg-[#18181B] hover:bg-[#222] hover:cursor-pointer"
            >
              {/* <span className="font-bold text-sm">A</span> */}
              <Type size={14} />
            </button>
          }
        >
          <ColorPalette
            onSelect={(color) => {
              console.log("Text color:", color);
              diagram.updateSelectedNodesTextColor(color);
            }}
          />
        </Popover>

        {/* FILL COLOR */}
        <Popover
          width="w-[450px]"
          trigger={
            <button
              title="Fill color"
              className="w-8 h-8 rounded border flex items-center justify-center bg-[#18181B] hover:bg-[#222] hover:cursor-pointer"
            >
              {/* <div className="w-4 h-4 rounded bg-white" /> */}
              <PaintBucket size={16} />
            </button>
          }
        >
          <ColorPalette
            showTransparent
            onSelect={(color) => {
              console.log("Fill color:", color);
              diagram.updateSelectedNodesFillColor(color);
            }}
          />
        </Popover>

        {/* STROKE WIDTH */}
        <Popover
          width="w-20"
          trigger={
            <button className="px-3 py-1 border rounded bg-[#18181B] hover:bg-[#222] hover:cursor-pointer text-sm">
              Stroke
            </button>
          }
        >
          <div className="flex flex-col text-sm">
            {[1, 2, 3, 4, 6].map((width) => (
              <button
                key={width}
                onClick={() => diagram.updateSelectedEdgesStrokeWidth(width)}
                className="px-3 py-2 hover:bg-[#2A2A30] flex items-center gap-2"
              >
                {/* Preview line */}
                <span
                  className="flex-1 bg-white rounded"
                  style={{ height: `${width}px` }}
                />
                <span className="text-xs text-gray-400">{width}px</span>
              </button>
            ))}
          </div>
        </Popover>

        {/* EDGE TYPE */}
        <Popover
          trigger={
            <button className="px-3 py-1 border rounded bg-[#18181B] hover:bg-[#222] hover:cursor-pointer">
              Smooth
            </button>
          }
        >
          <div className="flex flex-col text-sm">
            {[
              ["straight", "Straight"],
              ["step", "Step"],
              ["smoothstep", "Smooth"],
              ["bezier", "Bezier"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => diagram.updateSelectedEdgesType(value as any)}
                className="px-3 py-2 hover:bg-[#2A2A30]"
              >
                {label}
              </button>
            ))}
          </div>
        </Popover>
      </div>

      <div className="flex items-center space-x-4 gap-2">
        {/* ACTION ICONS */}
        <button className="hover:cursor-pointer">
          <Copy size={18} />
        </button>
        <button className="hover:cursor-pointer">
          <Lock size={18} />
        </button>

        <Menu
          themeHook={themeHook}
          diagram={diagram}
          isRightSidebarOpen={isRightSidebarOpen}
          toggleRightSidebar={toggleRightSidebar}
          toggleLeftSidebar={toggleLeftSidebar}
        />

        <SharedUsers users={sharedUsersFromBackend} />

        {/* SHARE BUTTON */}
        <button className="ml-3 hover:cursor-pointer bg-[#3B82F6] text-white px-4 py-2 rounded-lg flex items-center gap-1">
          <ShareIcon />
          Share
        </button>
      </div>
    </div>
  );
};
