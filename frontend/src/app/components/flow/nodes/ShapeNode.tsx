import { Handle, Position } from "reactflow";
import { ShapeComponents, ShapeType } from "@/app/components/shape/types";

export default function ShapeNode({ data }: any) {
  const { type, width, height, fill } = data;
  const Shape = ShapeComponents[type as ShapeType];

  return (
    <div style={{ width, height }}>
      <svg width={width} height={height}>
        <Shape width={width} height={height} fill={fill || "#4e9cff"} />
      </svg>

      {/* Handles for edges */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
