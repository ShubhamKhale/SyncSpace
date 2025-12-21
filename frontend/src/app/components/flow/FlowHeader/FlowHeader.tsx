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
      {/* FONT FAMILY */}
      <select className="border rounded px-2 py-1">
        <option>Inter</option>
        <option>Roboto</option>
        <option>Poppins</option>
      </select>

      {/* FONT SIZE */}
      <select className="border rounded px-2 py-1">
        <option>10 pt</option>
        <option>12 pt</option>
        <option>14 pt</option>
        <option>16 pt</option>
      </select>

      {/* TEXT STYLES */}
      <button onClick={() => applyNodeStyle({ fontWeight: "bold" })}>
        <Bold size={16} />
      </button>
      <button onClick={() => applyNodeStyle({ fontStyle: "italic" })}>
        <Italic size={16} />
      </button>
      <button onClick={() => applyNodeStyle({ textDecoration: "underline" })}>
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
            e.target.value as "straight" | "step" | "smoothstep" | "bezier"  | "arrow"
          )
        }
        defaultValue="arrow"
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
