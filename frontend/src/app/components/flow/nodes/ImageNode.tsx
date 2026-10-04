import { isTypingTarget } from "./isTypingTarget";
import { caretToEnd } from "./caretToEnd";
import {
  Handle,
  Position,
  NodeResizer,
  useNodeId,
  useReactFlow,
  useConnection,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";

export default function ImageNode({ data }: any) {
  const { src, width, height, caption } = data;

  const nodeWidth = width || 200;
  const nodeHeight = height || 200;

  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();

  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;
  const isConnecting = useConnection((c) => c.inProgress);

  const locked = !!data.locked;

  // Caption editing state
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [localCaption, setLocalCaption] = useState(caption || "");

  // Sync caption on external changes (undo/redo)
  useEffect(() => {
    if (!isEditingCaption) setLocalCaption(caption || "");
  }, [caption, isEditingCaption]);

  // Exit caption editing if node gets locked
  useEffect(() => {
    if (locked && isEditingCaption) setIsEditingCaption(false);
  }, [locked]);

  const saveCaption = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, caption: localCaption.trim() } }
          : node
      )
    );
    setIsEditingCaption(false);
  };

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
  };

  const toggleLock = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;
        const nextLocked = !n.data.locked;
        return {
          ...n,
          draggable: !nextLocked,
          deletable: !nextLocked,
          data: {
            ...n.data,
            locked: nextLocked,
            lockedPosition: nextLocked ? { x: n.position.x, y: n.position.y } : undefined,
          },
        };
      })
    );
  };

  // Delete on Delete key (not Backspace — it's for editing text)
  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (!isSelected || isEditingCaption || isTypingTarget(e.target)) return;
      if (e.key === "Delete") {
        setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
      }
    };
    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, [isSelected, isEditingCaption, nodeId, setNodes]);

  return (
    <div
      style={{
        width: nodeWidth,
        height: nodeHeight,
        position: "relative",
      }}
      className="image-node flex flex-col items-center justify-center overflow-visible"
    >
      {/* Delete button */}
      {isSelected && !locked && (
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
            zIndex: 10,
          }}
        />
      )}

      {/* Lock toggle */}
      {isSelected && (
        <button
          onClick={toggleLock}
          title={locked ? "Unlock node" : "Lock node"}
          style={{
            position: "absolute",
            top: -15,
            left: -18,
            background: locked ? "#f59e0b" : "#6b7280",
            color: "white",
            borderRadius: "50%",
            width: 15,
            height: 15,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {locked ? <Lock size={8} /> : <Unlock size={8} />}
        </button>
      )}

      {locked && (
        <div style={{ position: "absolute", top: 4, left: 4, pointerEvents: "none", opacity: 0.6, zIndex: 5 }}>
          <Lock size={10} color="#f59e0b" />
        </div>
      )}

      {/* Resizer */}
      {isSelected && !locked && (
        <NodeResizer
          keepAspectRatio
          minWidth={60}
          minHeight={60}
          lineStyle={{ stroke: "#4e9cff", strokeWidth: 1 }}
          handleStyle={{ width: 10, height: 10, borderRadius: "4px" }}
        />
      )}

      {/* Image */}
      {src ? (
        <img
          src={src}
          alt={localCaption || "Image"}
          draggable={false}
          style={{
            width: "100%",
            height: localCaption ? "calc(100% - 24px)" : "100%",
            objectFit: "contain",
            borderRadius: 4,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: 4,
            border: "2px dashed #d1d5db",
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          No image
        </div>
      )}

      {/* Caption */}
      {isEditingCaption && !locked ? (
        <input
          autoFocus
          onFocus={caretToEnd}
          value={localCaption}
          onChange={(e) => setLocalCaption(e.target.value)}
          onBlur={saveCaption}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveCaption();
            if (e.key === "Escape") setIsEditingCaption(false);
          }}
          style={{
            width: "100%",
            height: 22,
            fontSize: 12,
            textAlign: "center",
            outline: "none",
            border: "1px solid #ccc",
            borderRadius: 2,
            background: "white",
            padding: "0 4px",
          }}
        />
      ) : (
        (localCaption || isSelected) && (
          <span
            onDoubleClick={() => { if (!locked) setIsEditingCaption(true); }}
            style={{
              width: "100%",
              height: 22,
              fontSize: 12,
              textAlign: "center",
              color: localCaption ? "#374151" : "#9ca3af",
              fontStyle: localCaption ? "normal" : "italic",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              userSelect: "none",
              cursor: "text",
              lineHeight: "22px",
            }}
          >
            {localCaption || "Double-click to add caption"}
          </span>
        )
      )}

      {/* Handles */}
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, right: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, right: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />

      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, left: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, left: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />

      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, top: -5, left: nodeWidth / 2, background: "#fff" }}
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, top: -5, left: nodeWidth / 2, background: "#fff" }}
      />

      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, bottom: -5, left: nodeWidth / 2, background: "#fff" }}
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, bottom: -5, left: nodeWidth / 2, background: "#fff" }}
      />
    </div>
  );
}
