import { isTypingTarget } from "./isTypingTarget";
import {
  Handle,
  Position,
  NodeResizer,
  useNodeId,
  useReactFlow,
  useConnection,
} from "@xyflow/react";
import { useEffect, useState } from "react";
import useUndoRedo from "@/app/hooks/useUndoRedo";
import { Lock, Unlock } from "lucide-react";

export default function TableNode({ data }: any) {
  const {
    cells,
    hasHeader,
    headerBg,
    borderColor,
    width,
    height,
  } = data;

  const nodeWidth = width || 300;
  const nodeHeight = height || 180;

  const nodeId = useNodeId();
  const { getNodes, setNodes } = useReactFlow();
  const isSelected = getNodes()?.find((n) => n.id === nodeId)?.selected;
  const isConnecting = useConnection((c) => c.inProgress);

  const { takeSnapshot } = useUndoRedo({
    enableShortcuts: false,
    maxHistorySize: 100,
  });

  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [localCells, setLocalCells] = useState<string[][]>(
    () => cells || Array.from({ length: 3 }, () => Array(3).fill(""))
  );

  // Sync from external changes (undo/redo) — only when not editing
  useEffect(() => {
    if (!editingCell) {
      setLocalCells(cells || Array.from({ length: 3 }, () => Array(3).fill("")));
    }
  }, [cells, editingCell]);

  const numRows = localCells.length;
  const numCols = localCells[0]?.length || 3;

  // Commit a single cell's value to node.data
  const commitCell = (row: number, col: number, value: string) => {
    const updated = localCells.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? value : c))
    );
    setLocalCells(updated);
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, cells: updated } } : n
      )
    );
  };

  // Keyboard navigation between cells
  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number,
    value: string
  ) => {
    if (e.key === "Escape") {
      commitCell(row, col, value);
      setEditingCell(null);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      commitCell(row, col, value);
      if (e.shiftKey) {
        if (col > 0) setEditingCell({ row, col: col - 1 });
        else if (row > 0) setEditingCell({ row: row - 1, col: numCols - 1 });
        else setEditingCell(null);
      } else {
        if (col < numCols - 1) setEditingCell({ row, col: col + 1 });
        else if (row < numRows - 1) setEditingCell({ row: row + 1, col: 0 });
        else setEditingCell(null);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitCell(row, col, value);
      if (row < numRows - 1) setEditingCell({ row: row + 1, col });
      else setEditingCell(null);
    }
  };

  // Table mutation helpers
  const updateCells = (updated: string[][]) => {
    setLocalCells(updated);
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, cells: updated } } : n
      )
    );
  };

  const addRow = () => {
    takeSnapshot();
    updateCells([...localCells, Array(numCols).fill("")]);
  };

  const removeRow = () => {
    if (numRows <= 1) return;
    takeSnapshot();
    updateCells(localCells.slice(0, -1));
  };

  const addCol = () => {
    takeSnapshot();
    updateCells(localCells.map((r) => [...r, ""]));
  };

  const removeCol = () => {
    if (numCols <= 1) return;
    takeSnapshot();
    updateCells(localCells.map((r) => r.slice(0, -1)));
  };

  const toggleHeader = () => {
    takeSnapshot();
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, hasHeader: !hasHeader } }
          : n
      )
    );
  };

  const locked = !!data.locked;

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
  };

  const toggleLock = () => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;
        const nextLocked = !n.data.locked;
        return {
          ...n,
          draggable: !nextLocked,
          deletable: !nextLocked,
          data: {
            ...n.data,
            locked: nextLocked,
            lockedPosition: nextLocked ? { x: n.position.x, y: n.position.y } : undefined,
          },
        };
      })
    );
  };

  // Delete key — only when no cell is active
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isSelected || editingCell !== null || isTypingTarget(e.target)) return;
      if (e.key === "Delete") deleteNode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSelected, editingCell, nodeId, setNodes]);

  const resolvedBorderColor = borderColor || "#374151";
  const resolvedHeaderBg = headerBg || "#1e293b";

  return (
    <div
      style={{ width: nodeWidth, height: nodeHeight, position: "relative" }}
      className="table-node"
    >
      {/* Delete button */}
      {isSelected && !locked && (
        <button
          onClick={deleteNode}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -15,
            right: -18,
            background: "#ff4d4d",
            color: "white",
            borderRadius: "50%",
            width: 15,
            height: 15,
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
        />
      )}

      {/* Lock toggle */}
      {isSelected && (
        <button
          onClick={toggleLock}
          onMouseDown={(e) => e.stopPropagation()}
          title={locked ? "Unlock node" : "Lock node"}
          style={{
            position: "absolute",
            top: -15,
            left: -18,
            background: locked ? "#f59e0b" : "#6b7280",
            color: "white",
            borderRadius: "50%",
            width: 15,
            height: 15,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {locked ? <Lock size={8} /> : <Unlock size={8} />}
        </button>
      )}

      {locked && (
        <div style={{ position: "absolute", top: 4, left: 4, pointerEvents: "none", opacity: 0.6, zIndex: 5 }}>
          <Lock size={10} color="#f59e0b" />
        </div>
      )}

      {/* Resizer — no keepAspectRatio, tables stretch freely */}
      {isSelected && !locked && (
        <NodeResizer
          minWidth={150}
          minHeight={90}
          lineStyle={{ stroke: "#4e9cff", strokeWidth: 1 }}
          handleStyle={{ width: 10, height: 10, borderRadius: "4px" }}
        />
      )}

      {/* Floating toolbar — above the node, hidden when locked */}
      {isSelected && !locked && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: -38,
            left: 0,
            display: "flex",
            alignItems: "center",
            gap: 3,
            background: "#1f2937",
            border: "1px solid #374151",
            borderRadius: 6,
            padding: "3px 6px",
            zIndex: 10,
            pointerEvents: "all",
            whiteSpace: "nowrap",
          }}
        >
          <button className="table-toolbar-btn" onClick={addRow} title="Add Row">+Row</button>
          <button
            className="table-toolbar-btn"
            onClick={removeRow}
            title="Remove Row"
            style={{ opacity: numRows <= 1 ? 0.4 : 1 }}
          >
            −Row
          </button>
          <div style={{ width: 1, height: 14, background: "#4b5563", margin: "0 2px" }} />
          <button className="table-toolbar-btn" onClick={addCol} title="Add Column">+Col</button>
          <button
            className="table-toolbar-btn"
            onClick={removeCol}
            title="Remove Column"
            style={{ opacity: numCols <= 1 ? 0.4 : 1 }}
          >
            −Col
          </button>
          <div style={{ width: 1, height: 14, background: "#4b5563", margin: "0 2px" }} />
          <button
            className="table-toolbar-btn"
            onClick={toggleHeader}
            title="Toggle Header Row"
            style={{ background: hasHeader ? "#3b82f6" : "#374151", borderColor: hasHeader ? "#2563eb" : "#4b5563" }}
          >
            Header
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        className="table-node-grid"
        style={{
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          gridTemplateRows: `repeat(${numRows}, 1fr)`,
        }}
      >
        {localCells.map((row, ri) =>
          row.map((cellValue, ci) => {
            const isHeader = hasHeader && ri === 0;
            const isEditing =
              editingCell?.row === ri && editingCell?.col === ci;

            return (
              <div
                key={`${ri}-${ci}`}
                className={`table-cell${isHeader ? " table-cell-header" : ""}`}
                style={{
                  background: isHeader
                    ? resolvedHeaderBg
                    : ri % 2 === 0
                    ? "#111827"
                    : "#0f172a",
                  borderColor: resolvedBorderColor,
                  cursor: isHeader ? "grab" : "default",
                }}
                // Header cells: let mousedown through so ReactFlow can drag by header
                // Body cells: stop propagation so clicks don't trigger node drag
                onMouseDown={isHeader ? undefined : (e) => e.stopPropagation()}
                onClick={
                  isHeader || locked
                    ? undefined
                    : () => setEditingCell({ row: ri, col: ci })
                }
              >
                {isEditing ? (
                  <input
                    autoFocus
                    className="table-cell-input"
                    defaultValue={cellValue}
                    style={{
                      color: isHeader ? "#f9fafb" : "#e5e7eb",
                      fontWeight: isHeader ? "bold" : "normal",
                      fontSize: 12,
                    }}
                    onBlur={(e) => {
                      commitCell(ri, ci, e.target.value);
                      setEditingCell(null);
                    }}
                    onKeyDown={(e) =>
                      handleCellKeyDown(e, ri, ci, e.currentTarget.value)
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="table-cell-text"
                    style={{
                      color: isHeader ? "#f9fafb" : "#e5e7eb",
                      fontWeight: isHeader ? "bold" : "normal",
                    }}
                  >
                    {cellValue}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Connection handles — 8 total, same pattern as ShapeNode/ImageNode */}
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, right: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, right: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, left: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, left: -5, top: nodeHeight / 2 - 5, background: "#fff" }}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, top: -5, left: nodeWidth / 2, background: "#fff" }}
      />
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, top: -5, left: nodeWidth / 2, background: "#fff" }}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, bottom: -5, left: nodeWidth / 2, background: "#fff" }}
      />
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        className={`node-handle${isConnecting ? " node-handle--connecting" : ""}${isSelected ? " node-handle--selected" : ""}`}
        style={{ width: 10, height: 10, bottom: -5, left: nodeWidth / 2, background: "#fff" }}
      />
    </div>
  );
}
