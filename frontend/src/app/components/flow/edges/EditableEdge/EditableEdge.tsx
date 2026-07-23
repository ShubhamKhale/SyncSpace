import { Lock as LockIcon } from "lucide-react";
import { RefObject, useCallback, useRef } from "react";
import {
  EdgeLabelRenderer,
  useReactFlow,
  type Edge,
  type EdgeProps,
  type XYPosition,
  MarkerType,
} from "@xyflow/react";
import { ControlPoint, type ControlPointData } from "./ControlPoint";
import { getPath, getControlPoints } from "./path";
import { getSmartPath } from "./path/smart";
import { Algorithm, BUNDLE_SPACING } from "./constants";
// import { useDiagram } from "@/hooks/useDiagram";
// import useDraggableEdgeLabel from "@app/hooks/useDraggableEdgeLabel";
// import { Animation } from "@/components/EdgeToolbar/EdgeToolbar";
import { useDiagram } from "@/app/hooks/useDiagram";
import useDraggableEdgeLabel from "@/app/hooks/useDraggableEdgeLabel";
import { Animation } from "../../EdgeToolbar/EdgeToolbar";

const useIdsForInactiveControlPoints = (points: ControlPointData[]) => {
  const prevIds = useRef<string[]>([]);
  let newPoints: ControlPointData[] = [];
  if (prevIds.current.length === points.length) {
    // reuse control points from last render, just update their position
    newPoints = points.map((point, i) =>
      point.active ? point : { ...point, id: prevIds.current[i] }
    );
  } else {
    // calculate new control points
    newPoints = points.map((prevPoint, i) => {
      const id = window.crypto.randomUUID();
      prevIds.current[i] = id;
      return prevPoint.active ? points[i] : { ...points[i], id };
    });
  }

  return newPoints;
};

export type EditableEdgeData = {
  algorithm?: Algorithm;
  points: ControlPointData[];
  animation?: string;
  animationDirection?: string;
  showMovingBall?: boolean;
  arrowStyle?: string;
  labelPosition?: number;
  title?: string;
  conditionType?: "yes" | "no" | "error" | "success" | null;
  locked?: boolean;
};

const CONDITION_CONFIG = {
  yes:     { color: "#22c55e", bg: "#166534", icon: "✓", label: "Yes" },
  no:      { color: "#ef4444", bg: "#7f1d1d", icon: "✗", label: "No" },
  error:   { color: "#f97316", bg: "#7c2d12", icon: "⚠", label: "Error" },
  success: { color: "#14b8a6", bg: "#134e4a", icon: "✓", label: "Success" },
} as const;

