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

import { Handle, Position } from "@xyflow/react";
import { ShapeComponents, ShapeType } from "@/app/components/shape/types";

export default function ShapeNode({ data }: any) {
  const { type, width, height, fill } = data;
  const Shape = ShapeComponents[type as ShapeType];
  const nodeWidth = width || 50;
  const nodeHeight = height || 50;

  console.log("data :- ", data);

  return (
    <div
      style={{
        width: nodeWidth,
        height: nodeHeight,
        position: "relative",
      }}
      className="flex items-center justify-center overflow-visible"
    >
      <svg width={nodeWidth} height={nodeHeight}>
        <Shape width={nodeWidth} height={nodeHeight} fill={fill || "#4e9cff"} />
      </svg>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 10,
          height: 10,
          right: -5,
          background: "#fff",
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 10,
          height: 10,
          left: -5,
          background: "#fff",
        }}
      />
    </div>
  );
}
