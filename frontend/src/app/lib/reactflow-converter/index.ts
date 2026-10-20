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

/**
 * Width that fits the label's longest word on one line and the whole label in
 * about two lines at 14px Inter (~8px per character), within sane bounds.
 */
function nodeWidthFor(label: string): number {
  const longestWord = Math.max(0, ...label.split(/\s+/).map((w) => w.length));
  const byWord = longestWord * 9 + 32;
  const byTwoLines = (label.length / 2) * 8 + 32;
  return Math.round(Math.min(260, Math.max(140, byWord, byTwoLines)));
}

export function convertToReactFlow(graph: LogicalGraph) {
  const nodes = graph.nodes.map((n) => {
    const width = nodeWidthFor(n.label);
    const height = 64;
    return {
    id: n.id,
    type: "shape" as const,
    position: { x: n.x ?? 0, y: n.y ?? 0 },
    // Explicit size so React Flow (and resize/save) keeps it — without it the
    // node's width is undefined and the shape falls back to 80px.
    width,
    height,
    style: { width, height },
    data: {
      type: n.shape,
      text: n.label,
      fill: SHAPE_FILLS[n.shape] ?? "#EFF6FF",
      color: SHAPE_COLORS[n.shape] ?? "#1e3a5f",
      width,
      height,
      fontSize: "14px",
      fontFamily: "Inter",
      locked: false,
      comments: [],
    },
    };
  });

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
