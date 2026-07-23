"use client";
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  Panel,
  EdgeTypes,
  EdgeProps,
  StraightEdge,
  StepEdge,
  SmoothStepEdge,
  BezierEdge,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./nodeStyles.css";
import MiniMapNode from "./minimap-node";
import { CornerUpLeft, CornerUpRight } from "react-feather";
import {
  PanelGroup,
  PanelResizeHandle,
  Panel as ResizablePanel,
} from "react-resizable-panels";
const JsonViewer = dynamic(() => import("./JsonViewer/JsonViewer"), {
  ssr: false,
});
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { EditableEdge } from "./edges/EditableEdge";
import EdgeToolbar from "./EdgeToolbar/EdgeToolbar";
import { ConnectionLine } from "./edges/ConnectionLine";
import defaultDiagramJson from "../flow/json-diagrams/DiagramX.json";
import { About } from "./About";
import ShapeNode from "./nodes/ShapeNode";
import StickyNoteNode from "./nodes/StickyNoteNode";
import GroupNode from "./nodes/GroupNode";
import ImageNode from "./nodes/ImageNode";
import TableNode from "./nodes/TableNode";
import { PresentationMode } from "./PresentationMode";
import { TemplateModal } from "./templates/TemplateModal";
import { useTemplateStore } from "@/app/store/useTemplateStore";
import { CursorOverlay } from "./CursorOverlay";
import { useDiagram } from "@/app/hooks/useDiagram";
import { useFlowPresence } from "@/app/hooks/useFlowPresence";
import useUndoRedo from "@/app/hooks/useUndoRedo";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useTheme } from "@/app/hooks/useTheme";
import Sidebar from "./Sidebar/Sidebar";
import { FlowHeader } from "./FlowHeader/FlowHeader";
import { useBoardFlowsStore } from "@/app/store/useBoardFlowsStore";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { HelpCircle, Maximize2, Layers, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorPicker } from "./ColorPicker";
import { FillColorPicker } from "./FillColorPicker";

const ROW_THRESHOLD = 80;
function computeSortedSlides(nodes: Node[]): Node[] {
  return [...nodes.filter((n) => n.type !== "group")].sort((a, b) => {
    const dy = a.position.y - b.position.y;
    if (Math.abs(dy) < ROW_THRESHOLD) return a.position.x - b.position.x;
    return dy;
  });
}

function MobileFormattingToolbar({ diagram }: { diagram: ReturnType<typeof useDiagram> }) {
  const firstNodeData = (diagram.selectedNodes?.[0]?.data ?? {}) as Record<string, unknown>;
  const isBold = firstNodeData.fontWeight === "bold";
  const isItalic = firstNodeData.fontStyle === "italic";
  const isUnderline = firstNodeData.textDecoration === "underline";
  const activeTextAlign = (firstNodeData.textAlign as string) || "center";

  const applyStyle = (style: Record<string, unknown>) => {
    diagram.updateNodesStyle(style);
  };

  const btn = (active: boolean) =>
    `p-2.5 rounded-lg transition-colors ${active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"}`;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-16 left-3 right-3 z-30 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-2xl shadow-2xl px-2 py-1.5 flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
    >
      {/* B / I / U */}
      <button onClick={() => applyStyle({ fontWeight: isBold ? "normal" : "bold" })} className={btn(isBold)} title="Bold">
        <Bold size={16} />
      </button>
      <button onClick={() => applyStyle({ fontStyle: isItalic ? "normal" : "italic" })} className={btn(isItalic)} title="Italic">
        <Italic size={16} />
      </button>
      <button onClick={() => applyStyle({ textDecoration: isUnderline ? "none" : "underline" })} className={btn(isUnderline)} title="Underline">
        <Underline size={16} />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-0.5 flex-shrink-0" />

      {/* Colors */}
      <ColorPicker onColorSelect={(color: string) => applyStyle({ color })} />
      <FillColorPicker onColorSelect={(color: string) => applyStyle({ backgroundColor: color })} />

      <div className="w-px h-6 bg-gray-700 mx-0.5 flex-shrink-0" />

      {/* Alignment */}
      <button onClick={() => applyStyle({ textAlign: "left" })} className={btn(activeTextAlign === "left")} title="Align Left">
        <AlignLeft size={16} />
      </button>
      <button onClick={() => applyStyle({ textAlign: "center" })} className={btn(activeTextAlign === "center")} title="Align Center">
        <AlignCenter size={16} />
      </button>
      <button onClick={() => applyStyle({ textAlign: "right" })} className={btn(activeTextAlign === "right")} title="Align Right">
        <AlignRight size={16} />
      </button>
    </motion.div>
  );
}

