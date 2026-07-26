"use client";

import { PenBox, Hand, MousePointer2, BarChart2, Lock, Unlock, Play, X as XIcon, Layers, ArrowLeft, FileText, Star, AlignJustify, Undo2, Redo2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { VotePanel } from "../VotePanel";
import {
  Bold,
  Italic,
  Underline,
  Share2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  CheckSquare,
  ChevronDown,
} from "react-feather";
import dynamic from "next/dynamic";

const Menu = dynamic(() => import("../Menu").then((m) => m.Menu), {
  ssr: false,
});

import { useTheme } from "@/app/hooks/useTheme";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { ColorPicker } from "../ColorPicker";
import { FillColorPicker } from "../FillColorPicker";
import type { Participant } from "@/app/hooks/useFlowPresence";

interface HeaderProps {
  diagram: any;
  toggleRightSidebar?: () => void;
  toggleLeftSidebar?: () => void;
  isRightSidebarOpen?: boolean;
  cursorMode: "pan" | "select";
  setCursorMode: (mode: "pan" | "select") => void;
  isPresentMode?: boolean;
  onEnterPresent?: () => void;
  onExitPresent?: () => void;
  onOpenTemplates?: () => void;
  onOpenAI?: () => void;
  boardId?: string;
  flowId?: string;
  participants?: Participant[];
}

export const FlowHeader = ({
  diagram,
  toggleRightSidebar,
  toggleLeftSidebar,
  isRightSidebarOpen,
  cursorMode,
  setCursorMode,
  isPresentMode = false,
  onEnterPresent,
  onExitPresent,
  onOpenTemplates,
  onOpenAI,
  boardId,
  flowId,
  participants,
}: HeaderProps) => {
  const [selectedStroke, setSelectedStroke] = useState("2");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedFontSize, setSelectedFontSize] = useState("16");
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [strokeWidthOpen, setStrokeWidthOpen] = useState(false);
  const [hoveredCollaborator, setHoveredCollaborator] = useState<string | null>(null);
  const [showMoreCollaborators, setShowMoreCollaborators] = useState(false);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const votePanelRef = useRef<HTMLDivElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const strokeWidthRef = useRef<HTMLDivElement>(null);
  const fontFamilyBtnRef = useRef<HTMLButtonElement>(null);
  const fontSizeBtnRef = useRef<HTMLButtonElement>(null);
  const strokeWidthBtnRef = useRef<HTMLButtonElement>(null);
  const [fontFamilyPos, setFontFamilyPos] = useState({ top: 0, left: 0 });
  const [fontSizePos, setFontSizePos] = useState({ top: 0, left: 0 });
  const [strokeWidthPos, setStrokeWidthPos] = useState({ top: 0, left: 0 });
  const themeHook = useTheme();
  const [windowWidth] = useWindowSize();
  const isMobile = windowWidth > 0 && windowWidth < 768;

  const collaborators = participants ?? [];

  const displayedCollaborators = collaborators.slice(0, 2);
  const hiddenCollaborators = collaborators.slice(2);

  const fontFamilies = ["Inter", "Roboto", "Poppins", "Georgia", "Arial", "Courier New"];
  const fontSizes = ["10", "12", "14", "16", "18", "20", "24", "32"];
  const strokeWidths = ["1", "2", "3"];

  const handleClickOutside = (e: MouseEvent) => {
    if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target as Node)) setFontFamilyOpen(false);
    if (fontSizeRef.current && !fontSizeRef.current.contains(e.target as Node)) setFontSizeOpen(false);
    if (strokeWidthRef.current && !strokeWidthRef.current.contains(e.target as Node)) setStrokeWidthOpen(false);
    if (votePanelRef.current && !votePanelRef.current.contains(e.target as Node)) setShowVotePanel(false);
  };

  const applyNodeStyle = useCallback(
    (style: any) => {
      diagram.updateNodesStyle(style);
    },
    [diagram],
  );

  const applyEdgeStyle = useCallback(
    (style: any) => {
      diagram.updateEdgesStyle(style);
    },
    [diagram],
  );

  // Derive lock state for selection
  const hasSelection =
    (diagram.selectedNodes?.length ?? 0) > 0 ||
    (diagram.selectedEdges?.length ?? 0) > 0;
  const allSelectedLocked =
    hasSelection &&
    (diagram.selectedNodes ?? []).every((n: { data?: { locked?: boolean } }) => n.data?.locked) &&
    (diagram.selectedEdges ?? []).every((e: { data?: { locked?: boolean } }) => (e.data as { locked?: boolean } | undefined)?.locked);

  // Derive active states from first selected node
  const firstNodeData = (diagram.selectedNodes?.[0]?.data ?? {}) as Record<string, unknown>;
  const isBold = firstNodeData.fontWeight === "bold";
  const isItalic = firstNodeData.fontStyle === "italic";
  const isUnderline = firstNodeData.textDecoration === "underline";
  const activeListType = (firstNodeData.listType as string | null) ?? null;
  const activeTextAlign = (firstNodeData.textAlign as string) || "center";

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Sync dropdowns to the first selected node's font settings
  useEffect(() => {
    const nodes = diagram.selectedNodes;
    if (!nodes?.length) return;
    const data = nodes[0].data as Record<string, unknown>;
    if (typeof data.fontFamily === "string") setSelectedFont(data.fontFamily);
    if (data.fontSize) setSelectedFontSize(String(data.fontSize).replace("px", ""));
  }, [diagram.selectedNodes]);

  // Title editing helpers
  const startEditTitle = () => {
    setTitleDraft(diagram.diagramTitle || "Untitled Diagram");
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim() || "Untitled Diagram";
    diagram.setDiagramTitle(trimmed);
    setEditingTitle(false);
  };

  const handleTitleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitTitle();
    if (e.key === "Escape") setEditingTitle(false);
  };

  return (
    <div className="w-full bg-gray-900 border-b border-gray-800 px-2 sm:px-4 py-2 flex items-center gap-2 text-sm text-gray-100 min-w-0">
      {/* LEFT SECTION - Logo & Title */}
      <div className="inline-flex items-center gap-2 flex-shrink-0">
        {boardId && (
          <Link
            href={`/dashboard/boards/${boardId}/flows`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium text-gray-100 transition"
          >
            <ArrowLeft size={13} /> Back to Flows
          </Link>
        )}
        <div className="p-1 hover:bg-gray-800 rounded transition-colors">
          {toggleRightSidebar && toggleLeftSidebar && typeof isRightSidebarOpen !== "undefined" && (
            <Menu
              themeHook={themeHook}
              diagram={diagram}
              isRightSidebarOpen={isRightSidebarOpen}
              toggleRightSidebar={toggleRightSidebar}
              toggleLeftSidebar={toggleLeftSidebar}
            />
          )}
        </div>
        {/* Flow document icon */}
        <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700/40 items-center justify-center flex-shrink-0 hidden sm:flex">
          <FileText size={14} className="text-blue-400" />
        </div>
        {/* Title + subtitle */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKey}
                className="font-semibold text-gray-100 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-sm outline-none focus:border-blue-500 w-28 sm:w-40"
              />
            ) : (
              <span
                className="font-semibold text-gray-100 hover:text-white cursor-text truncate max-w-[100px] sm:max-w-[160px] text-sm"
                onClick={startEditTitle}
                title="Click to rename"
              >
                {diagram.diagramTitle || "Untitled Diagram"}
              </span>
            )}
            {!editingTitle && (
              <ChevronDown size={13} className="text-gray-500 hover:text-gray-300 cursor-pointer flex-shrink-0 transition-colors" onClick={startEditTitle} />
            )}
            <Star size={12} className="text-gray-600 hover:text-amber-400 cursor-pointer flex-shrink-0 transition-colors ml-0.5" />
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[11px] text-gray-500">Last saved just now</span>
            <span className="text-[11px] text-gray-600">•</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-[11px] text-gray-400">SyncFlow</span>
          </div>
        </div>
      </div>

      {/* MIDDLE: Formatting controls — single row, takes remaining space */}
      {!isMobile && !isPresentMode && (
        <>
          <div className="w-px h-5 bg-gray-700/60 flex-shrink-0" />
          <div className="flex items-center justify-between flex-1 gap-1 min-w-0">
            {/* Font family + size */}
            <div className="flex items-center gap-1">
              <div className="relative" ref={fontFamilyRef}>
                <button
                  ref={fontFamilyBtnRef}
                  onClick={() => {
                    if (!fontFamilyOpen && fontFamilyBtnRef.current) {
                      const r = fontFamilyBtnRef.current.getBoundingClientRect();
                      setFontFamilyPos({ top: r.bottom + 4, left: r.left });
                    }
                    setFontFamilyOpen(!fontFamilyOpen); setFontSizeOpen(false);
                  }}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs hover:bg-gray-700 hover:cursor-pointer transition-colors flex items-center gap-1 min-w-[60px]"
                >
                  {selectedFont}<ChevronDown size={10} className="ml-1 flex-shrink-0" />
                </button>
                {fontFamilyOpen && (
                  <div style={{ position: "fixed", top: fontFamilyPos.top, left: fontFamilyPos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-32">
                    {fontFamilies.map((font) => (
                      <button key={font} onClick={() => { setSelectedFont(font); setFontFamilyOpen(false); applyNodeStyle({ fontFamily: font }); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedFont === font ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`} style={{ fontFamily: font }}>
                        {font}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={fontSizeRef}>
                <button
                  ref={fontSizeBtnRef}
                  onClick={() => {
                    if (!fontSizeOpen && fontSizeBtnRef.current) {
                      const r = fontSizeBtnRef.current.getBoundingClientRect();
                      setFontSizePos({ top: r.bottom + 4, left: r.left });
                    }
                    setFontSizeOpen(!fontSizeOpen); setFontFamilyOpen(false);
                  }}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs hover:bg-gray-700 hover:cursor-pointer transition-colors flex items-center gap-1 w-12"
                >
                  {selectedFontSize}<ChevronDown size={10} className="ml-0.5 flex-shrink-0" />
                </button>
                {fontSizeOpen && (
                  <div style={{ position: "fixed", top: fontSizePos.top, left: fontSizePos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-20">
                    {fontSizes.map((size) => (
                      <button key={size} onClick={() => { setSelectedFontSize(size); setFontSizeOpen(false); applyNodeStyle({ fontSize: `${size}px` }); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedFontSize === size ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* B I U */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => applyNodeStyle({ fontWeight: isBold ? "normal" : "bold" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isBold ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Bold"><Bold size={14} /></button>
              <button onClick={() => applyNodeStyle({ fontStyle: isItalic ? "normal" : "italic" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isItalic ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Italic"><Italic size={14} /></button>
              <button onClick={() => applyNodeStyle({ textDecoration: isUnderline ? "none" : "underline" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isUnderline ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Underline"><Underline size={14} /></button>
            </div>
            {/* Alignment */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => applyNodeStyle({ textAlign: "left" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "left" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Left"><AlignLeft size={14} /></button>
              <button onClick={() => applyNodeStyle({ textAlign: "center" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "center" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Center"><AlignCenter size={14} /></button>
              <button onClick={() => applyNodeStyle({ textAlign: "right" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "right" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Right"><AlignRight size={14} /></button>
              <button onClick={() => applyNodeStyle({ textAlign: "justify" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "justify" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Justify"><AlignJustify size={14} /></button>
            </div>
            {/* Lists */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => applyNodeStyle({ listType: activeListType === "bullet" ? null : "bullet" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "bullet" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Bullet List"><List size={14} /></button>
              <button onClick={() => applyNodeStyle({ listType: activeListType === "numbered" ? null : "numbered" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "numbered" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Numbered List"><PenBox size={14} /></button>
              <button onClick={() => applyNodeStyle({ listType: activeListType === "checklist" ? null : "checklist" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "checklist" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Checklist"><CheckSquare size={14} /></button>
              {activeListType && (
                <button onClick={() => applyNodeStyle({ listType: null })} className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-300 hover:cursor-pointer text-xs" title="Clear List">✕</button>
              )}
            </div>
            {/* Colors */}
            <div className="flex items-center gap-1">
              <ColorPicker onColorSelect={(color) => applyNodeStyle({ color })} />
              <FillColorPicker onColorSelect={(color) => applyNodeStyle({ backgroundColor: color })} />
            </div>
            {/* Stroke width */}
            <div className="relative" ref={strokeWidthRef}>
              <button
                ref={strokeWidthBtnRef}
                onClick={() => {
                  if (!strokeWidthOpen && strokeWidthBtnRef.current) {
                    const r = strokeWidthBtnRef.current.getBoundingClientRect();
                    setStrokeWidthPos({ top: r.bottom + 4, left: r.left });
                  }
                  setStrokeWidthOpen(!strokeWidthOpen); setFontFamilyOpen(false); setFontSizeOpen(false);
                }}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs hover:bg-gray-700 hover:cursor-pointer transition-colors flex items-center gap-1 w-14"
              >
                {selectedStroke} px<ChevronDown size={10} className="ml-0.5 flex-shrink-0" />
              </button>
              {strokeWidthOpen && (
                <div style={{ position: "fixed", top: strokeWidthPos.top, left: strokeWidthPos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-20">
                  {strokeWidths?.map((width) => (
                    <button key={width} onClick={() => { setSelectedStroke(width); setStrokeWidthOpen(false); applyEdgeStyle({ strokeWidth: Number(width) }); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedStroke === width ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}>
                      {width} px
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => diagram.undo()} title="Undo (Ctrl+Z)" className="p-1.5 rounded transition-colors hover:bg-gray-800 text-gray-400 hover:text-gray-200 hover:cursor-pointer"><Undo2 size={14} /></button>
              <button onClick={() => diagram.redo()} title="Redo (Ctrl+Shift+Z)" className="p-1.5 rounded transition-colors hover:bg-gray-800 text-gray-400 hover:text-gray-200 hover:cursor-pointer"><Redo2 size={14} /></button>
            </div>
          </div>
          <div className="w-px h-5 bg-gray-700/60 flex-shrink-0" />
        </>
      )}

      {/* Presenting indicator */}
      {!isMobile && isPresentMode && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Presenting...
          </div>
        </div>
      )}

      {/* RIGHT SECTION - Collaborate & Share */}
      <div className="inline-flex items-center gap-1.5 flex-shrink-0 ml-auto">
        {/* LOCK / UNLOCK SELECTION */}
        {hasSelection && (
          <button
            onClick={() => diagram.toggleSelectionLock()}
            title={allSelectedLocked ? "Unlock selection" : "Lock selection"}
            className={`p-1 rounded transition-colors hover:cursor-pointer ${
              allSelectedLocked
                ? "text-amber-400 hover:bg-gray-800 hover:text-amber-300"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            {allSelectedLocked ? <Unlock size={13} /> : <Lock size={13} />}
          </button>
        )}
        {/* CURSOR MODE TOGGLE */}
        <div className="flex items-center gap-0.5 bg-gray-800 rounded p-0.5">
          <button
            onClick={() => setCursorMode("select")}
            title="Select mode"
            className={`p-1 rounded transition-colors hover:cursor-pointer ${cursorMode === "select" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"}`}
          >
            <MousePointer2 size={13} />
          </button>
          <button
            onClick={() => setCursorMode("pan")}
            title="Pan mode"
            className={`p-1 rounded transition-colors hover:cursor-pointer ${cursorMode === "pan" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"}`}
          >
            <Hand size={13} />
          </button>
        </div>
        <div className="hidden sm:flex items-center -space-x-1 relative">
          {displayedCollaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="relative group"
              onMouseEnter={() => setHoveredCollaborator(collaborator.id)}
              onMouseLeave={() => setHoveredCollaborator(null)}
            >
              <div className="relative">
                <div className="w-6 h-6 rounded-full border border-gray-800 flex items-center justify-center text-[10px] font-semibold text-white hover:cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-gray-900 hover:ring-blue-400 transition-all" style={{ backgroundColor: collaborator.color }}>
                  {collaborator.initials}
                </div>
                {collaborator.isOnline && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-gray-800" />
                )}
              </div>
              {hoveredCollaborator === collaborator.id && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-3 z-50 shadow-lg flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: collaborator.color }}>
                      {collaborator.initials}
                    </div>
                    {collaborator.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                    )}
                  </div>
                  <span className="text-gray-100 text-xs font-medium text-center whitespace-normal max-w-[80px]">{collaborator.name}</span>
                </div>
              )}
            </div>
          ))}

          {hiddenCollaborators.length > 0 && (
            <button
              onClick={() => setShowMoreCollaborators(!showMoreCollaborators)}
              className="w-6 h-6 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[10px] font-semibold text-gray-300 hover:bg-gray-600 hover:cursor-pointer transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-offset-gray-900 hover:ring-blue-400"
            >
              +{hiddenCollaborators.length}
            </button>
          )}

          {showMoreCollaborators && hiddenCollaborators.length > 0 && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-2 z-50 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2 min-w-max hover:cursor-pointer">
                {hiddenCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition-colors">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0" style={{ backgroundColor: collaborator.color }}>
                        {collaborator.initials}
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800" />
                      )}
                    </div>
                    <span className="text-gray-100 text-xs font-medium">{collaborator.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showMoreCollaborators && (
          <div className="fixed inset-0 z-40" onClick={() => setShowMoreCollaborators(false)} />
        )}

        {/* Vote button + panel */}
        <div ref={votePanelRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowVotePanel((v) => !v)}
            className="hover:bg-gray-800/60 hover:cursor-pointer text-gray-300 hover:text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium text-xs border border-gray-700"
          >
            <BarChart2 size={12} /> <span className="hidden sm:inline">Vote</span>
          </button>
          {showVotePanel && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50 }}>
              <VotePanel onClose={() => setShowVotePanel(false)} participants={collaborators} boardId={boardId} flowId={flowId} />
            </div>
          )}
        </div>

        {/* Present / Exit Present button */}
        {isPresentMode ? (
          <button
            onClick={onExitPresent}
            className="bg-red-700 hover:bg-red-600 hover:cursor-pointer text-white px-2 py-1 rounded flex items-center gap-1 transition-colors font-medium text-xs border border-red-600"
            title="Exit presentation (Esc)"
          >
            <XIcon size={12} /> <span className="hidden sm:inline">Exit</span>
          </button>
        ) : (
          <button
            onClick={onEnterPresent}
            className="bg-gray-700 hover:bg-gray-600 hover:cursor-pointer text-gray-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium text-xs border border-gray-600"
            title="Enter presentation mode"
          >
            <Play size={12} /> <span className="hidden sm:inline">Present</span>
          </button>
        )}

        <button
          onClick={onOpenTemplates}
          className="hover:bg-gray-800/60 hover:cursor-pointer text-gray-300 hover:text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium text-xs border border-gray-700"
          title="Browse templates"
        >
          <Layers size={12} /> <span className="hidden sm:inline">Templates</span>
        </button>

        <button
          onClick={onOpenAI}
          className="bg-indigo-600 hover:bg-indigo-500 hover:cursor-pointer text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium text-xs"
          title="Generate diagram with AI"
        >
          <Sparkles size={12} /> <span className="hidden sm:inline">Generate AI</span>
        </button>

        <button className="bg-blue-600 hover:bg-blue-500 hover:cursor-pointer text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors font-medium text-xs">
          <Share2 size={12} /> <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};
