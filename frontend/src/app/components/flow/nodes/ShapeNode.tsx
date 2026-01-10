import {
  Handle,
  Position,
  NodeResizer,
  useNodeId,
  useReactFlow,
} from "@xyflow/react";
import { ShapeComponents, ShapeType } from "@/app/components/shape/types";
import { useEffect, useState } from "react";

export default function ShapeNode({ data }: any) {
  // const {
  //   type,
  //   width,
  //   height,
  //   fill,
  //   text,
  //   fontSize = 14,
  //   fontFamily = "Inter, sans-serif",
  //   fontWeight = "normal",
  //   fontStyle = "normal",
  //   textDecoration = "none",
  //   color = "#000",
  // } = data;
  const {
  type,
  width,
  height,
  text,
  fontSize = 14,
  fontFamily = "Inter, sans-serif",
  fontWeight = "normal",
  fontStyle = "normal",
  textDecoration = "none",

  // NEW
  textColor = "#000000",
  fillColor = "#ffffff",
} = data;

  const Shape = ShapeComponents[type as ShapeType];

  const nodeWidth = width || 80;
  const nodeHeight = height || 80;

  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();

  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;

  // Editable text state
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text || "");
  const isPlaceholder = !localText.trim();

  // Save actual text, empty allowed
  const saveText = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, text: localText.trim() } }
          : node
      )
    );
    setIsEditing(false);
  };

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
  };

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (!isSelected) return;

      if (e.key === "Delete") {
        setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
      }
    };

    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, [isSelected, nodeId, setNodes]);

  return (
    <div
      style={{
        width: nodeWidth,
        height: nodeHeight,
        position: "relative",
      }}
      className="flex items-center justify-center overflow-visible"
    >
      {isSelected && (
        <button
          onClick={deleteNode}
          style={{
            position: "absolute",
            top: -15,
            right: -18,
            background: "#ff4d4d",
            color: "white",
            borderRadius: "50%",
            width: 15,
            height: 15,
            border: "none",
            cursor: "pointer",
          }}
        ></button>
      )}

      {isSelected && (
        <NodeResizer
          minWidth={40}
          minHeight={40}
          lineStyle={{ stroke: "#4e9cff", strokeWidth: 1 }}
          handleStyle={{ width: 10, height: 10, borderRadius: "4px" }}
        />
      )}

      {/* Shape */}
      <svg width={nodeWidth} height={nodeHeight}>
        <Shape
  width={nodeWidth}
  height={nodeHeight}
  fill={fillColor ?? "transparent"}
  stroke="black"
  strokeWidth={2}
/>

      </svg>

      {/* Editable Text */}
      {isEditing ? (
        <textarea
        autoFocus
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={saveText}
        style={{
          position: "absolute",
          width: nodeWidth - 10,
          height: nodeHeight - 10,
          resize: "none",
          outline: "none",
          border: "1px solid #ccc",
          background: "white",
          padding: "4px",
          textAlign: "center",
          fontSize,
          fontFamily,
          fontWeight,
          fontStyle,
          textDecoration,
          color: textColor,
        }}
      />
      
      ) : (
        <span
  onDoubleClick={() => setIsEditing(true)}
  style={{
    position: "absolute",
    width: nodeWidth,
    padding: "5px",
    textAlign: "center",
    pointerEvents: "auto",
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    color: textColor,
    whiteSpace: "pre-wrap",
    lineHeight: "1.2",
    opacity: isPlaceholder ? 0.6 : 1,
    userSelect: "none",
  }}
>
  {isPlaceholder ? "Double-click to edit" : localText}
</span>
      )}

      {/* Handles */}
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
