"use client";

import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";
import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";

const GROUP_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#6b7280", // gray
];

export default function GroupNode({ data, style }: any) {
  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();
  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(data.label || "Group");

  // Exit label editing if node gets locked
  useEffect(() => {
    if (locked && editingLabel) setEditingLabel(false);
  }, [locked]);

  const borderColor = data.color || "#3b82f6";

  const saveLabel = () => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label: labelDraft.trim() || "Group" } } : n
      )
    );
    setEditingLabel(false);
  };

  const setColor = (color: string) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, color } } : n
      )
    );
  };

  const locked = !!data.locked;

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isSelected || editingLabel) return;
      if (e.key === "Delete" || e.key === "Backspace") deleteNode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSelected, editingLabel]);

  return (
    <div
      style={{
        width: style?.width || 200,
        height: style?.height || 150,
        border: `2px dashed ${borderColor}`,
        borderRadius: 12,
        background: `${borderColor}10`,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {isSelected && !locked && (
        <NodeResizer
          minWidth={100}
          minHeight={80}
          lineStyle={{ stroke: borderColor, strokeWidth: 1 }}
          handleStyle={{ width: 8, height: 8, borderRadius: "50%", background: borderColor }}
        />
      )}

      {locked && (
        <div style={{ position: "absolute", top: 6, left: 6, pointerEvents: "none", opacity: 0.6 }}>
          <Lock size={10} color="#f59e0b" />
        </div>
      )}

      {/* Label bar */}
      <div
        style={{
          position: "absolute",
          top: -24,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {editingLabel && !locked ? (
          <input
            autoFocus
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={saveLabel}
            onKeyDown={(e) => { if (e.key === "Enter") saveLabel(); if (e.key === "Escape") setEditingLabel(false); }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: borderColor,
              background: "white",
              border: `1px solid ${borderColor}`,
              borderRadius: 4,
              padding: "1px 6px",
              outline: "none",
              width: 100,
            }}
          />
        ) : (
          <span
            onDoubleClick={() => { if (!locked) { setLabelDraft(data.label || "Group"); setEditingLabel(true); } }}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: borderColor,
              cursor: "text",
              padding: "1px 4px",
              borderRadius: 4,
              background: "white",
              border: `1px solid ${borderColor}40`,
            }}
          >
            {data.label || "Group"}
          </span>
        )}

        {/* Color dots + lock + delete */}
        {isSelected && (
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {!locked && GROUP_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                  border: data.color === c ? "2px solid #333" : "1px solid rgba(0,0,0,0.2)",
                  cursor: "pointer",
                }}
              />
            ))}
            <button
              onClick={toggleLock}
              title={locked ? "Unlock group" : "Lock group"}
              style={{
                marginLeft: 4,
                background: locked ? "#f59e0b" : "#6b7280",
                border: "none",
                borderRadius: "50%",
                width: 14,
                height: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {locked ? <Lock size={8} color="white" /> : <Unlock size={8} color="white" />}
            </button>
            {!locked && (
              <button
                onClick={deleteNode}
                style={{
                  marginLeft: 2,
                  fontSize: 10,
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
