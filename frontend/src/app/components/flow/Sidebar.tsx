"use client";
import React from "react";

// Shape definition list
const shapes = [
  { type: "rectangle", label: "Rectangle" },
];

// Shape rendering logic
function ShapePreview({ type }: { type: string }) {
  switch (type) {
    case "diamond":
      return (
        <svg width="40" height="40">
          <polygon points="20,5 35,20 20,35 5,20" fill="#fff" stroke="#222" />
        </svg>
      );
    case "Input":
      // Parallelogram (skewed rectangle for "Input")
      return (
        <svg width="40" height="40">
          <polygon points="10,5 35,5 30,35 5,35" fill="#fff" stroke="#222" />
        </svg>
      );
    case "oval":
      // Oval
      return (
        <svg width="40" height="40">
          <ellipse cx="20" cy="20" rx="16" ry="13" fill="#fff" stroke="#222" />
        </svg>
      );
    case "rectangle":
      // Rectangle
      return (
        <svg width="40" height="40">
          <rect x="5" y="10" width="30" height="20" rx="6" fill="#fff" stroke="#222" />
        </svg>
      );
    case "circle":
      return (
        <svg width="40" height="40">
          <circle cx="20" cy="20" r="14" fill="#fff" stroke="#222" />
        </svg>
      );
    case "Square":
      return (
        <svg width="40" height="40">
          <rect x="7" y="7" width="26" height="26" fill="#fff" stroke="#222" />
        </svg>
      );
    default:
      // fallback rectangle
      return (
        <svg width="40" height="40">
          <rect x="5" y="10" width="30" height="20" rx="6" fill="#fff" stroke="#222" />
        </svg>
      );
  }
}

export default function Sidebar() {
  return (
    <div className="w-full h-screen bg-gray-100 p-2 border-r">
      <h3 className="font-bold mb-4">Shapes</h3>
      {shapes.map((shape) => (
        <div
          key={shape.type}
          draggable
          onDragStart={e =>
            e.dataTransfer.setData("application/reactflow", shape.type)
          }
          className="flex items-center p-2 m-2 border rounded bg-white shadow cursor-pointer hover:bg-gray-200"
        >
          <ShapePreview type={shape.type} />
          <span className="ml-2">{shape.label}</span>
        </div>
      ))}
    </div>
  );
}
