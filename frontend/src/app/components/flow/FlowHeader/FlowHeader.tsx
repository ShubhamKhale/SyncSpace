"use client";

import { PenBox, Hand, MousePointer2, BarChart2, Lock, Unlock, Play, X as XIcon, Layers } from "lucide-react";
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

interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  profilePicture?: string;
  isOnline: boolean;
}

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

  const collaborators: Collaborator[] = [
    { id: "1", name: "John Berkley", initials: "JB", color: "bg-blue-500", isOnline: true },
    { id: "2", name: "Alice Smith", initials: "AS", color: "bg-green-500", isOnline: true },
    { id: "3", name: "Bob Wilson", initials: "BW", color: "bg-purple-500", isOnline: false },
    { id: "4", name: "Carol Davis", initials: "CD", color: "bg-orange-500", isOnline: true },
  ];

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
    <div className="w-full bg-gray-900 border-b border-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-6 text-sm text-gray-100">
      {/* LEFT SECTION - Logo & Title */}
      <div className="inline-flex items-center gap-2 flex-shrink-0">
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
        <div className="flex flex-col min-w-0">
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
              className="font-semibold text-gray-100 hover:text-white cursor-text truncate max-w-[100px] sm:max-w-[180px]"
              onClick={startEditTitle}
              title="Click to rename"
            >
              {diagram.diagramTitle || "Untitled Diagram"}
            </span>
          )}
          <span className="text-xs text-gray-500 hidden sm:block">SyncFlow</span>
        </div>
      </div>

      {/* MIDDLE SECTION - Formatting Controls (hidden on mobile) */}
      {!isMobile && (isPresentMode ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Presenting...
          </div>
        </div>
      ) : (
      <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
      <div className="inline-flex items-center justify-between space-x-6 px-1">
        <div className="flex items-center gap-2">
          {/* FONT FAMILY */}
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
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs hover:bg-gray-700 hover:cursor-pointer transition-colors flex items-center gap-1 min-w-16"
            >
              {selectedFont}
              <ChevronDown size={12} className="ml-3" />
            </button>
            {fontFamilyOpen && (
              <div style={{ position: "fixed", top: fontFamilyPos.top, left: fontFamilyPos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-32">
                {fontFamilies.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      setSelectedFont(font);
                      setFontFamilyOpen(false);
                      applyNodeStyle({ fontFamily: font });
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedFont === font ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FONT SIZE */}
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
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs hover:bg-gray-700 hover:cursor-pointer transition-colors flex items-center gap-1 w-14"
            >
              {selectedFontSize}
              <ChevronDown size={12} className="ml-3" />
            </button>
            {fontSizeOpen && (
              <div style={{ position: "fixed", top: fontSizePos.top, left: fontSizePos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-20">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedFontSize(size);
                      setFontSizeOpen(false);
                      applyNodeStyle({ fontSize: `${size}px` });
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedFontSize === size ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* TEXT STYLES */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => applyNodeStyle({ fontWeight: isBold ? "normal" : "bold" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isBold ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => applyNodeStyle({ fontStyle: isItalic ? "normal" : "italic" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isItalic ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => applyNodeStyle({ textDecoration: isUnderline ? "none" : "underline" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${isUnderline ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* COLOR CONTROLS */}
        <div className="flex items-center gap-2">
          <ColorPicker onColorSelect={(color) => applyNodeStyle({ color })} />
          <FillColorPicker onColorSelect={(color) => applyNodeStyle({ backgroundColor: color })} />
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* STROKE WIDTH */}
        <div className="flex items-center gap-2">
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
              {selectedStroke}
              <ChevronDown size={12} className="ml-3" />
            </button>
            {strokeWidthOpen && (
              <div style={{ position: "fixed", top: strokeWidthPos.top, left: strokeWidthPos.left, zIndex: 9999 }} className="bg-gray-800 border border-gray-700 rounded shadow-lg min-w-20">
                {strokeWidths?.map((width) => (
                  <button
                    key={width}
                    onClick={() => { setSelectedStroke(width); setStrokeWidthOpen(false); applyEdgeStyle({ strokeWidth: Number(width) }); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:cursor-pointer ${selectedStroke === width ? "bg-blue-600 text-white" : "text-gray-200 hover:bg-gray-700"}`}
                  >
                    {width} px
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* TEXT ALIGNMENT */}
        <div className="flex items-center gap-1">
          <button onClick={() => applyNodeStyle({ textAlign: "left" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "left" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Left">
            <AlignLeft size={16} />
          </button>
          <button onClick={() => applyNodeStyle({ textAlign: "center" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "center" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Center">
            <AlignCenter size={16} />
          </button>
          <button onClick={() => applyNodeStyle({ textAlign: "right" })} className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeTextAlign === "right" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`} title="Align Right">
            <AlignRight size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* LIST FORMATTING */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => applyNodeStyle({ listType: activeListType === "bullet" ? null : "bullet" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "bullet" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => applyNodeStyle({ listType: activeListType === "numbered" ? null : "numbered" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "numbered" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Numbered List"
          >
            <PenBox size={16} />
          </button>
          <button
            onClick={() => applyNodeStyle({ listType: activeListType === "checklist" ? null : "checklist" })}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${activeListType === "checklist" ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"}`}
            title="Checklist"
          >
            <CheckSquare size={16} />
          </button>
          {activeListType && (
            <button
              onClick={() => applyNodeStyle({ listType: null })}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-gray-300 hover:cursor-pointer text-xs"
              title="Clear List"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      </div>
      ))}

      {/* RIGHT SECTION - Collaborate & Share */}
      <div className=" inline-flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* LOCK / UNLOCK SELECTION */}
        {hasSelection && (
          <button
            onClick={() => diagram.toggleSelectionLock()}
            title={allSelectedLocked ? "Unlock selection" : "Lock selection"}
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${
              allSelectedLocked
                ? "text-amber-400 hover:bg-gray-800 hover:text-amber-300"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
            }`}
          >
            {allSelectedLocked ? <Unlock size={15} /> : <Lock size={15} />}
          </button>
        )}
        {/* CURSOR MODE TOGGLE */}
        <div className="flex items-center gap-1 bg-gray-800 rounded p-0.5">
          <button
            onClick={() => setCursorMode("select")}
            title="Select mode"
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${cursorMode === "select" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"}`}
          >
            <MousePointer2 size={15} />
          </button>
          <button
            onClick={() => setCursorMode("pan")}
            title="Pan mode"
            className={`p-1.5 rounded transition-colors hover:cursor-pointer ${cursorMode === "pan" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-700"}`}
          >
            <Hand size={15} />
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
                <div className={`w-7 h-7 rounded-full ${collaborator.color} border border-gray-800 flex items-center justify-center text-xs font-semibold text-white hover:cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-gray-900 hover:ring-blue-400 transition-all`}>
                  {collaborator.initials}
                </div>
                {collaborator.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-gray-800" />
                )}
              </div>
              {hoveredCollaborator === collaborator.id && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-3 z-50 shadow-lg flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${collaborator.color} flex items-center justify-center text-xs font-semibold text-white`}>
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
              className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-semibold text-gray-300 hover:bg-gray-600 hover:cursor-pointer transition-colors hover:ring-2 hover:ring-offset-2 hover:ring-offset-gray-900 hover:ring-blue-400"
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
                      <div className={`w-10 h-10 rounded-full ${collaborator.color} flex items-center justify-center text-xs font-semibold text-white flex-shrink-0`}>
                        {collaborator.initials}
                      </div>
                      {collaborator.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800" />
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
            className="bg-gray-800 hover:bg-gray-700 hover:cursor-pointer text-gray-100 px-3 sm:px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm border border-gray-700"
          >
            <BarChart2 size={14} /> <span className="hidden sm:inline">Vote</span>
          </button>
          {showVotePanel && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50 }}>
              <VotePanel onClose={() => setShowVotePanel(false)} />
            </div>
          )}
        </div>

        {/* Present / Exit Present button */}
        {isPresentMode ? (
          <button
            onClick={onExitPresent}
            className="bg-red-700 hover:bg-red-600 hover:cursor-pointer text-white px-3 sm:px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm border border-red-600"
            title="Exit presentation (Esc)"
          >
            <XIcon size={14} /> <span className="hidden sm:inline">Exit</span>
          </button>
        ) : (
          <button
            onClick={onEnterPresent}
            className="bg-gray-800 hover:bg-gray-700 hover:cursor-pointer text-gray-100 px-3 sm:px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm border border-gray-700"
            title="Enter presentation mode"
          >
            <Play size={14} /> <span className="hidden sm:inline">Present</span>
          </button>
        )}

        <button
          onClick={onOpenTemplates}
          className="bg-gray-800 hover:bg-gray-700 hover:cursor-pointer text-gray-100 px-3 sm:px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm border border-gray-700"
          title="Browse templates"
        >
          <Layers size={14} /> <span className="hidden sm:inline">Templates</span>
        </button>

        <button className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white px-3 sm:px-4 py-1.5 rounded flex items-center gap-1.5 transition-colors font-medium text-xs sm:text-sm">
          <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};
