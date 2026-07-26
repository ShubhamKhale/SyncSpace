import type { LogicalGraph } from "../diagram-validator";

const SHAPE_FILLS: Record<string, string> = {
  rectangle: "#EFF6FF",
  circle: "#F0FDF4",
  diamond: "#FFFBEB",
  cylinder: "#F5F3FF",
  hexagon: "#FFF1F2",
  parallelogram: "#ECFEFF",
  triangle: "#FFF7ED",
  "rounded-rectangle": "#EFF6FF",
  star: "#FFFBEB",
};

const SHAPE_COLORS: Record<string, string> = {
  rectangle: "#1e3a5f",
  circle: "#14532d",
  diamond: "#92400e",
  cylinder: "#3b0764",
  hexagon: "#881337",
  parallelogram: "#164e63",
  triangle: "#7c2d12",
  "rounded-rectangle": "#1e3a5f",
  star: "#713f12",
};

export function convertToReactFlow(graph: LogicalGraph) {
  const nodes = graph.nodes.map((n) => ({
    id: n.id,
    type: "shape" as const,
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    data: {
      type: n.shape,
      text: n.label,
      fill: SHAPE_FILLS[n.shape] ?? "#EFF6FF",
      color: SHAPE_COLORS[n.shape] ?? "#1e3a5f",
      width: 160,
      height: 60,
      fontSize: "14px",
      fontFamily: "Inter",
      locked: false,
      comments: [],
    },
  }));

  const edges = graph.edges.map((e, i) => ({
    id: `ai-e${i}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: "editable-edge",
    label: e.label ?? "",
    data: { controlPoints: [] },
  }));

  return { title: graph.title, nodes, edges };
}
