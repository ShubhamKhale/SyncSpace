"use client";

import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useFlowStore } from "@/app/store/flowStore";
// import FourWayNode from "./CustomDirectionalNode";
import { loadFlow, saveFlow } from "@/utils/flowPersistence";
import RectangleNode from "../shapes/RectangleNode";


const nodeTypes = {
  // directional: FourWayNode,
  rectangle: RectangleNode,
};

const PREDEFINED_COLORS = [
  "#ffffff",
  "#e6f7ff",
  "#fff2cc",
  "#d9ead3",
  "#f9cb9c",
  "#f4cccc",
  "#000000",
  "#434343",
  "#8f8f8f",
  "#b5b5b5",
  "#e06666",
  "#ffd966",
  "#93c47d",
  "#76a5af",
  "#6fa8dc",
  "#3c78d8",
  "#285192",
  "#674ea7",
  "#ff9900",
];

function FlowEditorInner() {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes,
    setEdges,
  } = useFlowStore();

  const [nodes, setLocalNodes] = useNodesState<Node>(storeNodes);
  const [edges, setLocalEdges] = useEdgesState<Edge>(storeEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [workflowName, setWorkflowName] = useState("");
  const [fontFamily, setFontFamily] = useState<string>(""); // default font family
  const [fontSize, setFontSize] = useState<number | "">(14); // default font size
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Undo / Redo stacks ---
  const [undoStack, setUndoStack] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);

  // track selected node for fill color editing
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Helper: Push Current state to undo stack
  const pushToUndo = useCallback(() => {
    setUndoStack((prev) => [...prev, { nodes, edges }]);
    setRedoStack([]); // clear redo stack on new action
  }, [nodes, edges]);

  // Undo operation
  const handleUndo = useCallback(() => {
    if (!undoStack.length) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, { nodes, edges }]);
    setLocalNodes(last.nodes);
    setLocalEdges(last.edges);
    setNodes(last.nodes);
    setEdges(last.edges);
    setUndoStack((stack) => stack.slice(0, -1));
  }, [
    undoStack,
    nodes,
    edges,
    setLocalNodes,
    setLocalEdges,
    setNodes,
    setEdges,
  ]);

  // Redo operation
  const handleRedo = useCallback(() => {
    if (!redoStack.length) return;
    const last = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, { nodes, edges }]);
    setLocalNodes(last.nodes);
    setLocalEdges(last.edges);
    setNodes(last.nodes);
    setEdges(last.edges);
    setRedoStack((stack) => stack.slice(0, -1));
  }, [
    redoStack,
    nodes,
    edges,
    setLocalNodes,
    setLocalEdges,
    setNodes,
    setEdges,
  ]);

  const handleSave = useCallback(() => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name before saving.");
      return;
    }
    saveFlow(workflowName.trim(), nodes, edges);
    alert(`Workflow "${workflowName}" saved!`);
  }, [workflowName, nodes, edges]);

  const handleLoad = useCallback(() => {
    if (!workflowName.trim()) {
      alert("Please enter a workflow name to load.");
      return;
    }
    const data = loadFlow(workflowName.trim());
    if (data) {
      setLocalNodes(data.nodes);
      setLocalEdges(data.edges);
      setNodes(data.nodes);
      setEdges(data.edges);
      alert(`Workflow "${workflowName}" loaded!`);
    } else {
      alert(`No saved workflow found for "${workflowName}".`);
    }
    // Clear undo/redo so load is not considered undoable
    setUndoStack([]);
    setRedoStack([]);
  }, [workflowName, setLocalNodes, setLocalEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      pushToUndo();
      const newEdges = addEdge(connection, edges);
      setLocalEdges(newEdges);
      setEdges(newEdges);
    },
    [edges, setEdges, setLocalEdges, pushToUndo]
  );

  const handleNodeDragStart = useCallback(() => {
    pushToUndo();
  }, [pushToUndo]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setLocalNodes(updatedNodes);
      setNodes(updatedNodes);
    },
    [nodes, setLocalNodes, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      pushToUndo();
      const updatedEdges = applyEdgeChanges(changes, edges);
      setLocalEdges(updatedEdges);
      setEdges(updatedEdges);
    },
    [edges, setLocalEdges, setEdges, pushToUndo]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow");
      if (!nodeType) return;
      pushToUndo();

      // Convert mouse coords to flow canvas coords
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${+new Date()}`,
        type: nodeType,
        position,
        data: { label: `` },
      };

      const updatedNodes = [...nodes, newNode];
      setLocalNodes(updatedNodes);
      setNodes(updatedNodes);
    },
    [nodes, setLocalNodes, setNodes, pushToUndo, screenToFlowPosition]
  );

  // track node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setFontFamily(node.style?.fontFamily || "");
    setFontSize(node.style?.fontSize || 14);
    setIsBold(node.style?.fontWeight === "bold");
    setIsItalic(node.style?.fontStyle === "italic");
    setIsUnderline(node.style?.textDecoration === "underline");
  }, []);

  // change fill color for selected node
  const handleFillColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedNodeId) return;
      pushToUndo();
      const newColor = e.target.value;
      setLocalNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? { ...node, style: { ...node.style, background: newColor } }
            : node
        )
      );
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNodeId
            ? { ...node, style: { ...node.style, background: newColor } }
            : node
        )
      );
    },
    [selectedNodeId, setLocalNodes, setNodes, pushToUndo]
  );

  // Compute the color value for the color input
  const currentColor =
    selectedNodeId && nodes.find((n) => n.id === selectedNodeId)
      ? nodes.find((n) => n.id === selectedNodeId)?.style?.background ||
        "#ffffff"
      : "#ffffff";

  const toggleBold = () => {
    if (!selectedNodeId) return;
    const newBold = !isBold;
    setIsBold(newBold);
    pushToUndo();
    setLocalNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: { ...node.style, fontWeight: newBold ? "bold" : "normal" },
            }
          : node
      )
    );
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: { ...node.style, fontWeight: newBold ? "bold" : "normal" },
            }
          : node
      )
    );
  };

  const toggleItalic = () => {
    if (!selectedNodeId) return;
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    pushToUndo();
    setLocalNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: {
                ...node.style,
                fontStyle: newItalic ? "italic" : "normal",
              },
            }
          : node
      )
    );
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: {
                ...node.style,
                fontStyle: newItalic ? "italic" : "normal",
              },
            }
          : node
      )
    );
  };

  const toggleUnderline = () => {
    if (!selectedNodeId) return;
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    pushToUndo();
    setLocalNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: {
                ...node.style,
                textDecoration: newUnderline ? "underline" : "none",
              },
            }
          : node
      )
    );
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              style: {
                ...node.style,
                textDecoration: newUnderline ? "underline" : "none",
              },
            }
          : node
      )
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header row, fixed height */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <select
          disabled={!selectedNodeId}
          value={fontFamily}
          onChange={(e) => {
            const newFont = e.target.value;
            if (!selectedNodeId) return;
            setFontFamily(newFont);
            pushToUndo();
            setLocalNodes((nds) =>
              nds.map((node) =>
                node.id === selectedNodeId
                  ? { ...node, style: { ...node.style, fontFamily: newFont } }
                  : node
              )
            );
            setNodes((nds) =>
              nds.map((node) =>
                node.id === selectedNodeId
                  ? { ...node, style: { ...node.style, fontFamily: newFont } }
                  : node
              )
            );
          }}
        >
          <option value="">Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>

        {/* Font Size select */}
        <select
          disabled={!selectedNodeId}
          value={fontSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            if (!selectedNodeId) return;
            setFontSize(newSize);
            pushToUndo();
            setLocalNodes((nds) =>
              nds.map((node) =>
                node.id === selectedNodeId
                  ? { ...node, style: { ...node.style, fontSize: newSize } }
                  : node
              )
            );
            setNodes((nds) =>
              nds.map((node) =>
                node.id === selectedNodeId
                  ? { ...node, style: { ...node.style, fontSize: newSize } }
                  : node
              )
            );
          }}
        >
          {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>

        <button
          onClick={toggleBold}
          disabled={!selectedNodeId}
          style={{ fontWeight: isBold ? "bold" : "normal" }}
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          disabled={!selectedNodeId}
          style={{ fontStyle: isItalic ? "italic" : "normal" }}
        >
          I
        </button>
        <button
          onClick={toggleUnderline}
          disabled={!selectedNodeId}
          style={{ textDecoration: isUnderline ? "underline" : "none" }}
        >
          U
        </button>

        <input
          type="text"
          placeholder="Enter workflow name..."
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="border px-2 py-1 rounded w-64"
        />
        {/* <input
          type="color"
          value={currentColor}
          disabled={!selectedNodeId}
          onChange={handleFillColorChange}
          className="border w-8 h-8 cursor-pointer"
        />
        <div className="flex gap-1">
          {PREDEFINED_COLORS.map((c) => (
            <button
              key={c}
              style={{
                background: c,
                width: 22,
                height: 22,
                border:
                  currentColor === c ? "2px solid #333" : "1px solid #bbb",
                borderRadius: 3,
                cursor: selectedNodeId ? "pointer" : "not-allowed",
              }}
              disabled={!selectedNodeId}
              onClick={() => {
                if (!selectedNodeId) return;
                pushToUndo();
                setLocalNodes((nds) =>
                  nds.map((node) =>
                    node.id === selectedNodeId
                      ? { ...node, style: { ...node.style, background: c } }
                      : node
                  )
                );
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === selectedNodeId
                      ? { ...node, style: { ...node.style, background: c } }
                      : node
                  )
                );
              }}
              title={c}
            />
          ))}
        </div> */}
        {/* Combined Color Selector */}
        <div className="flex items-center gap-2">
          {/* Custom Color Picker */}
          <input
            type="color"
            value={currentColor}
            disabled={!selectedNodeId}
            onChange={handleFillColorChange}
            className="border w-8 h-8 cursor-pointer"
          />

          {/* Predefined Color Swatches */}
          <div className="flex gap-1">
            {PREDEFINED_COLORS.map((c) => (
              <button
                key={c}
                style={{
                  background: c,
                  width: 22,
                  height: 22,
                  border:
                    currentColor === c ? "2px solid #333" : "1px solid #bbb",
                  borderRadius: 3,
                  cursor: selectedNodeId ? "pointer" : "not-allowed",
                }}
                disabled={!selectedNodeId}
                onClick={() => {
                  if (!selectedNodeId) return;
                  pushToUndo();

                  // update both local + store nodes
                  setLocalNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNodeId
                        ? { ...node, style: { ...node.style, background: c } }
                        : node
                    )
                  );
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNodeId
                        ? { ...node, style: { ...node.style, background: c } }
                        : node
                    )
                  );
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleUndo}
          className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Redo
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-600"
        >
          Load
        </button>
      </div>

      {/* Flow area grows to fill rest */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDragStart={handleNodeDragStart}
          onNodeClick={onNodeClick}
          fitView
        >
          <MiniMap position="bottom-right" />
          <Controls position="bottom-left" className="mt-12" />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}
