"use client";
import { useEffect, useRef, useState } from "react";
import { useViewport } from "@xyflow/react";
import type { Participant } from "@/app/hooks/useFlowPresence";

interface Props {
  cursorsRef: React.RefObject<Map<string, { x: number; y: number }>>;
  participants: Participant[];
  myId?: string | null;
}

export function CursorOverlay({ cursorsRef, participants, myId }: Props) {
  const viewport = useViewport();
  const [, forceUpdate] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const participantMap = new Map(participants.map((p) => [p.id, p]));
  const entries = Array.from(cursorsRef.current?.entries() ?? []).filter(([id]) => id !== myId);

  if (entries.length === 0) return null;

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
      {entries.map(([userId, { x, y }]) => {
        const p = participantMap.get(userId);
        if (!p) return null;
        const screenX = x * viewport.zoom + viewport.x;
        const screenY = y * viewport.zoom + viewport.y;
        return (
          <div
            key={userId}
            style={{
              position: "absolute",
              left: screenX,
              top: screenY,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 3,
              pointerEvents: "none",
            }}
          >
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
            >
              <path
                d="M0 0 L0 18 L4.5 13.5 L8 21.5 L10 20.5 L6.5 12.5 L13 12.5 Z"
                fill={p.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              style={{
                background: p.color,
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
              {p.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