const nodeTypes: NodeTypes = {
  shape: ShapeNode,
  "sticky-note": StickyNoteNode,
  group: GroupNode,
  image: ImageNode,
  table: TableNode,
};

interface FlowProps { flowId?: string; boardId?: string; }

const Flow = ({ flowId, boardId }: FlowProps) => {
  const saveKey = flowId ? `syncspace-flow-${flowId}` : "syncspace-diagram";

  // Resolve flow name: Zustand store (fast, set by gallery page) → localStorage metadata fallback
  const storeFlows = useBoardFlowsStore((s) => s.flows);
  const flowName = useMemo(() => {
    if (!boardId || !flowId) return undefined;
    const storeMatch = storeFlows.find((f) => f.id === flowId);
    if (storeMatch?.name) return storeMatch.name;
    if (typeof window === "undefined") return undefined;
    try {
      const meta = JSON.parse(localStorage.getItem(`syncspace-flows-${boardId}`) ?? "[]") as Array<{ id: string; name: string }>;
      return meta.find((f) => f.id === flowId)?.name;
    } catch { return undefined; }
  }, [boardId, flowId, storeFlows]);

  const diagram = useDiagram({ saveKey, boardId, flowId, initialTitle: flowName });
  const uploadJsonRef = useRef(diagram.uploadJson);
  uploadJsonRef.current = diagram.uploadJson;
  const getNodesRef = useRef(diagram.getNodes);
  getNodesRef.current = diagram.getNodes;

  // Sync diagram title back to flow metadata when user renames inside the editor.
  const renameFlowInStore = useBoardFlowsStore((s) => s.renameFlow);
  const prevTitleRef = useRef<string | null>(null);
  useEffect(() => {
    const title = diagram.diagramTitle;
    if (!boardId || !flowId || !title) return;
    if (prevTitleRef.current === null) {
      prevTitleRef.current = title;
      return;
    }
    if (prevTitleRef.current !== title) {
      prevTitleRef.current = title;
      renameFlowInStore(boardId, flowId, title);
    }
  }, [diagram.diagramTitle, boardId, flowId, renameFlowInStore]);

  const {
    participants,
    cursorsRef,
    sendCursorMove,
    myId,
    presenter,
    broadcastPresentStart,
    broadcastPresentStop,
    broadcastPresentSlide,
  } = useFlowPresence(
    boardId ?? "",
    flowId ?? "",
    {
      onDiagramUpdated: useCallback(
        ({ nodes, edges }: { nodes: unknown[]; edges: unknown[] }) => {
          uploadJsonRef.current(JSON.stringify({ nodes, edges }));
        },
        []
      ),
      onPresentationSlide: useCallback((nodeId: string) => {
        const node = getNodesRef.current().find((n) => n.id === nodeId);
        if (node) uploadJsonRef.current && diagram.fitToNode(node);
      }, [diagram]),
      onPresentationStopped: useCallback(() => {
        // presenter state clears in hook; nothing extra needed here
      }, []),
    }
  );

  // true when someone else is presenting and we're a viewer
  const isViewingPresentation = presenter !== null && presenter.id !== myId;
  const { getSnapshotJson, takeSnapshot } = useUndoRedo();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [isShapesSidebarOpen, setIsShapesSidebarOpen] = useState<boolean>(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [width] = useWindowSize();
  const isMobile = width > 0 && width < 768;
  const themeHook = useTheme();

  // Auto-collapse shapes sidebar on mobile
  useEffect(() => {
    if (isMobile) setIsShapesSidebarOpen(false);
    else setIsShapesSidebarOpen(true);
  }, [isMobile]);

  // Sync initial diagram: localStorage cache (board flows) or default (standalone)
  const initialDiagram = useMemo(() => {
    if (typeof window === "undefined") return defaultDiagramJson;
    if (boardId && flowId) {
      const cached = localStorage.getItem(saveKey);
      if (cached) { try { return JSON.parse(cached); } catch {} }
      return { title: "Untitled Diagram", nodes: [], edges: [] };
    }
    const saved = localStorage.getItem(saveKey);
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return defaultDiagramJson;
  }, [saveKey, boardId, flowId]);

  // Async API load — overwrites cached/empty initial state once server responds
  useEffect(() => {
    if (!boardId || !flowId) return;
    import("@/lib/api").then(({ apiFetch }) => {
      apiFetch<{ title: string; nodes: unknown[]; edges: unknown[] }>(
        `/api/boards/${boardId}/flows/${flowId}/diagram`
      )
        .then((data) => {
          if (data.nodes || data.edges) {
            diagram.uploadJson(JSON.stringify(data));
          }
        })
        .catch(() => {
          // localStorage fallback already shown — nothing more to do
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, flowId]);

  const getDefaultSize = (w: number) => (w < 1024 ? 33 : 20);

  const toggleRightSidebar = () => setIsRightSidebarOpen((v) => !v);
  const toggleLeftSidebar = () => setIsLeftSidebarOpen((v) => !v);

  const EditableEdgeWrapper = useCallback(
    (props: EdgeProps) => <EditableEdge {...props} useDiagram={diagram} />,
    [diagram]
  );

  const edgeTypes: EdgeTypes = {
    straight: StraightEdge,
    step: StepEdge,
    smoothstep: SmoothStepEdge,
    bezier: BezierEdge,
    "editable-edge": EditableEdgeWrapper,
  };

  const defaultEdgeOptions: DefaultEdgeOptions = {
    type: "editable-edge",
    style: { strokeWidth: 2, stroke: "#f59e0b" },
  };

  type CursorMode = "pan" | "select";
  const [cursorMode, setCursorMode] = useState<CursorMode>("pan");

  // ── Template store ───────────────────────────────────────────
  const templateStore = useTemplateStore();
  const loadRecentsFromStorage = useTemplateStore((s) => s.loadRecentsFromStorage);
  useEffect(() => { loadRecentsFromStorage(); }, [loadRecentsFromStorage]);

  // ── Presentation mode ────────────────────────────────────────
  const { getNodes: getRawNodes, screenToFlowPosition } = useReactFlow();

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      sendCursorMove(pos.x, pos.y);
    },
    [screenToFlowPosition, sendCursorMove]
  );
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [presentSlides, setPresentSlides] = useState<Node[]>([]);
  const [presentIndex, setPresentIndex] = useState(0);
  const presentSlidesRef = useRef<Node[]>([]);

  const handleEnterPresent = useCallback(() => {
    const slides = computeSortedSlides(getRawNodes());
    if (slides.length === 0) return;
    presentSlidesRef.current = slides;
    setPresentSlides(slides);
    setPresentIndex(0);
    setIsPresentMode(true);
    setTimeout(() => diagram.fitToNode(slides[0]), 0);
    const myName = participants.find((p) => p.id === myId)?.name ?? "Someone";
    broadcastPresentStart(myName);
    broadcastPresentSlide(slides[0].id, 0);
  }, [getRawNodes, diagram, participants, myId, broadcastPresentStart, broadcastPresentSlide]);

  const handleExitPresent = useCallback(() => {
    setIsPresentMode(false);
    setPresentSlides([]);
    setPresentIndex(0);
    presentSlidesRef.current = [];
    broadcastPresentStop();
  }, [broadcastPresentStop]);

  const handlePresentNext = useCallback(() => {
    setPresentIndex((i) => Math.min(i + 1, presentSlidesRef.current.length - 1));
  }, []);

  const handlePresentPrev = useCallback(() => {
    setPresentIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (!isPresentMode) return;
    const slides = presentSlidesRef.current;
    if (slides.length === 0) return;
    diagram.fitToNode(slides[presentIndex]);
    broadcastPresentSlide(slides[presentIndex].id, presentIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentIndex, isPresentMode]);

  // Ctrl+/ or ? opens keyboard shortcuts panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";
      if (isInput) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowShortcuts((v) => !v);
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setShowShortcuts((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <FlowHeader
        diagram={diagram}
        toggleRightSidebar={toggleRightSidebar}
        toggleLeftSidebar={toggleLeftSidebar}
        isRightSidebarOpen={isRightSidebarOpen}
        cursorMode={cursorMode}
        setCursorMode={setCursorMode}
        isPresentMode={isPresentMode}
        onEnterPresent={handleEnterPresent}
        onExitPresent={handleExitPresent}
        onOpenTemplates={templateStore.openModal}
        boardId={boardId}
        flowId={flowId}
        participants={participants}
      />

      <PanelGroup direction="horizontal">
        {isLeftSidebarOpen ? (
          <ResizablePanel
            order={1}
            className="bg-white dark:bg-black"
            defaultSize={getDefaultSize(width)}
            minSize={getDefaultSize(width)}
          >
            <About onClick={toggleLeftSidebar} />
          </ResizablePanel>
        ) : null}
        <PanelResizeHandle
          className={`w-1 cursor-col-resize ${
            isLeftSidebarOpen ? "bg-stone-600 visible" : "bg-transparent hidden"
          }`}
        />
        {!isMobile && isShapesSidebarOpen && !isViewingPresentation && (
          <ResizablePanel order={1} minSize={15} defaultSize={20}>
            <Sidebar />
          </ResizablePanel>
        )}
        {!isMobile && isShapesSidebarOpen && !isViewingPresentation && (
          <PanelResizeHandle className="w-1 cursor-col-resize bg-stone-600" />
        )}
        <ResizablePanel order={2}>
          <PanelGroup direction="horizontal">
            <ResizablePanel minSize={30} order={1}>
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
              {/* Viewer banner — shown to non-presenter when someone is presenting */}
              {isViewingPresentation && (
                <div style={{
                  position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
                  zIndex: 30, background: "#1e1b4b", border: "1px solid #4f46e5",
                  borderRadius: 10, padding: "7px 16px",
                  display: "flex", alignItems: "center", gap: 8, pointerEvents: "none",
                  boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#c7d2fe" }}>
                    {presenter?.name} is presenting — view only
                  </span>
                </div>
              )}
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

              <ReactFlow
                className={`${themeHook.theme || "light"} ${
                  isViewingPresentation ? "cursor-default" : cursorMode === "select" ? "cursor-default" : "cursor-grab"
                }`}
                onConnect={isViewingPresentation ? undefined : diagram.onConnect}
                onConnectStart={isViewingPresentation ? undefined : diagram.onConnectStart}
                connectionLineComponent={ConnectionLine}
                connectionRadius={80}
                proOptions={{ hideAttribution: true }}
                onPaneClick={diagram.onPaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultNodes={initialDiagram.nodes}
                defaultEdges={initialDiagram.edges}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                connectionMode={ConnectionMode.Loose}
                panOnDrag={!isPresentMode && !isViewingPresentation && cursorMode === "pan"}
                selectionOnDrag={false}
                panOnScroll={!isPresentMode && !isViewingPresentation && cursorMode === "pan"}
                zoomOnScroll={!isViewingPresentation}
                selectionKeyCode={null}
                onDrop={isViewingPresentation ? undefined : diagram.onDrop}
                snapToGrid={false}
                snapGrid={[10, 10]}
                onDragOver={isViewingPresentation ? undefined : diagram.onDragOver}
                zoomOnDoubleClick={false}
                nodesDraggable={!isViewingPresentation}
                nodesConnectable={!isViewingPresentation}
                elementsSelectable={!isViewingPresentation}
                onMouseMove={handleCanvasMouseMove}
                onNodesChange={diagram.onNodesChange}
                onEdgesChange={diagram.onEdgesChange}
                onNodeDragStart={diagram.onNodeDragStart}
                onSelectionDragStart={diagram.onSelectionDragStart}
                onNodesDelete={diagram.onNodesDelete}
                onNodeClick={diagram.onNodeClick}
                onEdgesDelete={diagram.onEdgesDelete}
                onEdgeClick={diagram.onEdgeClick}
                elevateEdgesOnSelect
                elevateNodesOnSelect
                maxZoom={10}
                minZoom={0.1}
                multiSelectionKeyCode={["Meta", "Control"]}
              >
                <Background
                  color="grey"
                  bgColor={themeHook.theme === "dark" ? "black" : "white"}
                />

                {diagram.editingEdgeId ? (
                  <Panel position="top-center">
                    <EdgeToolbar takeSnapshot={takeSnapshot} useDiagram={diagram} />
                  </Panel>
                ) : null}

                <Panel position="bottom-left">
                  <div className="mb-2 ml-1">
                    <Controls className="flex flex-col items-start" showInteractive={false}>
                      <ControlButton onClick={() => diagram.undo()} title="Undo (Ctrl+Z)">
                        <CornerUpLeft fillOpacity={0} />
                      </ControlButton>
                      <ControlButton onClick={() => diagram.redo()} title="Redo (Ctrl+Shift+Z)">
                        <CornerUpRight fillOpacity={0} />
                      </ControlButton>
                      <ControlButton onClick={() => diagram.fitToSelection()} title="Zoom to fit selection (Shift+F)">
                        <Maximize2 size={14} />
                      </ControlButton>
                      {!isMobile && (
                        <ControlButton onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (?)">
                          <HelpCircle size={14} />
                        </ControlButton>
                      )}
                    </Controls>
                  </div>
                </Panel>

                {!isMobile && (
                  <MiniMap
                    zoomable
                    pannable
                    draggable
                    nodeComponent={MiniMapNode}
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    maskColor="rgba(17,24,39,0.6)"
                  />
                )}

                <diagram.HelperLines
                  horizontal={diagram.helperLineHorizontal}
                  vertical={diagram.helperLineVertical}
                />
                <diagram.Markers />
              </ReactFlow>
              <CursorOverlay cursorsRef={cursorsRef} participants={participants} myId={myId} />
              {isPresentMode && (
                <PresentationMode
                  slides={presentSlides}
                  currentIndex={presentIndex}
                  onNext={handlePresentNext}
                  onPrev={handlePresentPrev}
                  onExit={handleExitPresent}
                />
              )}
              </div>
            </ResizablePanel>
            <PanelResizeHandle
              className={`w-1 cursor-col-resize ${
                isRightSidebarOpen ? "bg-stone-600 visible" : "bg-transparent hidden"
              }`}
            />
            {isRightSidebarOpen ? (
              <ResizablePanel
                order={2}
                defaultSize={getDefaultSize(width)}
                minSize={getDefaultSize(width)}
              >
                <JsonViewer
                  jsonString={getSnapshotJson()}
                  toggleRightSidebar={toggleRightSidebar}
                />
              </ResizablePanel>
            ) : null}
          </PanelGroup>
        </ResizablePanel>
      </PanelGroup>

      {/* Mobile shapes sidebar overlay */}
      {isMobile && isShapesSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsShapesSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50 w-56 shadow-2xl">
            <Sidebar />
          </div>
        </>
      )}

      {/* Mobile floating formatting toolbar */}
      <AnimatePresence>
        {isMobile && diagram.selectedNodes?.length > 0 && (
          <MobileFormattingToolbar diagram={diagram} />
        )}
      </AnimatePresence>

      {/* Mobile floating shapes toggle button */}
      {isMobile && (
        <button
          onClick={() => setIsShapesSidebarOpen((v) => !v)}
          title="Toggle shapes panel"
          className="fixed bottom-4 left-4 z-30 bg-gray-900 border border-gray-700 text-gray-100 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
        >
          <Layers size={20} />
        </button>
      )}

      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}

      {templateStore.isOpen && <TemplateModal diagram={diagram} />}
    </div>
  );
};

const DiagramFrame = ({ flowId, boardId }: FlowProps = {}) => {
  return (
    <ReactFlowProvider>
      <Flow flowId={flowId} boardId={boardId} />
    </ReactFlowProvider>
  );
};

export default DiagramFrame;
