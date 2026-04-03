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
// import { CursorOverlay } from "./CursorOverlay"; — hidden until backend integration
import { useDiagram } from "@/app/hooks/useDiagram";
import useUndoRedo from "@/app/hooks/useUndoRedo";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useTheme } from "@/app/hooks/useTheme";
import Sidebar from "./Sidebar/Sidebar";
import { FlowHeader } from "./FlowHeader/FlowHeader";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { HelpCircle, Maximize2, Layers, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorPicker } from "./ColorPicker";
import { FillColorPicker } from "./FillColorPicker";

const SAVE_KEY = "syncspace-diagram";

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

const Flow = () => {
  const diagram = useDiagram();
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

  // Load diagram from localStorage on mount, fall back to bundled default
  const initialDiagram = useMemo(() => {
    if (typeof window === "undefined") return defaultDiagramJson;
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultDiagramJson;
  }, []);

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
    style: { strokeWidth: 2 },
  };

  type CursorMode = "pan" | "select";
  const [cursorMode, setCursorMode] = useState<CursorMode>("pan");

  // ── Template store ───────────────────────────────────────────
  const templateStore = useTemplateStore();
  const loadRecentsFromStorage = useTemplateStore((s) => s.loadRecentsFromStorage);
  useEffect(() => { loadRecentsFromStorage(); }, [loadRecentsFromStorage]);

  // ── Presentation mode ────────────────────────────────────────
  const { getNodes: getRawNodes } = useReactFlow();
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
  }, [getRawNodes, diagram]);

  const handleExitPresent = useCallback(() => {
    setIsPresentMode(false);
    setPresentSlides([]);
    setPresentIndex(0);
    presentSlidesRef.current = [];
  }, []);

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
        {!isMobile && isShapesSidebarOpen && (
          <ResizablePanel order={1} minSize={15} defaultSize={20}>
            <Sidebar />
          </ResizablePanel>
        )}
        {!isMobile && isShapesSidebarOpen && (
          <PanelResizeHandle className="w-1 cursor-col-resize bg-stone-600" />
        )}
        <ResizablePanel order={2}>
          <PanelGroup direction="horizontal">
            <ResizablePanel minSize={30} order={1}>
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <ReactFlow
                className={`${themeHook.theme || "light"} ${
                  cursorMode === "select" ? "cursor-default" : "cursor-grab"
                }`}
                onConnect={diagram.onConnect}
                onConnectStart={diagram.onConnectStart}
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
                panOnDrag={!isPresentMode && cursorMode === "pan"}
                selectionOnDrag={!isPresentMode && cursorMode === "select"}
                panOnScroll={!isPresentMode && cursorMode === "pan"}
                zoomOnScroll={!isPresentMode && cursorMode === "pan"}
                selectionKeyCode={cursorMode === "select" ? ["Shift"] : null}
                onDrop={diagram.onDrop}
                snapToGrid={false}
                snapGrid={[10, 10]}
                onDragOver={diagram.onDragOver}
                zoomOnDoubleClick={false}
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

                <Panel position={isMobile ? "bottom-right" : "top-right"}>
                  <div className={isMobile ? "mb-16" : ""}>
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

                {!isMobile && <MiniMap zoomable pannable draggable nodeComponent={MiniMapNode} />}

                <diagram.HelperLines
                  horizontal={diagram.helperLineHorizontal}
                  vertical={diagram.helperLineVertical}
                />
                <diagram.Markers />
              </ReactFlow>
              {/* <CursorOverlay /> — hidden until backend integration */}
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

const DiagramFrame = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default DiagramFrame;
