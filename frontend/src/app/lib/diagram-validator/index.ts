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
  errors: string[];
  graph?: LogicalGraph;
}

export function validate(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["Output is not an object."] };
  }

  const obj = raw as Record<string, unknown>;

  const title = typeof obj.title === "string" ? obj.title : "Generated Diagram";

  if (!Array.isArray(obj.nodes) || obj.nodes.length === 0) {
    return { valid: false, errors: ["No nodes in output."] };
  }

  if (obj.nodes.length > 30) {
    errors.push(`Too many nodes (${obj.nodes.length}). Max is 30.`);
  }

  const nodeIds = new Set<string>();
  const nodes: LogicalNode[] = [];

  for (const n of obj.nodes as unknown[]) {
    if (!n || typeof n !== "object") { errors.push("Invalid node entry."); continue; }
    const node = n as Record<string, unknown>;

    if (typeof node.id !== "string" || !node.id) { errors.push("Node missing id."); continue; }
    if (nodeIds.has(node.id)) { errors.push(`Duplicate node id: ${node.id}`); continue; }
    nodeIds.add(node.id);

    const label = typeof node.label === "string" ? node.label : String(node.id);
    const shape = SUPPORTED_SHAPES.has(String(node.shape)) ? String(node.shape) : "rectangle";

    nodes.push({ id: node.id, label, shape });
  }

  const edges: LogicalEdge[] = [];

  if (Array.isArray(obj.edges)) {
    for (const e of obj.edges as unknown[]) {
      if (!e || typeof e !== "object") continue;
      const edge = e as Record<string, unknown>;

      if (typeof edge.source !== "string" || typeof edge.target !== "string") continue;
      if (!nodeIds.has(edge.source)) { errors.push(`Edge references unknown source: ${edge.source}`); continue; }
      if (!nodeIds.has(edge.target)) { errors.push(`Edge references unknown target: ${edge.target}`); continue; }

      edges.push({
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === "string" ? edge.label : undefined,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], graph: { title, nodes, edges } };
}
