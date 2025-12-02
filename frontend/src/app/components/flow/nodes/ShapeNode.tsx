// import { Handle, Position } from '@xyflow/react';
// import { ShapeComponents, ShapeType } from "@/app/components/shape/types";

// export default function ShapeNode({ data }: any) {
//   const { type, width, height, fill } = data;
//   const Shape = ShapeComponents[type as ShapeType];

//   return (
//     <div style={{ width, height }}>
//       <svg width={width} height={height}>
//         <Shape width={width} height={height} fill={fill || "#4e9cff"} />
//       </svg>

//       {/* Handles for edges */}
//       <Handle type="source" position={Position.Right} />
//       <Handle type="target" position={Position.Left} />
//     </div>
//   );
// }
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { ShapeComponents, ShapeType } from "@/app/components/shape/types";

export default function ShapeNode({ data }: any) {
  const { type, width, height, fill } = data;
  const Shape = ShapeComponents[type as ShapeType];

  const nodeWidth = width || 80;
  const nodeHeight = height || 80;

  return (
    <div
      style={{
        width: nodeWidth,
        height: nodeHeight,
        position: "relative",
      }}
      className="flex items-center justify-center overflow-visible"
    >
      {/* 🔵 Resizer */}
      <NodeResizer
        minWidth={40}
        minHeight={40}
        lineStyle={{ stroke: "#4e9cff", strokeWidth: 1 }}
        handleStyle={{ width: 10, height: 10, borderRadius: "4px" }}
      />

      {/* Shape */}
      <svg width={nodeWidth} height={nodeHeight}>
        <Shape width={nodeWidth} height={nodeHeight} fill={fill || "#4e9cff"} />
      </svg>

      {/* RIGHT */}
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          right: -5,
          top: nodeHeight / 2 - 5,
          background: "#fff",
        }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          right: -5,
          top: nodeHeight / 2 - 5,
          background: "#fff",
        }}
      />

      {/* LEFT */}
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          left: -5,
          top: nodeHeight / 2 - 5,
          background: "#fff",
        }}
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          left: -5,
          top: nodeHeight / 2 - 5,
          background: "#fff",
        }}
      />

      {/* TOP */}
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          top: -5,
          left: nodeWidth / 2,
          background: "#fff",
        }}
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          top: -5,
          left: nodeWidth / 2,
          background: "#fff",
        }}
      />

      {/* BOTTOM */}
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          bottom: -5,
          left: nodeWidth / 2,
          background: "#fff",
        }}
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          bottom: -5,
          left: nodeWidth / 2,
          background: "#fff",
        }}
      />
    </div>
  );
}
