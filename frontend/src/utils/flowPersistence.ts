import { Node, Edge } from "@xyflow/react";

export function saveFlow(name: string, nodes: Node[], edges: Edge[]) {
  if (!name) return;
  const flowData = JSON.stringify({ nodes, edges });
  localStorage.setItem(`flow-${name}`, flowData);
}

export function loadFlow(name: string): { nodes: Node[]; edges: Edge[] } | null {
  if (!name) return null;
  const saved = localStorage.getItem(`flow-${name}`);
  if (!saved) return null;
  return JSON.parse(saved);
}