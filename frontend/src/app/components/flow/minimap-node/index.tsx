import { type MiniMapNodeProps, useStore } from "@xyflow/react";
import { ShapeComponents, ShapeType } from "../../shape/types";

// Renders each node in the minimap with its actual shape and color.
// ShapeNode stores color as data.fill; StickyNoteNode/GroupNode store it as data.color.
function MiniMapNode({ id, width, height, x, y, selected }: MiniMapNodeProps) {
  const { fill, color, type } = useStore(
    (state) => state.nodeLookup.get(id)?.data || {}
  );

  const nodeColor = (fill || color) as string | undefined;
  const ShapeComponent = type ? ShapeComponents[type as ShapeType] : undefined;

  return (
    <g transform={`translate(${x}, ${y})`}>
      {ShapeComponent ? (
        <ShapeComponent
          width={width}
          height={height}
          fill={nodeColor || "#94a3b8"}
          strokeWidth={selected ? 6 : 0}
          className={
            selected
              ? "react-flow__minimap-node selected"
              : "react-flow__minimap-node"
          }
        />
      ) : (
        <rect
          width={width}
          height={height}
          rx={4}
          fill={nodeColor || "#94a3b8"}
          strokeWidth={selected ? 4 : 0}
          stroke={selected ? "#3b82f6" : "none"}
          className={
            selected
              ? "react-flow__minimap-node selected"
              : "react-flow__minimap-node"
          }
        />
      )}
    </g>
  );
}

export default MiniMapNode;
