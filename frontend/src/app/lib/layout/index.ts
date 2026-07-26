import type { LogicalGraph, LogicalNode } from "../diagram-validator";

const COL_WIDTH = 260;   // horizontal gap between layers
const ROW_HEIGHT = 140;  // vertical gap between nodes in same layer
const START_X = 80;
const START_Y = 80;

export function assignPositions(graph: LogicalGraph): LogicalGraph {
  const { nodes, edges } = graph;
  if (nodes.length === 0) return graph;

  // Build adjacency + in-degree maps
  const children = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeIds = new Set(nodes.map((n) => n.id));

  for (const n of nodes) {
    children.set(n.id, []);
    inDegree.set(n.id, 0);
  }

  for (const e of edges) {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) continue;
    children.get(e.source)!.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // BFS from root nodes to assign column (depth) to each node
  const col = new Map<string, number>();
  const queue: string[] = [];

  for (const n of nodes) {
    if ((inDegree.get(n.id) ?? 0) === 0) {
      queue.push(n.id);
      col.set(n.id, 0);
    }
  }

  // If all nodes have incoming edges (cycle), assign col 0 to first node
  if (queue.length === 0) {
    queue.push(nodes[0].id);
    col.set(nodes[0].id, 0);
  }

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const curCol = col.get(cur) ?? 0;
    for (const child of children.get(cur) ?? []) {
      const existing = col.get(child);
      const newCol = curCol + 1;
      if (existing === undefined || existing < newCol) {
        col.set(child, newCol);
        queue.push(child);
      }
    }
  }

  // Assign unvisited nodes (disconnected) to next available column
  let maxCol = Math.max(...col.values(), 0);
  for (const n of nodes) {
    if (!col.has(n.id)) col.set(n.id, ++maxCol);
  }

  // Group nodes by column
  const byCol = new Map<number, string[]>();
  for (const [id, c] of col.entries()) {
    if (!byCol.has(c)) byCol.set(c, []);
    byCol.get(c)!.push(id);
  }

  // Assign x/y: nodes in same column are stacked vertically, centered
  const positioned = new Map<string, { x: number; y: number }>();
  for (const [c, ids] of byCol.entries()) {
    const totalHeight = (ids.length - 1) * ROW_HEIGHT;
    const midY = START_Y + totalHeight / 2;
    ids.forEach((id, rowIdx) => {
      positioned.set(id, {
        x: START_X + c * COL_WIDTH,
        y: midY - totalHeight / 2 + rowIdx * ROW_HEIGHT,
      });
    });
  }

  const positionedNodes: LogicalNode[] = nodes.map((n) => ({
    ...n,
    x: positioned.get(n.id)?.x ?? 0,
    y: positioned.get(n.id)?.y ?? 0,
  }));

  return { ...graph, nodes: positionedNodes };
}
