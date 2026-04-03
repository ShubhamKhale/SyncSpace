"use client";
import { useEffect, useState } from "react";

const MOCK_COLLABORATORS = [
  { id: "1", name: "John Berkley", color: "#3b82f6" },
  { id: "2", name: "Alice Smith",  color: "#22c55e" },
  { id: "3", name: "Bob Wilson",   color: "#a855f7" },
];

const INITIAL_POSITIONS = [
  { x: 160, y: 100 },
  { x: 460, y: 220 },
  { x: 680, y: 140 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function CursorOverlay() {
  const [positions, setPositions] = useState(INITIAL_POSITIONS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) =>
        prev.map((p) => ({
          x: clamp(p.x + (Math.random() - 0.5) * 28, 40, 900),
          y: clamp(p.y + (Math.random() - 0.5) * 20, 40, 560),
        }))
      );
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {MOCK_COLLABORATORS.map((collaborator, i) => (
        <div
          key={collaborator.id}
          style={{
            position: "absolute",
            left: positions[i].x,
            top: positions[i].y,
            transition: "left 0.7s ease, top 0.7s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 3,
          }}
        >
          {/* SVG cursor arrow */}
          <svg
            width="18"
            height="22"
            viewBox="0 0 18 22"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
          >
            <path
              d="M0 0 L0 18 L4.5 13.5 L8 21.5 L10 20.5 L6.5 12.5 L13 12.5 Z"
              fill={collaborator.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {/* Name chip */}
          <div
            style={{
              background: collaborator.color,
              color: "white",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 10,
              whiteSpace: "nowrap",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              marginLeft: 4,
            }}
          >
            {collaborator.name}
          </div>
        </div>
      ))}
    </div>
  );
}
