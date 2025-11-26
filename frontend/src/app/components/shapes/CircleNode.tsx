import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";

export type CircleNodeData = {
  label: string;
};

export default function CircleNode({ id, data, selected, style }: any) {
  const { setNodes } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(data.label || "");

  useEffect(() => {
    if (editing) setInputValue(data.label || "");
  }, [editing, data.label]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleBlur = () => setEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditing(false);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: value } }
          : node
      )
    );
  };

  // Get size from style/minHeight/minWidth for resizer
  const size = Math.max(
    Number(style?.width) || 60,
    Number(style?.height) || 60,
    60
  );

  return (
    <div
  className="w-full h-full min-w-[60px] min-h-[60px] relative flex items-center justify-center rounded-full overflow-hidden"
  style={{
    background: style?.background || "transparent",
    aspectRatio: "1 / 1",
    clipPath: "circle(50% at 50% 50%)"
  }}
  onDoubleClick={handleDoubleClick}
>
      <NodeResizer
        minWidth={60}
        minHeight={60}
        isVisible={selected}
        color="#1890ff"
        // NodeResizer works for circle, just lock ratio via CSS/props as needed
      />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          pointerEvents: "none", // ensure SVG doesn't block input
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size / 2) - 2}
            fill={style?.background || "#fff"}
            stroke="#232323"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-full text-center text-[10px] p-[3px] box-border flex items-center justify-center pointer-events-auto"
          style={{
            fontFamily: style?.fontFamily || "inherit",
            fontSize: style?.fontSize ? `${style.fontSize}px` : "inherit",
            fontWeight: style?.fontWeight || "normal",
            fontStyle: style?.fontStyle || "normal",
            textDecoration: style?.textDecoration || "none",
            background: "transparent",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            zIndex: 2,
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full border-none outline-none bg-transparent text-center text-[10px] p-[3px] box-border pointer-events-auto"
            />
          ) : (
            <span
              className="block w-full pointer-events-auto"
              style={{ opacity: inputValue ? 1 : 0.3 }}
              onDoubleClick={handleDoubleClick}
            >
              {inputValue || "Double-click to edit"}
            </span>
          )}
        </div>
      </div>

      {/* Handles */}
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
