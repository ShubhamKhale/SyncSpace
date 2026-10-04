"use client";

import { isTypingTarget } from "./isTypingTarget";
import { NodeResizer, useNodeId, useReactFlow } from "@xyflow/react";
import { useState, useEffect } from "react";
import { Lock, Unlock, MessageSquare } from "lucide-react";
import { NodeCommentPanel, NodeComment } from "./NodeCommentPanel";

const NOTE_COLORS: { label: string; bg: string; header: string }[] = [
  { label: "Yellow", bg: "#fef9c3", header: "#fde047" },
  { label: "Blue", bg: "#dbeafe", header: "#93c5fd" },
  { label: "Green", bg: "#dcfce7", header: "#86efac" },
  { label: "Pink", bg: "#fce7f3", header: "#f9a8d4" },
  { label: "Purple", bg: "#ede9fe", header: "#c4b5fd" },
];

export default function StickyNoteNode({ data }: any) {
  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();
  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;

  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(data.text || "");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const locked = !!data.locked;
  const comments: NodeComment[] = data.comments || [];
  const hasComments = comments.length > 0;
  const [showComments, setShowComments] = useState(false);

  // Close comment panel when node is deselected
  useEffect(() => {
    if (!isSelected) setShowComments(false);
  }, [isSelected]);

  const colorScheme = NOTE_COLORS.find((c) => c.bg === data.color) || NOTE_COLORS[0];
  const listType: string | null = data.listType ?? null;
  const checkedItems: boolean[] = data.checkedItems || [];
  const textAlign: "left" | "center" | "right" = data.textAlign || "left";

  // Sync text on undo/redo
  useEffect(() => {
    if (!isEditing) setLocalText(data.text || "");
  }, [data.text, isEditing]);

  // Exit editing mode immediately if node gets locked while editing
  useEffect(() => {
    if (locked && isEditing) setIsEditing(false);
  }, [locked]);

  const saveText = () => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, text: localText } } : n
      )
    );
    setIsEditing(false);
  };

  const setColor = (bg: string) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, color: bg } } : n
      )
    );
    setShowColorPicker(false);
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

  const toggleChecklistItem = (index: number) => {
    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const current = (n.data.checkedItems as boolean[]) || [];
        const updated = [...current];
        updated[index] = !updated[index];
        return { ...n, data: { ...n.data, checkedItems: updated } };
      })
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isSelected || isEditing || isTypingTarget(e.target)) return;
      if (e.key === "Delete") deleteNode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSelected, isEditing]);

  return (
    <div
      style={{
        background: colorScheme.bg,
        minWidth: 140,
        minHeight: 100,
        borderRadius: 8,
        boxShadow: "2px 4px 12px rgba(0,0,0,0.15)",
        overflow: "visible",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {isSelected && !locked && (
        <NodeResizer
          minWidth={120}
          minHeight={80}
          lineStyle={{ stroke: colorScheme.header, strokeWidth: 1 }}
          handleStyle={{ width: 8, height: 8, borderRadius: "50%", background: colorScheme.header }}
        />
      )}

      {/* Colored header strip */}
      <div
        style={{
          background: colorScheme.header,
          height: 28,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
          cursor: "grab",
          flexShrink: 0,
        }}
      >
        <div className="flex gap-1">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.bg}
              onClick={() => setColor(c.bg)}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c.header,
                border: data.color === c.bg ? "2px solid #333" : "1px solid rgba(0,0,0,0.2)",
                cursor: "pointer",
              }}
              title={c.label}
            />
          ))}
        </div>
        {isSelected && (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={toggleLock}
              title={locked ? "Unlock node" : "Lock node"}
              style={{
                background: locked ? "#f59e0b" : "rgba(0,0,0,0.2)",
                border: "none",
                borderRadius: "50%",
                width: 16,
                height: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {locked ? <Lock size={8} color="white" /> : <Unlock size={8} color="#333" />}
            </button>
            {!locked && (
              <button
                onClick={deleteNode}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  fontSize: 10,
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        {locked && (
          <div style={{ pointerEvents: "none", opacity: 0.55 }}>
            <Lock size={10} color="#f59e0b" />
          </div>
        )}
      </div>

      {/* Text body */}
      {isEditing && !locked ? (
        <textarea
          autoFocus
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={saveText}
          style={{
            flex: 1,
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: "8px",
            fontSize: 13,
            color: "#374151",
            lineHeight: 1.4,
            fontFamily: "inherit",
            textAlign,
          }}
          placeholder="Type your note…"
        />
      ) : (
        <div
          onDoubleClick={() => { if (!locked) setIsEditing(true); }}
          style={{
            flex: 1,
            padding: "8px",
            fontSize: 13,
            color: localText ? "#374151" : "#9ca3af",
            lineHeight: 1.4,
            whiteSpace: listType ? "normal" : "pre-wrap",
            wordBreak: "break-word",
            overflow: "hidden",
            cursor: "default",
            fontStyle: localText ? "normal" : "italic",
            userSelect: "none",
            textAlign,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
          }}
        >
          {!localText
            ? "Double-click to edit…"
            : listType
            ? localText.split("\n").filter(Boolean).map((line: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  {listType === "checklist" ? (
                    <span
                      style={{ flexShrink: 0, cursor: "pointer", userSelect: "none", lineHeight: "1.4" }}
                      onClick={(e) => { e.stopPropagation(); toggleChecklistItem(i); }}
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      {checkedItems[i] ? "☑" : "☐"}
                    </span>
                  ) : (
                    <span style={{ flexShrink: 0, lineHeight: "1.4" }}>
                      {listType === "bullet" ? "•" : `${i + 1}.`}
                    </span>
                  )}
                  <span
                    style={{
                      textDecoration: listType === "checklist" && checkedItems[i] ? "line-through" : "none",
                      opacity: listType === "checklist" && checkedItems[i] ? 0.5 : 1,
                    }}
                  >
                    {line}
                  </span>
                </div>
              ))
            : localText}
        </div>
      )}

      {/* Comment badge */}
      {(isSelected || hasComments) && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowComments((v) => !v); }}
          title="Comments"
          style={{
            position: "absolute",
            bottom: -10,
            right: -10,
            background: hasComments ? "#3b82f6" : "#6b7280",
            color: "white",
            borderRadius: "50%",
            width: 18,
            height: 18,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: "bold",
            zIndex: 10,
          }}
        >
          {hasComments ? comments.length : <MessageSquare size={9} />}
        </button>
      )}

      {/* Comment panel */}
      {showComments && (
        <NodeCommentPanel
          nodeId={nodeId!}
          comments={comments}
          locked={locked}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
}