interface EditableEdgeProps extends EdgeProps {
  useDiagram: ReturnType<typeof useDiagram>;
}
export function EditableEdge({
  id,
  selected,
  source,
  sourceX,
  sourceY,
  sourcePosition,
  target,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  markerStart,
  style,
  data = { points: [] },
  useDiagram,
  ...delegated
}: EditableEdgeProps) {
  const { setEdges, getEdges, getNodes } = useReactFlow();

  // ── Edge bundling ────────────────────────────────────────────────────
  // Find all edges sharing the same unordered {source, target} pair and
  // offset each one perpendicularly so they fan out instead of overlapping.
  const allEdges = getEdges();
  const siblings = allEdges
    .filter((e) => {
      const sameDir = e.source === source && e.target === target;
      const revDir = e.source === target && e.target === source;
      return sameDir || revDir;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const siblingIndex = siblings.findIndex((e) => e.id === id);
  const bundleCount = siblings.length;
  const midIndex = (bundleCount - 1) / 2;
  const bundleOffset = (siblingIndex - midIndex) * BUNDLE_SPACING;

  // Perpendicular direction vector
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = (-dy / len) * bundleOffset;
  const perpY = (dx / len) * bundleOffset;

  const bSourceX = sourceX + perpX;
  const bSourceY = sourceY + perpY;
  const bTargetX = targetX + perpX;
  const bTargetY = targetY + perpY;
  // ─────────────────────────────────────────────────────────────────────

  const sourceOrigin = { x: bSourceX, y: bSourceY } as XYPosition;
  const targetOrigin = { x: bTargetX, y: bTargetY } as XYPosition;

  // ── Condition override ───────────────────────────────────────────────
  const conditionCfg = data.conditionType
    ? CONDITION_CONFIG[data.conditionType as keyof typeof CONDITION_CONFIG]
    : null;
  const color = conditionCfg?.color ?? style?.stroke ?? "#a5a4a5";
  // ─────────────────────────────────────────────────────────────────────

  const direction = (style?.animationDirection as string) || "normal";

  // Arrow style: "end" | "start" | "both" | "none"
  const arrowStyle = (data?.arrowStyle as string) ?? "end";
  const computedMarkerEnd = (arrowStyle === "end" || arrowStyle === "both")
    ? `url(#marker-${id})`
    : undefined;
  const computedMarkerStart = (arrowStyle === "start" || arrowStyle === "both")
    ? `url(#marker-${id})`
    : undefined;
  const locked = !!(data as EditableEdgeData).locked;
  const shouldShowPoints = selected;

  const [edgePathRef, draggableEdgeLabelRef] = useDraggableEdgeLabel(
    sourceX,
    sourceY,
    targetX,
    targetY,
    id,
    data.labelPosition as number
  );

  const setControlPoints = useCallback(
    (update: (points: ControlPointData[]) => ControlPointData[]) => {
      setEdges((edges) =>
        edges.map((e) => {
          if (e.id !== id) return e;
          if (!isEditableEdge(e)) return e;

          const points = e.data?.points ?? [];
          const localData = { ...e.data, points: update(points) };

          return { ...e, data: localData };
        })
      );
      /* setTimeout(() => {
        useDiagram.setEdges((edges) =>
          edges.map((e) => {
            if (e.id !== id) return e;
            if (!isEditableEdge(e)) return e;

            const points = e.data?.points ?? [];
            const localData = { ...e.data, points: update(points) };

            return { ...e, data: localData };
          })
        );
      }, 1000); */
    },
    [id, setEdges]
  );

  // Offset user-placed control points by the same bundle perpendicular vector
  const offsetPoints = (Array.isArray(data.points) ? data.points : []).map(
    (p) => ({ ...p, x: p.x + perpX, y: p.y + perpY })
  );

  let pathPoints = [sourceOrigin, ...offsetPoints, targetOrigin];

  const algorithm = data.algorithm as Algorithm | undefined;
  const sides = { fromSide: sourcePosition, toSide: targetPosition };

  const controlPoints = getControlPoints(pathPoints, algorithm, sides);

  // ── Smart path: computed here because it needs live node data ─────────
  let path: string | undefined;
  if (algorithm === Algorithm.Smart) {
    path = getSmartPath(
      bSourceX, bSourceY,
      bTargetX, bTargetY,
      offsetPoints,
      getNodes(),
      source,
      target
    );
  } else {
    path = getPath(pathPoints, algorithm, sides) ?? "";
  }
  // ─────────────────────────────────────────────────────────────────────

  const controlPointsWithIds = useIdsForInactiveControlPoints(controlPoints);

  return (
    <>
      <path
        d={path}
        style={{
          strokeWidth: 24,
          stroke: "transparent",
          strokeDasharray: "none",
        }}
        fill="transparent"
      />
      <path
        id={id}
        d={path}
        markerEnd={computedMarkerEnd ?? markerEnd}
        markerStart={computedMarkerStart}
        style={{
          ...style,
          strokeWidth: style?.strokeWidth ?? 2,
          stroke: color,
        }}
        ref={edgePathRef}
        fill="transparent"
      />
      <EdgeLabelRenderer>
        <div
          ref={locked ? undefined : draggableEdgeLabelRef}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%)`,
            pointerEvents: "all",
            zIndex: 1000,
          }}
          className="nodrag nopan"
        >
          {/* Bundle count badge — shown when 2+ parallel edges */}
          {bundleCount > 1 && (
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#374151",
                color: "#9ca3af",
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 8,
                border: "1px solid #4b5563",
                pointerEvents: "none",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              ×{bundleCount}
            </div>
          )}

          {/* Edge label + condition badge */}
          <div
            onDoubleClick={locked ? undefined : () => useDiagram.setEditingEdgeId(id)}
            className="group"
            style={{ cursor: locked ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            {/* Lock badge */}
            {locked && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#92400e",
                  border: "1px solid #f59e0b",
                  borderRadius: 8,
                  padding: "2px 5px",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                <LockIcon size={10} color="#f59e0b" />
              </div>
            )}

            {/* Condition badge */}
            {conditionCfg && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: conditionCfg.bg,
                  color: conditionCfg.color,
                  border: `1px solid ${conditionCfg.color}`,
                  borderRadius: 10,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                <span>{conditionCfg.icon}</span>
                <span>{conditionCfg.label}</span>
              </div>
            )}

            {/* Text label */}
            {data.title ? (
              <div
                style={{
                  borderColor: color,
                  borderWidth: "2px",
                  borderStyle: data.animation === Animation.Solid ? "solid" : "none",
                  backgroundImage: (
                    data.animation === Animation.Solid
                      ? "none"
                      : `linear-gradient(90deg, ${color} 50%, transparent 50%),
               linear-gradient(90deg, ${color} 50%, transparent 50%),
               linear-gradient(0deg, ${color} 50%, transparent 50%),
               linear-gradient(0deg, ${color} 50%, transparent 50%)`
                  ) as string,
                  backgroundRepeat:
                    data.animation === Animation.Solid
                      ? "none"
                      : "repeat-x, repeat-x, repeat-y, repeat-y",
                  backgroundSize:
                    data.animation === Animation.Solid
                      ? "none"
                      : "15px 2px, 15px 2px, 2px 15px, 2px 15px",
                  backgroundPosition:
                    data.animation === Animation.Solid
                      ? "none"
                      : "left top, right bottom, left bottom, right top",
                  animation:
                    data.animation === Animation.AnimatedDotted
                      ? `border-dance 1s infinite linear ${direction}`
                      : "none",
                }}
                className="bottom-full p-2 text-center text-sm dark:bg-black bg-white rounded-md"
              >
                {data.title as string}
              </div>
            ) : (
              !conditionCfg && (
                <span
                  style={{
                    opacity: 0,
                    fontSize: 11,
                    color: color,
                    padding: "2px 6px",
                    background: "white",
                    borderRadius: 4,
                    border: `1px dashed ${color}`,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                  }}
                  className="group-hover:opacity-60 transition-opacity"
                >
                  Add label…
                </span>
              )
            )}
          </div>
        </div>
      </EdgeLabelRenderer>

      {shouldShowPoints && !locked &&
        controlPointsWithIds.map((point, index) => (
          <ControlPoint
            key={point.id}
            index={index}
            setControlPoints={setControlPoints}
            color={`${color}`}
            {...point}
          />
        ))}

      {data.showMovingBall ? (
        <circle
          style={{ filter: `drop-shadow(0px 0px 2px ${color}` }}
          r="4"
          fill={`${color}`}
          className="circle"
        >
          <animateMotion
            dur={`${getRandomDuration(4.5, 6)}s`}
            repeatCount="indefinite"
            path={path}
            keyPoints={direction === "normal" ? undefined : "1;0"}
            keyTimes={direction === "normal" ? undefined : "0;1"}
          />
        </circle>
      ) : null}
    </>
  );
}

function getRandomDuration(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const isEditableEdge = (edge: Edge): edge is Edge<EditableEdgeData> =>
  edge.type === "editable-edge";
