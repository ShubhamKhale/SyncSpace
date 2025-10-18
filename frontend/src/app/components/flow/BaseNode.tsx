import React, { useState, useRef, useEffect } from "react";
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react";

export type BaseNodeProps = {
  id: string;
  data: { label: string };
  selected: boolean;
  style?: React.CSSProperties;
  shapeStyle?: React.CSSProperties; // shape-specific
};

// export default function BaseNode({
//   id,
//   data,
//   selected,
//   style,
//   shapeStyle,
// }: BaseNodeProps) {
//   const { setNodes } = useReactFlow();
//   const [editing, setEditing] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [inputValue, setInputValue] = useState(data.label || "");

//   useEffect(() => {
//     if (editing) setInputValue(data.label || "");
//   }, [editing, data.label]);

//   useEffect(() => {
//     if (editing) inputRef.current?.focus();
//   }, [editing]);

//   const handleDoubleClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setEditing(true);
//   };

//   const handleBlur = () => setEditing(false);

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       setEditing(false);
//     }
//   };

//   const handleInputChange = (value: string) => {
//     setInputValue(value);
//     setNodes((nds) =>
//       nds.map((node) =>
//         node.id === id ? { ...node, data: { ...node.data, label: value } } : node
//       )
//     );
//   };

//   return (
//     <div
//       className="w-full h-full relative box-border flex items-center justify-center p-[3px]"
//       style={{
//         ...shapeStyle, // inject shape-specific styles
//         ...style,
//       }}
//       onDoubleClick={handleDoubleClick}
//     >
//       <NodeResizer
//         minWidth={60}
//         minHeight={30}
//         isVisible={selected}
//         color="#1890ff"
//       />

//       {editing ? (
//         <input
//           ref={inputRef}
//           type="text"
//           value={inputValue}
//           onChange={(e) => handleInputChange(e.target.value)}
//           onBlur={handleBlur}
//           onKeyDown={handleKeyDown}
//           className="w-full border-none outline-none bg-transparent text-center text-[10px] p-[3px] box-border"
//         />
//       ) : (
//         <span className="w-full text-center text-[10px] p-[3px] box-border whitespace-nowrap overflow-hidden text-ellipsis block">
//           {inputValue || <span className="opacity-20">Double-click to edit</span>}
//         </span>
//       )}

//       {/* Handles */}
//       <Handle type="target" position={Position.Top} id="t" />
//       <Handle type="target" position={Position.Right} id="r" />
//       <Handle type="target" position={Position.Bottom} id="b" />
//       <Handle type="target" position={Position.Left} id="l" />
//       <Handle type="source" position={Position.Top} id="s-t" />
//       <Handle type="source" position={Position.Right} id="s-r" />
//       <Handle type="source" position={Position.Bottom} id="s-b" />
//       <Handle type="source" position={Position.Left} id="s-l" />
//     </div>
//   );
// }


//////// 

export default function BaseNode({
  id,
  data,
  selected,
  style,
  shape, // <-- new prop
}: BaseNodeProps & { shape?: "diamond" | "rect" }) {
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
        node.id === id ? { ...node, data: { ...node.data, label: value } } : node
      )
    );
  };

  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      onDoubleClick={handleDoubleClick}
      style={style}
    >
      <NodeResizer minWidth={60} minHeight={30} isVisible={selected} color="#1890ff" />

      {/* SHAPE RENDERING */}
      {shape === "diamond" ? (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
          <polygon points="20,5 35,20 20,35 5,20" fill="#fff" stroke="#222" />
        </svg>
      ) : (
        <div className="absolute inset-0 border border-[#333] rounded-sm bg-white"></div>
      )}

      {/* LABEL */}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full border-none outline-none bg-transparent text-center text-[10px]"
        />
      ) : (
        <span className="text-[10px] text-center whitespace-nowrap overflow-hidden text-ellipsis">
          {inputValue || <span className="opacity-20">Double-click to edit</span>}
        </span>
      )}

      {/* HANDLES */}
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
