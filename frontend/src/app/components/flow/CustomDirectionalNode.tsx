import { Handle, Position } from "@xyflow/react";

export type DirectionalNodeData = {
  label: string;
};


export default function FourWayNode({ data }: { data: DirectionalNodeData }) {
  return (
    <div className="custom-node border p-2 rounded">
      <div>{data.label}</div>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Right} id="r" />
      <Handle type="target" position={Position.Bottom} id="b" />
      <Handle type="target" position={Position.Left} id="l" />
      <Handle type="source" position={Position.Top} id="s-t" />
      <Handle type="source" position={Position.Right} id="s-r" />
      <Handle type="source" position={Position.Bottom} id="s-b" />
      <Handle type="source" position={Position.Left} id="s-l" />
    </div>
  );
}
