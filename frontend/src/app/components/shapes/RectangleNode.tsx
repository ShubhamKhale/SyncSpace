import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";

export type RectangleNodeData = {
  label: string;
};

export default function RectangleNode({ id, data, selected, style }: any) {
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

  const handleBlur = () => {
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditing(false); // stop editing
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

  return (
    <div
      className="w-full h-full border border-gray-800 rounded-sm p-[3px] text-[10px] min-w-[60px] min-h-[30px] relative box-border"
      style={{
        background: style?.background || "transparent",
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        minWidth={60}
        minHeight={30}
        isVisible={selected}
        color="#1890ff"
      />

      <div className="h-full flex items-center justify-center">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full border-none outline-none bg-transparent text-center text-[10px] p-[3px] box-border"
            style={{
              fontFamily: style?.fontFamily || "inherit",
              fontSize: style?.fontSize ? `${style.fontSize}px` : "inherit",
              fontWeight: style?.fontWeight || "normal",
              fontStyle: style?.fontStyle || "normal",
              textDecoration: style?.textDecoration || "none",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: style?.fontFamily || "inherit",
              fontSize: style?.fontSize ? `${style.fontSize}px` : "inherit",
              fontWeight: style?.fontWeight || "normal",
              fontStyle: style?.fontStyle || "normal",
              textDecoration: style?.textDecoration || "none",
            }}
            className="w-full text-center text-[10px] p-[3px] box-border whitespace-nowrap overflow-hidden text-ellipsis block"
          >
            {inputValue || (
              <span className="opacity-20">Double-click to edit</span>
            )}
          </span>
        )}
      </div>

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
