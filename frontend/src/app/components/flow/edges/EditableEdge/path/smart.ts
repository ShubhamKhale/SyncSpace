import { Node, XYPosition } from "@xyflow/react";

const NODE_PADDING = 24; // px clearance around each node
const CORNER_RADIUS = 12; // px rounding at path corners

/**
 * Check if a line segment (x1,y1)→(x2,y2) intersects a padded node bounding box.
 * Uses AABB overlap test — works for axis-aligned segments.
 */
function segmentIntersectsNode(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  node: Node
): boolean {
  const nx = node.position.x - NODE_PADDING;
  const ny = node.position.y - NODE_PADDING;
  const nw =
    ((node.measured?.width ?? (node.data?.width as number) ?? 100)) +
    NODE_PADDING * 2;
  const nh =
    ((node.measured?.height ?? (node.data?.height as number) ?? 100)) +
    NODE_PADDING * 2;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return !(maxX < nx || minX > nx + nw || maxY < ny || minY > ny + nh);
}

/**
 * Test whether a full multi-segment route has any obstacle collisions.
 */
function routeIsClear(route: XYPosition[], obstacles: Node[]): boolean {
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i];
    const b = route[i + 1];
    for (const node of obstacles) {
      if (segmentIntersectsNode(a.x, a.y, b.x, b.y, node)) return false;
    }
  }
  return true;
}

/**
 * Build a smooth SVG path from a list of axis-aligned waypoints.
 * Corners are rounded using quadratic bezier curves.
 */
function buildRoundedPath(waypoints: XYPosition[]): string {
  if (waypoints.length === 0) return "";
  if (waypoints.length === 1)
    return `M ${waypoints[0].x} ${waypoints[0].y}`;
  if (waypoints.length === 2)
    return `M ${waypoints[0].x} ${waypoints[0].y} L ${waypoints[1].x} ${waypoints[1].y}`;

  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    const dPrev = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
    const dNext = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
    const r = Math.min(CORNER_RADIUS, dPrev / 2, dNext / 2);

    // Entry point before corner
    const ex = curr.x - (r / dPrev) * (curr.x - prev.x);
    const ey = curr.y - (r / dPrev) * (curr.y - prev.y);
    // Exit point after corner
    const fx = curr.x + (r / dNext) * (next.x - curr.x);
    const fy = curr.y + (r / dNext) * (next.y - curr.y);

    d += ` L ${ex} ${ey} Q ${curr.x} ${curr.y} ${fx} ${fy}`;
  }

  const last = waypoints[waypoints.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/**
 * Auto-routing algorithm that finds an orthogonal path avoiding node obstacles.
 *
 * Strategy:
 * 1. If user placed control points manually → respect them (use linear routing).
 * 2. Otherwise try 3 candidate orthogonal routes (H-V, V-H, H-V-H).
 * 3. Use first clear route; if all blocked, shift the H-V-H midpoint past obstacles.
 * 4. Smooth the result with rounded corners.
 */
export function getSmartPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  controlPoints: XYPosition[],
  nodes: Node[],
  sourceNodeId: string,
  targetNodeId: string
): string {
  // Respect manually-placed control points
  if (controlPoints.length > 0) {
    const pts = [{ x: sx, y: sy }, ...controlPoints, { x: tx, y: ty }];
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  // Obstacles: every node except the source and target of this edge
  const obstacles = nodes.filter(
    (n) => n.id !== sourceNodeId && n.id !== targetNodeId
  );

  if (obstacles.length === 0) {
    // No obstacles — use a simple direct line
    return `M ${sx} ${sy} L ${tx} ${ty}`;
  }

  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  // Three candidate routes
  const candidates: XYPosition[][] = [
    // H-V: go horizontal to target x, then vertical
    [{ x: sx, y: sy }, { x: tx, y: sy }, { x: tx, y: ty }],
    // V-H: go vertical to target y, then horizontal
    [{ x: sx, y: sy }, { x: sx, y: ty }, { x: tx, y: ty }],
    // H-V-H: elbow at midpoint x
    [
      { x: sx, y: sy },
      { x: midX, y: sy },
      { x: midX, y: ty },
      { x: tx, y: ty },
    ],
  ];

  const clearRoute = candidates.find((r) => routeIsClear(r, obstacles));

  if (clearRoute) {
    return buildRoundedPath(clearRoute);
  }

  // Fallback: shift the H-V-H elbow rightward past all blocking nodes
  let adjustedMidX = midX;
  for (const node of obstacles) {
    const nRight =
      node.position.x +
      (node.measured?.width ?? (node.data?.width as number) ?? 100) +
      NODE_PADDING;
    // If the vertical segment at adjustedMidX still hits this node, push further right
    if (segmentIntersectsNode(adjustedMidX, sy, adjustedMidX, ty, node)) {
      adjustedMidX = Math.max(adjustedMidX, nRight);
    }
  }

  const fallback: XYPosition[] = [
    { x: sx, y: sy },
    { x: adjustedMidX, y: sy },
    { x: adjustedMidX, y: ty },
    { x: tx, y: ty },
  ];

  return buildRoundedPath(fallback);
}
