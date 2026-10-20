const SUPPORTED_SHAPES = new Set([
  "rectangle",
  "circle",
  "diamond",
  "cylinder",
  "hexagon",
  "parallelogram",
  "triangle",
  "rounded-rectangle",
  "star",
]);

/** Above this many nodes the canvas gets unreadable; extra nodes are dropped. */
export const MAX_NODES = 30;

export interface LogicalNode {
  id: string;
  label: string;
  shape: string;
  x?: number;
  y?: number;
}

export interface LogicalEdge {
  source: string;
  target: string;
  label?: string;
}

export interface LogicalGraph {
  title: string;
  nodes: LogicalNode[];
  edges: LogicalEdge[];
}

export interface ValidationResult {
  valid: boolean;
  /** Fatal problems — only set when no usable diagram could be recovered. */
  errors: string[];
  /** Fixes applied to the model's output (dropped edges, renamed ids, …). */
  repairs: string[];
  graph?: LogicalGraph;
}

/**
 * Validates the model's {title, nodes, edges} output and repairs what it can
 * instead of rejecting the whole diagram over one slip: unsupported shapes
 * become rectangles, nodes without an id get one, duplicate ids are renamed,
 * nodes beyond MAX_NODES are dropped, and edges pointing at unknown nodes (or
 * at themselves) are dropped. Fails only when no nodes survive.
 */
export function validate(raw: unknown): ValidationResult {
  const repairs: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["Output is not an object."], repairs };
  }

  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === "string" && obj.title.trim() ? obj.title : "Generated Diagram";

  if (!Array.isArray(obj.nodes) || obj.nodes.length === 0) {
    return { valid: false, errors: ["The AI returned a diagram with no nodes."], repairs };
  }

  const nodeIds = new Set<string>();
  const nodes: LogicalNode[] = [];
  let invalidEntries = 0;
  let renamed = 0;
  let reshaped = 0;

  for (const n of obj.nodes as unknown[]) {
    if (!n || typeof n !== "object") { invalidEntries++; continue; }
    if (nodes.length >= MAX_NODES) continue;
    const node = n as Record<string, unknown>;

    const label = typeof node.label === "string" && node.label.trim() ? node.label : undefined;
    let id = typeof node.id === "string" && node.id ? node.id : "";
    if (!id) id = label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "_") : `node_${nodes.length + 1}`;
    if (nodeIds.has(id)) {
      // Keep the first node with this id (edges most likely meant it) and
      // give the duplicate a fresh one rather than discarding it.
      let i = 2;
      while (nodeIds.has(`${id}_${i}`)) i++;
      id = `${id}_${i}`;
      renamed++;
    }
    nodeIds.add(id);

    const shapeOk = SUPPORTED_SHAPES.has(String(node.shape));
    if (!shapeOk && node.shape !== undefined) reshaped++;
    nodes.push({ id, label: label ?? id, shape: shapeOk ? String(node.shape) : "rectangle" });
  }

  if (nodes.length === 0) {
    return { valid: false, errors: ["The AI returned no usable nodes."], repairs };
  }

  const dropped = (obj.nodes as unknown[]).length - invalidEntries - nodes.length;
  if (dropped > 0) repairs.push(`Kept the first ${MAX_NODES} nodes (dropped ${dropped}).`);
  if (invalidEntries > 0) repairs.push(`Skipped ${invalidEntries} malformed node entr${invalidEntries === 1 ? "y" : "ies"}.`);
  if (renamed > 0) repairs.push(`Renamed ${renamed} duplicate node id${renamed === 1 ? "" : "s"}.`);
  if (reshaped > 0) repairs.push(`Drew ${reshaped} unsupported shape${reshaped === 1 ? "" : "s"} as rectangles.`);

  const edges: LogicalEdge[] = [];
  const seen = new Set<string>();
  let badEdges = 0;

  if (Array.isArray(obj.edges)) {
    for (const e of obj.edges as unknown[]) {
      if (!e || typeof e !== "object") { badEdges++; continue; }
      const edge = e as Record<string, unknown>;
      const source = typeof edge.source === "string" ? edge.source : "";
      const target = typeof edge.target === "string" ? edge.target : "";
      if (!nodeIds.has(source) || !nodeIds.has(target) || source === target) { badEdges++; continue; }

      const label = typeof edge.label === "string" && edge.label.trim() ? edge.label : undefined;
      const key = `${source}→${target}→${label ?? ""}`;
      if (seen.has(key)) continue; // exact duplicate edge — silently collapse
      seen.add(key);
      edges.push({ source, target, label });
    }
  }
  if (badEdges > 0) repairs.push(`Dropped ${badEdges} connection${badEdges === 1 ? "" : "s"} to missing nodes.`);

  return { valid: true, errors: [], repairs, graph: { title, nodes, edges } };
}
