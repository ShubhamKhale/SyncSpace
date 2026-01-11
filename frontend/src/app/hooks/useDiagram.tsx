import {
  Edge,
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
} from "@xyflow/react";
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

export const useDiagram = () => {
  const useReactFlow = useReactFlowHook;
  const {
    screenToFlowPosition,
    setNodes,
    setEdges,
    getEdges,
    getEdge,
    getNodes,
  } = useReactFlow();
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo();
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const connectingNodeId = useRef(null);
  const {
    HelperLines,
    handleHelperLines,
    helperLineHorizontal,
    helperLineVertical,
  } = useHelperLines();
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

  const updateSelectedNodesFontSize = useCallback(
    (fontSize: number) => {
      takeSnapshot();
      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  fontSize,
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );

  const updateSelectedNodesFontFamily = useCallback(
    (fontFamily: string) => {
      takeSnapshot();
      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  fontFamily,
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );

  const updateSelectedNodesTextColor = useCallback(
    (textColor: string | null) => {
      takeSnapshot();

      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  textColor, 
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );

  const updateSelectedNodesFillColor = useCallback(
    (fillColor: string | null) => {
      takeSnapshot();

      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  fillColor, 
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );

  const updateSelectedEdgesStrokeWidth = useCallback(
    (strokeWidth: number) => {
      takeSnapshot();
  
      setEdges((edges) =>
        edges.map((edge) =>
          edge.selected
            ? {
                ...edge,
                style: {
                  ...edge.style,
                  strokeWidth,
                },
              }
            : edge
        )
      );
    },
    [setEdges, takeSnapshot]
  );

  const updateSelectedNodesStrokeWidth = useCallback(
    (strokeWidth: number) => {
      takeSnapshot();
  
      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  strokeWidth,
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );
  
  

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCopy = (event.ctrlKey || event.metaKey) && event.key === "c";
      const isPaste = (event.ctrlKey || event.metaKey) && event.key === "v";

      if (isCopy) {
        event.preventDefault();
        copySelection();
      }

      if (isPaste) {
        event.preventDefault();
        pasteSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [copySelection, pasteSelection]);

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

  const uploadJson = (jsonString: string) => {
    const diagramData = JSON.parse(jsonString);
    if (diagramData.nodes && diagramData.edges) {
      setNodes(diagramData.nodes);
      setEdges(diagramData.edges);
    } else {
      console.error(
        'Invalid JSON format. Expected an object with "nodes" and "edges" arrays.'
      );
    }
  };

  const onDrop: DragEventHandler<HTMLDivElement> = (evt) => {
    takeSnapshot();
    evt.preventDefault();
    const type = evt.dataTransfer.getData("application/reactflow");

    const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });

    const newNode = {
      id: Date.now().toString(),
      type: "shape",
      position,
      style: { width: 100, height: 100 },
      data: {
        type,
        color: "#000000",
        text: "",
        textColor: "#000000",
        fillColor: "#ffffff",
        placeholder: true,
      },

      selected: true,
    };

    setNodes((nodes) =>
      nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
    );
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nodes) => {
        const updated = applyNodeChanges(changes, nodes);

        return updated.map((node) => ({
          ...node,
          data: {
            ...node.data,
            width: node.width,
            height: node.height,
          },
        }));
      });

      const debouncedFunction = debounce(() => {
        handleHelperLines(changes, getNodes());
      }, 1);

      debouncedFunction();
    },
    [setNodes, getNodes, handleHelperLines]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      takeSnapshot();
      const { connectionLinePath } = useAppStore.getState();
      const edge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: "arrow",
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
            color: "#000000",
            textColor: "#000000",
            fillColor: "#ffffff",
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

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent>, edge: Edge) => {
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
    (type: "straight" | "step" | "smoothstep" | "bezier" | "arrow") => {
      takeSnapshot();

      setEdges((edges) =>
        edges.map((edge) =>
          edge.selected
            ? {
                ...edge,
                type,
              }
            : edge
        )
      );
    },
    [setEdges, takeSnapshot]
  );

  const toggleNodeStyle = useCallback(
    (key: string, onValue: any, offValue: any) => {
      takeSnapshot();
      setNodes((nodes) =>
        nodes.map((node) =>
          node.selected
            ? {
                ...node,
                data: {
                  ...node.data,
                  [key]: node.data?.[key] === onValue ? offValue : onValue,
                },
              }
            : node
        )
      );
    },
    [setNodes, takeSnapshot]
  );

  return {
    onDragOver,
    onDrop,
    onNodesChange,
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
    updateSelectedNodesFontSize,
    updateSelectedNodesFontFamily,
    updateSelectedNodesTextColor,
    updateSelectedNodesFillColor,
    updateSelectedEdgesStrokeWidth,
    updateSelectedNodesStrokeWidth,
    toggleNodeStyle,
  };
};
