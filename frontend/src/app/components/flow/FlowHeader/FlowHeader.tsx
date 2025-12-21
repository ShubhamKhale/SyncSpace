"use client";

import { useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Share2,
  Lock,
  Link2,
  Copy,
} from "react-feather";

interface HeaderProps {
  diagram: any;
}

export const FlowHeader = ({ diagram }: HeaderProps) => {
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

  return (
    <div className="w-full border-b bg-white dark:bg-black px-3 py-2 flex items-center gap-3 text-sm">
      <div className="flex gap-2 bg-white dark:bg-black p-2 rounded-lg shadow-md">
        {/* Font Size */}
        <select
          onChange={(e) =>
            diagram.updateSelectedNodesFontSize(Number(e.target.value))
          }
          className="border rounded px-2 py-1"
        >
          {[12, 14, 16, 18, 20, 24, 32, 36, 40, 44, 48, 52].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        {/* Font Family */}
        <select
          onChange={(e) =>
            diagram.updateSelectedNodesFontFamily(e.target.value)
          }
          className="border rounded px-2 py-1"
        >
          <option value="Inter, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Courier New, monospace">Monospace</option>
        </select>
      </div>

      {/* TEXT STYLES */}
      <button
        onClick={() => diagram.toggleNodeStyle("fontWeight", "bold", "normal")}
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => diagram.toggleNodeStyle("fontStyle", "italic", "normal")}
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() =>
          diagram.toggleNodeStyle("textDecoration", "underline", "none")
        }
      >
        <Underline size={16} />
      </button>

      {/* TEXT COLOR */}
      <input
        type="color"
        className="w-6 h-6 rounded border"
        onChange={(e) => applyNodeStyle({ color: e.target.value })}
      />

      {/* FILL COLOR */}
      <input
        type="color"
        className="w-6 h-6 rounded border ml-2"
        onChange={(e) => applyNodeStyle({ backgroundColor: e.target.value })}
      />

      {/* STROKE WIDTH */}
      <select
        className="border rounded px-2 py-1"
        onChange={(e) =>
          applyEdgeStyle({ strokeWidth: Number(e.target.value) })
        }
      >
        <option value="1">1 px</option>
        <option value="2">2 px</option>
        <option value="3">3 px</option>
      </select>

      {/* ARROW TYPE */}
      {/* EDGE TYPE */}
      <select
        className="border rounded px-2 py-1"
        onChange={(e) =>
          diagram.updateSelectedEdgesType(
            e.target.value as
              | "straight"
              | "step"
              | "smoothstep"
              | "bezier"
              | "arrow"
          )
        }
        defaultValue="smoothstep"
      >
        <option value="straight">Straight</option>
        <option value="step">Step</option>
        <option value="smoothstep">Smooth</option>
        <option value="bezier">Bezier</option>
        <option value="arrow">Arrow</option>
      </select>

      <div className="flex-grow"></div>

      {/* ACTION ICONS */}
      <button>
        <Link2 size={18} />
      </button>
      <button>
        <Copy size={18} />
      </button>
      <button>
        <Lock size={18} />
      </button>

      {/* SHARE BUTTON */}
      <button className="ml-3 bg-blue-600 text-white px-4 py-1 rounded flex items-center gap-1">
        <Share2 size={16} /> Share
      </button>
    </div>
  );
};
