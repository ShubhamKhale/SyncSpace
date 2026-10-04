// import {
//   Handle,
//   Position,
//   NodeResizer,
//   useNodeId,
//   useReactFlow,
// } from "@xyflow/react";
// import { ShapeComponents, ShapeType } from "@/app/components/shape/types";

// export default function ShapeNode({ data }: any) {
//   const { type, width, height, fill } = data;
//   const Shape = ShapeComponents[type as ShapeType];

//   const nodeWidth = width || 80;
//   const nodeHeight = height || 80;

//   // get current node id + full diagram state
//   const nodeId = useNodeId();
//   const { getNodes, setNodes } = useReactFlow();

//   // check if current node is selected
//   const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;

//   // delete Node
//   const deleteNode = () => {
//     setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
//   };

//   return (
//     <div
//       style={{
//         width: nodeWidth,
//         height: nodeHeight,
//         position: "relative",
//       }}
//       className="flex items-center justify-center overflow-visible"
//     >
//       {isSelected && (
//         <button
//           onClick={deleteNode}
//           style={{
//             position: "absolute",
//             top: -28,
//             right: -18,
//             background: "#ff4d4d",
//             color: "white",
//             borderRadius: "50%",
//             width: 24,
//             height: 24,
//             border: "none",
//             cursor: "pointer",
//             fontSize: 14,
//           }}
//         >
//           ×
//         </button>
//       )}

//       {isSelected && (
//         <NodeResizer
//           minWidth={40}
//           minHeight={40}
//           lineStyle={{ stroke: "#4e9cff", strokeWidth: 1 }}
//           handleStyle={{ width: 10, height: 10, borderRadius: "4px" }}
//         />
//       )}

//       {/* Shape */}
//       <svg width={nodeWidth} height={nodeHeight}>
//         <Shape
//           width={nodeWidth}
//           height={nodeHeight}
//           fill={fill || "#ffffff"}
//           stroke="black"
//           strokeWidth={2}
//         />
//       </svg>

//         <Handle
//           id="right-source"
//           type="source"
//           position={Position.Right}
//           style={{
//             width: 10,
//             height: 10,
//             right: -5,
//             top: nodeHeight / 2 - 5,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="right-target"
//           type="target"
//           position={Position.Right}
//           style={{
//             width: 10,
//             height: 10,
//             right: -5,
//             top: nodeHeight / 2 - 5,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="left-source"
//           type="source"
//           position={Position.Left}
//           style={{
//             width: 10,
//             height: 10,
//             left: -5,
//             top: nodeHeight / 2 - 5,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="left-target"
//           type="target"
//           position={Position.Left}
//           style={{
//             width: 10,
//             height: 10,
//             left: -5,
//             top: nodeHeight / 2 - 5,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="top-source"
//           type="source"
//           position={Position.Top}
//           style={{
//             width: 10,
//             height: 10,
//             top: -5,
//             left: nodeWidth / 2,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="top-target"
//           type="target"
//           position={Position.Top}
//           style={{
//             width: 10,
//             height: 10,
//             top: -5,
//             left: nodeWidth / 2,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="bottom-source"
//           type="source"
//           position={Position.Bottom}
//           style={{
//             width: 10,
//             height: 10,
//             bottom: -5,
//             left: nodeWidth / 2,
//             background: "#fff",
//           }}
//         />

//         <Handle
//           id="bottom-target"
//           type="target"
//           position={Position.Bottom}
//           style={{
//             width: 10,
//             height: 10,
//             bottom: -5,
//             left: nodeWidth / 2,
//             background: "#fff",
//           }}
//         />
//     </div>
//   );
// }

import { isTypingTarget } from "./isTypingTarget";
import {
  Handle,
  Position,
  NodeResizer,
  useNodeId,
  useReactFlow,
  useConnection,
} from "@xyflow/react";
import { ShapeComponents, ShapeType } from "@/app/components/shape/types";
import { useEffect, useState } from "react";
import { Lock, Unlock, MessageSquare } from "lucide-react";
import { NodeCommentPanel, NodeComment } from "./NodeCommentPanel";

