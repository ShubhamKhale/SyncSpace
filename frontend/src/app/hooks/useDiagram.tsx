import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesDelete,
  OnNodeDrag,
  OnNodesDelete,
  SelectionDragHandler,
  addEdge,
  useReactFlow as useReactFlowHook,
  useStore,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { shallow } from "zustand/shallow";
import {
  DragEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useUndoRedo from "./useUndoRedo";
import { debounce } from "lodash";
import { useHelperLines } from "./useHelperLines";
import { useAppStore } from "../components/flow/store";
import { DEFAULT_ALGORITHM } from "../components/flow/edges/EditableEdge/constants";
import { ControlPointData } from "../components/flow/edges/EditableEdge";
import { MarkerDefinition } from "../components/flow/edges/MarkerDefinition";
import { apiFetch } from "@/lib/api";

export const useDiagram = (opts?: { saveKey?: string; boardId?: string; flowId?: string; initialTitle?: string }) => {
  const effectiveKey = opts?.saveKey ?? "syncspace-diagram";
  const boardId = opts?.boardId;
  const flowId = opts?.flowId;
  const initialTitle = opts?.initialTitle;
  const useReactFlow = useReactFlowHook;
  const {
    screenToFlowPosition,
    setNodes,
    setEdges,
    getEdges,
    getEdge,
    getNodes,
    fitView,
  } = useReactFlow();
  const { undo, redo, canUndo, canRedo, takeSnapshot, getSnapshotJson } = useUndoRedo();
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const connectingNodeId = useRef(null);
  const selectedNodes = useStore((state) => state.nodes.filter((n) => n.selected), shallow);
  const selectedEdges = useStore((state) => state.edges.filter((e) => e.selected), shallow);
  const {
    HelperLines,
    handleHelperLines,
    helperLineHorizontal,
    helperLineVertical,
  } = useHelperLines();

  // Diagram title — persisted in localStorage
  const [diagramTitle, setDiagramTitle] = useState<string>(() => {
    if (typeof window === "undefined") return initialTitle ?? "Untitled Diagram";
    const saved = localStorage.getItem(effectiveKey);
    if (saved) {
      try { return JSON.parse(saved).title || initialTitle || "Untitled Diagram"; } catch {}
    }
    return initialTitle ?? "Untitled Diagram";
  });

  const onDragOver: DragEventHandler<HTMLDivElement> = (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
  };
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  const selectAllNodes = () => {
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: true })));
    setEdges((edges) => edges.map((edge) => ({ ...edge, selected: true })));
  };

  const deselectAll = () => {
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
    setEdges((edges) => edges.map((edge) => ({ ...edge, selected: false })));
  };

  // ── Persist: localStorage + API (when boardId/flowId present) ────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDiagram = useCallback(() => {
    try {
      const nodes = getNodes();
      const edges = getEdges();
      const data = { title: diagramTitle, nodes, edges };
      localStorage.setItem(effectiveKey, JSON.stringify(data));
      if (boardId && flowId) {
        apiFetch(`/api/boards/${boardId}/flows/${flowId}/diagram`, {
          method: "PUT",
          body: JSON.stringify(data),
        }).catch((e) => console.error("Auto-save failed", e));
      }
    } catch (e) {
      console.error("Failed to save diagram", e);
    }
  }, [getNodes, getEdges, diagramTitle, effectiveKey, boardId, flowId]);

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(persistDiagram, 2000);
  }, [persistDiagram]);

  // Keep backward-compat alias for Menu.tsx manual save
  const saveToLocalStorage = persistDiagram;

  // ── Zoom to fit selection ──────────────────────────────────
  const fitToSelection = useCallback(() => {
    const selected = getNodes().filter((n) => n.selected);
    if (!selected.length) {
      fitView({ padding: 0.2, duration: 300 });
      return;
    }
    fitView({ nodes: selected, padding: 0.2, duration: 300 });
  }, [getNodes, fitView]);

  const fitToNode = useCallback(
    (node: Node) => {
      fitView({ nodes: [node], padding: 0.2, duration: 500 });
    },
    [fitView]
  );

  // ── Group selected nodes ───────────────────────────────────
  const groupSelectedNodes = useCallback(() => {
    const selected = getNodes().filter((n) => n.selected && n.type !== "group");
    if (selected.length < 2) return;
    takeSnapshot();

    const PAD = 24;
    const minX = Math.min(...selected.map((n) => n.position.x)) - PAD;
    const minY = Math.min(...selected.map((n) => n.position.y)) - PAD;
    const maxX = Math.max(...selected.map((n) => n.position.x + ((n.measured?.width as number) || 100))) + PAD;
    const maxY = Math.max(...selected.map((n) => n.position.y + ((n.measured?.height as number) || 100))) + PAD;

    const groupNode = {
      id: window.crypto.randomUUID(),
      type: "group",
      position: { x: minX, y: minY },
      style: { width: maxX - minX, height: maxY - minY },
      data: { label: "Group" },
      selectable: true,
      selected: false,
    };

    setNodes((nodes) => [groupNode, ...nodes.map((n) => ({ ...n, selected: false }))]);
  }, [getNodes, setNodes, takeSnapshot]);

  const clipboardRef = useRef<{
    nodes: any[];
    edges: any[];
  } | null>(null);

  const generatedId = () => window.crypto.randomUUID();

  const copySelection = useCallback(() => {
    const nodes = getNodes().filter((n) => n.selected);
    if (!nodes.length) return;

    const nodeIds = new Set(nodes.map((n) => n.id));

    const edges = getEdges().filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    clipboardRef.current = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
  }, [getNodes, getEdges]);

  const pasteSelection = useCallback(() => {
    if (!clipboardRef.current) return;

    takeSnapshot();

    const OFFSET = 40;
    const idMap = new Map<string, string>();

    const newNodes = clipboardRef.current.nodes.map((node) => {
      const newId = generatedId();
      idMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + OFFSET,
          y: node.position.y + OFFSET,
        },
        selected: true,
      };
    });

    const newEdges = clipboardRef.current.edges.map((edge) => ({
      ...edge,
      id: generatedId(),
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      selected: true,
    }));

    setNodes((nodes) =>
      nodes.map((n) => ({ ...n, selected: false })).concat(newNodes)
    );

    setEdges((edges) =>
      edges.map((e) => ({ ...e, selected: false })).concat(newEdges)
    );
  }, [setNodes, setEdges, takeSnapshot]);

  const updateNodesStyle = useCallback(
    (style: Record<string, any>) => {
      // Live check via getNodes() — never stale, avoids wasted snapshots
      const hasTarget = getNodes().some((n) => n.selected && !n.data?.locked);
      if (!hasTarget) return;
      takeSnapshot();
      const { backgroundColor, ...rest } = style;
      const dataUpdate: Record<string, any> = { ...rest };
      if (backgroundColor !== undefined) dataUpdate.fill = backgroundColor;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (!node.selected || node.data?.locked) return node;
          // StickyNote uses `data.color` for background, not `data.fill`
          if (node.type === "sticky-note" && dataUpdate.fill !== undefined) {
            const { fill, ...stickyRest } = dataUpdate;
            return { ...node, data: { ...node.data, ...stickyRest, color: fill } };
          }
          return { ...node, data: { ...node.data, ...dataUpdate } };
        })
      );
    },
    [getNodes, setNodes, takeSnapshot]
  );

  const toggleNodeLock = useCallback((nodeId: string) => {
    takeSnapshot();
    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n;
      const locked = !n.data.locked;
      return {
        ...n,
        draggable: !locked,
        deletable: !locked,
        data: {
          ...n.data,
          locked,
          // Snapshot the position when locking so we can restore it on any change
          lockedPosition: locked ? { x: n.position.x, y: n.position.y } : undefined,
        },
      };
    }));
  }, [setNodes, takeSnapshot]);

  const updateEdgesStyle = useCallback(
    (style: Record<string, any>) => {
      const hasTarget = getEdges().some((e) => e.selected && !(e.data as any)?.locked);
      if (!hasTarget) return;
      takeSnapshot();
      setEdges((edges) =>
        edges.map((edge) =>
          edge.selected && !(edge.data as any)?.locked
            ? { ...edge, style: { ...edge.style, ...style } }
            : edge
        )
      );
    },
    [getEdges, setEdges, takeSnapshot]
  );

  const toggleSelectionLock = useCallback(() => {
    takeSnapshot();
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const selNodes = currentNodes.filter((n) => n.selected);
    const selEdges = currentEdges.filter((e) => e.selected);
    if (!selNodes.length && !selEdges.length) return;

    const shouldLock =
      selNodes.some((n) => !n.data?.locked) ||
      selEdges.some((e) => !(e.data as any)?.locked);

    setNodes((nds) =>
      nds.map((n) => {
        if (!n.selected) return n;
        return {
          ...n,
          draggable: !shouldLock,
          deletable: !shouldLock,
          data: {
            ...n.data,
            locked: shouldLock,
            lockedPosition: shouldLock ? { x: n.position.x, y: n.position.y } : undefined,
          },
        };
      })
    );

    setEdges((eds) =>
      eds.map((e) => {
        if (!e.selected) return e;
        return {
          ...e,
          deletable: !shouldLock,
          data: { ...(e.data as object), locked: shouldLock },
        };
      })
    );

    if (shouldLock) {
      setEditingEdgeId((current) =>
        selEdges.some((e) => e.id === current) ? null : current
      );
    }
  }, [getNodes, getEdges, setNodes, setEdges, takeSnapshot, setEditingEdgeId]);

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      const isCopy = (event.ctrlKey || event.metaKey) && event.key === "c";
      const isPaste = (event.ctrlKey || event.metaKey) && event.key === "v";

      if (isCopy) { event.preventDefault(); copySelection(); }
      if (isPaste) { event.preventDefault(); pasteSelection(); }

      // Ctrl+B/I/U = toggle bold/italic/underline on selected nodes (skip when typing in input)
      if (!isInput && (event.ctrlKey || event.metaKey)) {
        if (event.key === "b") {
          event.preventDefault();
          const nodes = getNodes().filter((n) => n.selected);
          if (nodes.length) {
            const isBold = nodes[0].data?.fontWeight === "bold";
            updateNodesStyle({ fontWeight: isBold ? "normal" : "bold" });
          }
        }
        if (event.key === "i") {
          event.preventDefault();
          const nodes = getNodes().filter((n) => n.selected);
          if (nodes.length) {
            const isItalic = nodes[0].data?.fontStyle === "italic";
            updateNodesStyle({ fontStyle: isItalic ? "normal" : "italic" });
          }
        }
        if (event.key === "u") {
          event.preventDefault();
          const nodes = getNodes().filter((n) => n.selected);
          if (nodes.length) {
            const isUnderline = nodes[0].data?.textDecoration === "underline";
            updateNodesStyle({ textDecoration: isUnderline ? "none" : "underline" });
          }
        }
      }

      // G = group selection (skip when typing)
      if (!isInput && event.key === "g" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        groupSelectedNodes();
      }

      // Shift+F = zoom to fit selection
      if (event.shiftKey && event.key === "F") {
        event.preventDefault();
        fitToSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copySelection, pasteSelection, groupSelectedNodes, fitToSelection, updateNodesStyle, getNodes]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "a") {
        event.preventDefault();
        selectAllNodes();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /**
   * Replaces the whole diagram. Pass `{ fitView: true }` when the user loads a
   * new diagram (server load, template, AI, file import) so it's framed on
   * screen; leave it off for live collaborator updates, which must not move
   * the viewer's camera.
   */
  const uploadJson = (jsonString: string, opts?: { fitView?: boolean }) => {
    try {
      const diagramData = JSON.parse(jsonString);
      if (diagramData && Array.isArray(diagramData.nodes) && Array.isArray(diagramData.edges)) {
        setNodes(diagramData.nodes);
        setEdges(diagramData.edges);
        if (diagramData.title) setDiagramTitle(diagramData.title);
        // React Flow defers this until the new nodes are measured.
        if (opts?.fitView && diagramData.nodes.length > 0) {
          fitView({ padding: 0.2, duration: 300 });
        }
      } else {
        console.error('Invalid diagram JSON: expected { nodes: [], edges: [] }');
      }
    } catch (e) {
      console.error("Failed to parse diagram JSON", e);
    }
  };

  // this function is called when a node from the sidebar is dropped onto the react flow pane
  const onDrop: DragEventHandler<HTMLDivElement> = (evt) => {
    evt.preventDefault();

    // Handle image files dropped from filesystem
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        takeSnapshot();
        const position = screenToFlowPosition({
          x: evt.clientX,
          y: evt.clientY,
        });
        imageFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target?.result as string;
            const img = new window.Image();
            img.onload = () => {
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              const nodeWidth = Math.min(300, img.naturalWidth);
              const nodeHeight = nodeWidth / aspectRatio;
              const newNode = {
                id: `${Date.now()}-img-${index}`,
                type: "image" as const,
                position: {
                  x: position.x + index * 20,
                  y: position.y + index * 20,
                },
                style: { width: nodeWidth, height: nodeHeight },
                data: { src, width: nodeWidth, height: nodeHeight, aspectRatio },
                selected: true,
              };
              setNodes((nodes) =>
                nodes
                  .map((n) => ({ ...n, selected: false }))
                  .concat([newNode])
              );
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        });
        return;
      }
    }

    takeSnapshot();
    const type = evt.dataTransfer.getData("application/reactflow");

    const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });

    // Handle image from sidebar upload
    if (type === "image") {
      const src = evt.dataTransfer.getData("image-src");
      const aspectRatio = parseFloat(
        evt.dataTransfer.getData("image-aspect-ratio") || "1"
      );
      const nodeWidth = 200;
      const nodeHeight = nodeWidth / aspectRatio;
      const newNode = {
        id: Date.now().toString(),
        type: "image" as const,
        position,
        style: { width: nodeWidth, height: nodeHeight },
        data: { src, width: nodeWidth, height: nodeHeight, aspectRatio },
        selected: true,
      };
      setNodes((nodes) =>
        nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
      );
      return;
    }

    // Handle table node
    if (type === "table") {
      const defaultCells: string[][] = [
        ["Column A", "Column B", "Column C"],
        ["", "", ""],
        ["", "", ""],
      ];
      const newNode = {
        id: Date.now().toString(),
        type: "table" as const,
        position,
        style: { width: 300, height: 180 },
        data: {
          cells: defaultCells,
          hasHeader: true,
          headerBg: "#1e293b",
          borderColor: "#374151",
          width: 300,
          height: 180,
        },
        selected: true,
      };
      setNodes((nodes) =>
        nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
      );
      return;
    }

    const stickyColor = evt.dataTransfer.getData("sticky-note-color") || "#fef9c3";
    const newNode = {
      id: Date.now().toString(),
      type: type === "sticky-note" ? "sticky-note" : "shape",
      position,
      style: { width: 100, height: 100 },
      data: type === "sticky-note"
        ? { text: "", color: stickyColor }
        : { type, color: "#3F8AE2", text: "", placeholder: true },
      selected: true,
    };

    setNodes((nodes) =>
      nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
    );
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((currentNodes) => {
        const lockedIds = new Set(
          currentNodes.filter((n) => n.data?.locked).map((n) => n.id)
        );
        // Strip position/dimension changes for locked nodes
        const safeChanges = changes.filter((change) => {
          if (change.type === "position" || change.type === "dimensions") {
            return !lockedIds.has((change as any).id);
          }
          return true;
        });
        const updated = applyNodeChanges(safeChanges, currentNodes);
        return updated.map((node) => {
          // Force locked nodes back to their saved position on every change cycle.
          // ReactFlow (uncontrolled mode) may have moved them internally before
          // onNodesChange fires — this overrides that.
          if (node.data?.locked && node.data?.lockedPosition) {
            return {
              ...node,
              position: node.data.lockedPosition as { x: number; y: number },
              data: { ...node.data, width: node.width, height: node.height },
            };
          }
          return {
            ...node,
            data: { ...node.data, width: node.width, height: node.height },
          };
        });
      });

      const debouncedFunction = debounce(() => {
        handleHelperLines(changes, getNodes());
      }, 1);

      debouncedFunction();
      triggerAutoSave();
    },
    [setNodes, getNodes, handleHelperLines, triggerAutoSave]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      takeSnapshot();
      const { connectionLinePath } = useAppStore.getState();
      const edge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: "editable-edge",
        selected: true,
        animated: true,
        data: {
          algorithm: DEFAULT_ALGORITHM,
          points: connectionLinePath.map(
            (point, i) =>
              ({
                ...point,
                id: window.crypto.randomUUID(),
                prev: i === 0 ? undefined : connectionLinePath[i - 1],
                active: true,
              } as ControlPointData)
          ),
        },
      };
      setEdges((edges) => addEdge({ ...edge, type: "editable-edge" }, edges));
    },
    [setEdges, takeSnapshot]
  );

  const onConnectStart = useCallback((_: any, { nodeId }: any) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId.current) return;
      takeSnapshot();
      event.preventDefault();
      const targetIsPane = (event.target as Element)?.classList.contains(
        "react-flow__pane"
      );

      const targetIsHandle = (event.target as Element)?.classList.contains(
        "react-flow__handle"
      );
      if (targetIsPane && !targetIsHandle) {
        const position = screenToFlowPosition({
          x: "clientX" in event ? event.clientX : event.touches[0].clientX,
          y: "clientY" in event ? event.clientY : event.touches[0].clientY,
        });

        const newNode = {
          id: Date.now().toString(),
          type: "shape",
          position,
          style: { width: 100, height: 100 },
          data: {
            type: "rectangle",
            color: "#3F8AE2",
          },
          selected: true,
        };

        setNodes((nodes) =>
          nodes.map((n) => ({ ...n, selected: false })).concat([{ ...newNode }])
        );

        const { connectionLinePath } = useAppStore.getState();

        const edge = {
          id: `${Date.now()}-${connectingNodeId.current}-${newNode.id}`,
          source: connectingNodeId.current,
          target: newNode.id,
          type: "editable-edge",
          selected: false,
          data: {
            algorithm: DEFAULT_ALGORITHM,
            points: connectionLinePath.map(
              (point, i) =>
                ({
                  ...point,
                  id: window.crypto.randomUUID(),
                  prev: i === 0 ? undefined : connectionLinePath[i - 1],
                  active: true,
                } as ControlPointData)
            ),
          },
        };
        setEdges((edges) => addEdge({ ...edge, type: "editable-edge" }, edges));
        setSelectedNodeId(newNode.id);
      }
    },
    [screenToFlowPosition, setEdges, setNodes, takeSnapshot]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((currentEdges) => {
        const lockedIds = new Set(
          currentEdges.filter((e) => (e.data as any)?.locked).map((e) => e.id)
        );
        const safeChanges = changes.filter((change) =>
          change.type === "remove" ? !lockedIds.has(change.id) : true
        );
        return applyEdgeChanges(safeChanges, currentEdges);
      });
      triggerAutoSave();
    },
    [setEdges, triggerAutoSave]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent>, edge: Edge) => {
      if ((edge.data as any)?.locked) return;
      setEditingEdgeId(edge.id);
    },
    []
  );

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete: OnNodesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    takeSnapshot();
  }, [takeSnapshot]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(undefined);
    setEditingEdgeId(null);
  }, []);

  const onNodeClick = useCallback((_event: any) => {
    setEditingEdgeId(null);
  }, []);

  const Markers = () => {
    return getEdges().map((edge, index) => {
      return (
        <MarkerDefinition
          key={index}
          id={`marker-${edge.id}`}
          color={`${edge.style?.stroke || "#a5a4a5"}`}
        />
      );
    });
  };

  const updateSelectedEdgesType = useCallback(
    (type: "straight" | "step" | "smoothstep" | "bezier") => {
      takeSnapshot();
      setEdges((edges) =>
        edges.map((edge) =>
          edge.selected ? { ...edge, type } : edge
        )
      );
    },
    [setEdges, takeSnapshot]
  );

  return {
    onDragOver,
    onDrop,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    selectedNodeId,
    setSelectedNodeId,
    HelperLines,
    helperLineHorizontal,
    helperLineVertical,
    onNodeDragStart,
    onSelectionDragStart,
    onNodesDelete,
    onEdgesDelete,
    undo,
    redo,
    canRedo,
    canUndo,
    onEdgeClick,
    editingEdgeId,
    setEditingEdgeId,
    onPaneClick,
    onNodeClick,
    useReactFlow,
    Markers,
    getEdge,
    setEdges,
    useStore,
    deselectAll,
    uploadJson,
    updateSelectedEdgesType,
    updateNodesStyle,
    updateEdgesStyle,
    selectedNodes,
    selectedEdges,
    saveToLocalStorage,
    triggerAutoSave,
    fitToSelection,
    groupSelectedNodes,
    diagramTitle,
    setDiagramTitle,
    toggleNodeLock,
    toggleSelectionLock,
    fitToNode,
    getNodes,
    takeSnapshot,
  };
};
