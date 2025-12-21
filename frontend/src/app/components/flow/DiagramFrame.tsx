"use client";
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  ControlButton,
  Controls,
  DefaultEdgeOptions,
  MiniMap,
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
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { EditableEdge } from "./edges/EditableEdge";
import EdgeToolbar from "./EdgeToolbar/EdgeToolbar";
import { ConnectionLine } from "./edges/ConnectionLine";
import savedDiagramJson from "../flow/json-diagrams/DiagramX.json";
import { About } from "./About";
import ShapeNode from "./nodes/ShapeNode";
import { useDiagram } from "@/app/hooks/useDiagram";
import useUndoRedo from "@/app/hooks/useUndoRedo";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useTheme } from "@/app/hooks/useTheme";
import Sidebar from "./Sidebar/Sidebar";
import { Menu } from "./Menu";
import { FlowHeader } from "./FlowHeader/FlowHeader";
import ArrowEdge from "./edges/ArrowEdge";

const nodeTypes: NodeTypes = {
  shape: ShapeNode,
};



const Flow = () => {
  const diagram = useDiagram();
  const { getSnapshotJson, takeSnapshot } = useUndoRedo();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [width] = useWindowSize();
  const themeHook = useTheme();

  const getDefaultSize = (w: number) => {
    if (w < 1024) {
      return 33;
    } else return 20;
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen);
  };

  const EditableEdgeWrapper = useCallback(
    (props: EdgeProps) => {
      return <EditableEdge {...props} useDiagram={diagram} />;
    },
    [diagram]
  );
  // const edgeTypes: EdgeTypes = {
  //   "editable-edge": EditableEdgeWrapper,
  // };

  const edgeTypes: EdgeTypes = {
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
  bezier: BezierEdge,
  "editable-edge": EditableEdgeWrapper,
    arrow: ArrowEdge, 
};


  const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "editable-edge",
  style: { strokeWidth: 2 },
};



  type CursorMode = "pan" | "select";

  const [cursorMode, setCursorMode] = useState<CursorMode>("pan");
 

  return (
    <div className="w-full h-full flex flex-col">
      <FlowHeader diagram={diagram} />

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
            isLeftSidebarOpen === true
              ? "bg-stone-600 visible"
              : "bg-transparent hidden"
          }`}
        />
        <ResizablePanel order={1} minSize={20} defaultSize={20}>
          <Sidebar />
        </ResizablePanel>
        <ResizablePanel order={2}>
          <PanelGroup direction="horizontal">
            <ResizablePanel minSize={30} order={1}>
              <ReactFlow
                className={`${themeHook.theme || "light"} ${
                  cursorMode === "select" ? "cursor-default" : "cursor-grab"
                }`}
                onConnect={diagram.onConnect}
                onConnectStart={diagram.onConnectStart}
                connectionLineComponent={ConnectionLine}
                proOptions={{ hideAttribution: true }}
                onPaneClick={diagram.onPaneClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultNodes={savedDiagramJson.nodes}
                defaultEdges={savedDiagramJson.edges}
                defaultEdgeOptions={defaultEdgeOptions}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                connectionMode={ConnectionMode.Loose}
                panOnDrag={cursorMode === "pan"}
                selectionOnDrag={cursorMode === "select"}
                panOnScroll={cursorMode === "pan"}
                zoomOnScroll={cursorMode === "pan"}
                selectionKeyCode={cursorMode === "select" ? ["Shift"] : null}
                onDrop={diagram.onDrop}
                snapToGrid={false}
                snapGrid={[10, 10]}
                onDragOver={diagram.onDragOver}
                zoomOnDoubleClick={false}
                onNodesChange={diagram.onNodesChange}
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
                {/* <Panel position="top-left">
                  <Sidebar />
                </Panel> */}
                {diagram.editingEdgeId ? (
                  <Panel position="top-center">
                    <EdgeToolbar
                      takeSnapshot={takeSnapshot}
                      useDiagram={diagram}
                    />
                  </Panel>
                ) : null}
                <Panel position="top-right">
                  <Menu
                    themeHook={themeHook}
                    diagram={diagram}
                    isRightSidebarOpen={isRightSidebarOpen}
                    toggleRightSidebar={toggleRightSidebar}
                    toggleLeftSidebar={toggleLeftSidebar}
                  />
                  
                </Panel>
                <Controls className="flex flex-col items-start" showInteractive={false}>
                  <ControlButton onClick={() => diagram.undo()} title="Undo">
                    <CornerUpLeft fillOpacity={0} />
                  </ControlButton>
                  <ControlButton onClick={() => diagram.redo()} title="Redo">
                    <CornerUpRight fillOpacity={0} />
                  </ControlButton>
                  <div className="w-fit flex flex-col gap-1 bg-white dark:bg-black rounded-lg shadow-md p-0.5">
                    <button
                      onClick={() => setCursorMode("select")}
                      title="Select (Arrow)"
                      className={`p-2 rounded ${
                        cursorMode === "select"
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      🖱
                    </button>

                    <button
                      onClick={() => setCursorMode("pan")}
                      title="Pan (Hand)"
                      className={`p-2 rounded ${
                        cursorMode === "pan"
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      ✋
                    </button>
                  </div>
                </Controls>
               
                <MiniMap
                  zoomable
                  pannable
                  draggable
                  nodeComponent={MiniMapNode}
                />
                <diagram.HelperLines
                  horizontal={diagram.helperLineHorizontal}
                  vertical={diagram.helperLineVertical}
                />
                <diagram.Markers />
              </ReactFlow>
            </ResizablePanel>
            <PanelResizeHandle
              className={`w-1 cursor-col-resize ${
                isRightSidebarOpen === true
                  ? "bg-stone-600 visible"
                  : "bg-transparent hidden"
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