export default function ShapeNode({ data }: any) {
  const { type, width, height, fill, text, textAlign, listType, checkedItems, fontFamily, fontSize, fontWeight, fontStyle: dataFontStyle, textDecoration, color: textColor } = data;
  const locked = !!data.locked;
  const comments: NodeComment[] = data.comments || [];
  const Shape = ShapeComponents[type as ShapeType];

  const nodeWidth = width || 80;
  const nodeHeight = height || 80;

  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();

  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;
  const isConnecting = useConnection((c) => c.inProgress);

  const [showComments, setShowComments] = useState(false);
  const hasComments = comments.length > 0;

  // Close comment panel when node is deselected
  useEffect(() => {
    if (!isSelected) setShowComments(false);
  }, [isSelected]);

  // Editable text state
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(text || "");
  const isPlaceholder = !localText.trim();

  // Sync localText if the node's text data changes externally (e.g. undo/redo)
  useEffect(() => {
    if (!isEditing) setLocalText(text || "");
  }, [text, isEditing]);

  // Exit editing mode immediately if node gets locked while editing
  useEffect(() => {
    if (locked && isEditing) setIsEditing(false);
  }, [locked]);

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
      nodes.map((node) => {
        if (node.id !== nodeId) return node;
        const current = (node.data.checkedItems as boolean[]) || [];
        const updated = [...current];
        updated[index] = !updated[index];
        return { ...node, data: { ...node.data, checkedItems: updated } };
      })
    );
  };

  useEffect(() => {
    const handleDelete = (e: KeyboardEvent) => {
      if (!isSelected || isTypingTarget(e.target)) return;

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
          }}
        >
        </button>
      )}

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
          }}
        >
          {locked ? <Lock size={8} /> : <Unlock size={8} />}
        </button>
      )}

      {locked && (
        <div style={{ position: "absolute", top: 4, left: 4, pointerEvents: "none", opacity: 0.55 }}>
          <Lock size={10} color="#f59e0b" />
        </div>
      )}

      {isSelected && !locked && (
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
          fill={fill || "#ffffff"}
          stroke={fill && fill !== "#ffffff" ? fill : "black"}
          strokeWidth={2}
        />
      </svg>

      {/* Editable Text */}
      {isEditing && !locked ? (
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
            border: `1px solid ${fill || "#ccc"}`,
            background: fill || "white",
            padding: "4px",
            fontSize: fontSize || "14px",
            fontFamily: fontFamily || "inherit",
            fontWeight: fontWeight || "normal",
            fontStyle: dataFontStyle || "normal",
            textDecoration: textDecoration || "none",
            textAlign: (textAlign as any) || "center",
            color: textColor || "#000",
          }}
        />
      ) : (
        <span
          onDoubleClick={() => { if (!locked) setIsEditing(true); }}
          style={{
            position: "absolute",
            width: nodeWidth - 10,
            height: nodeHeight - 10,
            padding: "5px",
            textAlign: (textAlign as any) || "center",
            pointerEvents: "auto",
            fontSize: fontSize || "14px",
            fontFamily: fontFamily || "inherit",
            fontWeight: fontWeight || "normal",
            fontStyle: isPlaceholder ? "italic" : (dataFontStyle || "normal"),
            textDecoration: textDecoration || "none",
            color: isPlaceholder ? "#868686" : (textColor || "#000"),
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            overflow: "hidden",
            lineHeight: "1.4",
            display: "flex",
            flexDirection: "column",
            alignItems: textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
            justifyContent: "center",
            opacity: isPlaceholder ? 0.6 : 1,
            userSelect: "none",
          }}
        >
          {isPlaceholder ? "Double-click to edit" : (
            listType
              ? localText.split("\n").filter(Boolean).map((line: string, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 4, width: "100%", textAlign: (textAlign as any) || "left", alignItems: "flex-start" }}>
                    {listType === "checklist" ? (
                      <span
                        style={{ flexShrink: 0, cursor: "pointer", userSelect: "none", lineHeight: "1.4" }}
                        onClick={(e) => { e.stopPropagation(); toggleChecklistItem(i); }}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        {(checkedItems as boolean[])?.[i] ? "☑" : "☐"}
                      </span>
                    ) : (
                      <span style={{ flexShrink: 0, lineHeight: "1.4" }}>
                        {listType === "bullet" ? "•" : `${i + 1}.`}
                      </span>
                    )}
                    <span style={{ textDecoration: listType === "checklist" && (checkedItems as boolean[])?.[i] ? "line-through" : "none", opacity: listType === "checklist" && (checkedItems as boolean[])?.[i] ? 0.5 : 1 }}>{line}</span>
                  </div>
                ))
              : localText
          )}
        </span>
      )}

      {/* Handles */}
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
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
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{
          width: 10,
          height: 10,
          bottom: -5,
          left: nodeWidth / 2,
          background: "#fff",
        }}
      />

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
