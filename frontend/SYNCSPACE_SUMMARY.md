# SyncSpace Frontend — Complete Technical Summary

> Use this document as context for Claude Desktop sessions to discuss features, architecture decisions, and plan new development.
> **Backend integration:** The frontend is fully functional with mocked async data. The **Backend API Contract** section at the bottom of this file is the canonical specification for replacing all mocks with real API calls.

---

## Project Overview

**SyncSpace** is a collaborative project management + visual diagramming platform. The frontend is a standalone Next.js 15 app with **no backend** — all data is simulated with async mock stores. The codebase has two major product areas:

1. **Dashboard** — board management, kanban task flow, timeline, analytics
2. **SyncFlow** — a Miro/FigJam-style flow diagram canvas

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15.3.2 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (configured via `@import "tailwindcss"` in globals.css, NOT tailwind.config.js) |
| State | Zustand 5 (all client state) |
| Flow Canvas | @xyflow/react 12.8 (custom nodes, edges, minimap) |
| Drag & Drop | @dnd-kit (kanban), HTML5 drag (flow sidebar) |
| Charts | Recharts 3.2 |
| Animation | Framer Motion 12.16, GSAP 3.13 |
| Icons | lucide-react (primary), react-feather, react-icons |
| UI Primitives | Radix UI (dropdown, toast) |
| Code Editor | Monaco Editor 0.52 |
| Auth | NextAuth 4.24 (SessionProvider wrapper only, no real auth) |
| Export | html-to-image (PNG/SVG export) |

**Path alias:** `@/` maps to `src/` (tsconfig.json). Use `@/app/...` for all imports.

**Commands:**
```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test runner configured.

---

## Route Structure

```
/                                   → Landing page
/dashboard                          → Stats, charts, recent activity
/dashboard/boards                   → Board listing (grid + list views)
/dashboard/boards/[boardid]         → Board detail (3-pane layout)
/dashboard/boards/[boardid]/tasks   → Full-screen flow diagram (no sidebars)
/dashboard/history                  → Activity history
/dashboard/notifications            → Notifications
/dashboard/organization             → Org overview, members, roles
/dashboard/profile                  → User profile
/dashboard/settings                 → App settings
/flow                               → Standalone flow editor
```

---

## Architecture

### Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Fixed left nav sidebar (280px) with route links
- Hidden on mobile (`hidden lg:flex`) with hamburger toggle
- **Exception:** when path is `/dashboard/boards/[boardid]`, sidebar hides and the board layout takes over full viewport
- Dark mode toggle + user profile card at sidebar bottom

### Board Detail Layout (`src/app/dashboard/boards/[boardid]/layout.tsx`)
Three collapsible panels:
- **Left** (`BoardSidebar`, 264px): board metadata, health, tags, theme toggle
- **Center** (`BoardTaskFlow`): kanban / timeline / matrix views
- **Right** (`BoardLinkedResources`, 288px): docs and external links

The `/tasks` sub-route suppresses all sidebars and renders full-screen `DiagramFrame`.

### Task Views in BoardTaskFlow
1. **Kanban** — horizontal pipeline (Planning → Design → Development → QA → Deployment), drag-and-drop via @dnd-kit
2. **Timeline** — date-range bars per task
3. **Priority-Phase Matrix** — 2D scatter (phase x priority)

---

## State Management (Zustand Stores)

All stores in `src/app/store/`:

| Store | File | Purpose |
|-------|------|---------|
| `useBoardStore` | `useBoardStore.ts` | Board metadata (title, description, tags, status, coverColor) with per-field save states (`"idle" | "loading" | "success" | "error"`) |
| `useBoardTaskStore` | `useBoardTaskStore.ts` | Tasks array with optimistic per-field updates. Save state keys: `"${taskId}-${field}"` |
| `useLinkedResourcesStore` | `useLinkedResourcesStore.ts` | Documentation links + external resource links for right panel |
| `useTaskStore` | `useTaskStore.ts` | General task lists by status column (To Do, In Progress, Done) |
| `globalTaskStore` | `globalTaskStore.ts` | App-wide selected task state |
| `useFlowStore` | `flowStore.ts` | ReactFlow nodes/edges (general) |
| `useAppStore` | `flow/store.ts` | Connection line path during edge drawing (local to flow) |
| `useTemplateStore` | `useTemplateStore.ts` | Template modal state: `isOpen`, `selectedCategory`, `searchQuery`, `recentIds` (persisted to localStorage) |

### Save State Pattern
```typescript
// Each field has independent save state
saveStates: Record<string, "idle" | "loading" | "success" | "error">
// Key pattern: "${entityId}-${field}" e.g. "task-1-title"
```

---

## Dark Mode System

- `.dark` class on `<html>`, managed by `useTheme()` hook
- `ThemeProvider` component initializes in root layout
- CSS variables in `globals.css` have `:root` (light) and `.dark` overrides
- Tailwind v4 dark variant: `@variant dark (&:where(.dark, .dark *));`
- Board area uses Tailwind `dark:` classes directly (not CSS variables)

**Surface hierarchy (board area):**
```
Shell/page:    dark:bg-slate-900
Panel/card:    dark:bg-slate-800
Inner item:    dark:bg-slate-700
Hover:         dark:hover:bg-slate-600
```

**Theme toggle** available in: dashboard nav sidebar, board sidebar.

---

## Key Shared Components

| Component | File | Description |
|-----------|------|-------------|
| `EditableText` | `EditableText.tsx` | Click-to-edit inline text. `className` applies to display div — dark classes must go in className prop |
| `SelectPopover` | `SelectPopover.tsx` | Dropdown selector. Dark classes via `triggerClassName` string prop |
| `Popover` | `Popover.tsx` | Generic popover with click-outside-to-close |
| `TaskModal` | `TaskModal.tsx` | Full task create/edit modal (two-column: details + attachments/checklist) |
| `Skeleton` | `Skeleton.tsx` | Loading skeletons for all major panels |
| `EditableDate` | `EditableDate.tsx` | Date picker with save states |
| `EditablePriority` | `EditablePriority.tsx` | Priority selector dropdown |
| `EditableAssignee` | `EditableAssignee.tsx` | Assignee field |

### Kanban Components (`src/app/components/kanban/`)
- `DraggableTaskCard` — task card with @dnd-kit drag
- `DroppableColumn` — kanban column drop zone
- `SortablePipelineStage` — draggable stage header

### Analytics Charts (`src/app/components/analytics-charts/`)
- `BoardActivity` — activity trend
- `TaskCompletionTrend` — line chart
- `TaskDistribution` — pie/bar chart
- `TeamContribution` — member contributions

---

## Flow / Diagram Canvas (SyncFlow)

The entire flow system lives under `src/app/components/flow/`.

### Core Architecture

```
DiagramFrame.tsx          → Root: ReactFlowProvider, panels, mobile layout
  ├── FlowHeader.tsx      → Toolbar (formatting, mode toggle, share, vote)
  ├── VotePanel.tsx       → Flow-level voting (Approve/Review/Reject)
  ├── CursorOverlay.tsx   → Multiplayer cursors (hidden, pending backend)
  ├── Sidebar/            → Shapes palette (drag-to-add)
  ├── ReactFlow canvas    → @xyflow/react instance
  │   ├── ShapeNode       → 9 shape types with editable text + lock
  │   ├── StickyNoteNode  → Colored notes with 5 themes + lock
  │   ├── ImageNode       → Image with caption + lock
  │   ├── TableNode       → Editable data table + lock
  │   ├── GroupNode       → Visual container for grouping + lock
  │   └── EditableEdge    → Custom edge with control points
  ├── EdgeToolbar         → Edge editing (color, path, animation, arrows)
  ├── MiniMap             → Overview (desktop only)
  ├── KeyboardShortcuts   → Help modal
  └── JsonViewer          → Debug panel (resizable right sidebar)
```

### Node Types

**ShapeNode** (`nodes/ShapeNode.tsx`):
- 9 SVG shapes: circle, rectangle, round-rectangle, diamond, hexagon, arrow-rectangle, cylinder, triangle, parallelogram
- Double-click to edit text (stored in `node.data.text`)
- Font styling in `node.data`: `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `textDecoration`, `textAlign`, `color`
- Fill color in `node.data.fill`
- **Textarea editing:** background and border dynamically match the node's fill color (`background: fill || "white"`, `border: 1px solid ${fill || "#ccc"}`)
- **SVG stroke:** transparent/matched for colored nodes (`stroke={fill && fill !== "#ffffff" ? fill : "black"}`) — preserves default black border on uncolored nodes
- List types: `node.data.listType` (`"bullet" | "numbered" | "checklist" | null`)
- Checklist state: `node.data.checkedItems: boolean[]`
- 8 connection handles (top/bottom/left/right, source + target each)
- Resizable (NodeResizer, min 40x40)
- **Lock/unlock** — amber button (top-left when selected); locks drag, resize, delete, edit

**StickyNoteNode** (`nodes/StickyNoteNode.tsx`):
- 5 color schemes (Yellow, Blue, Green, Pink, Purple)
- Colored header strip with inline color picker (lock/delete buttons in header)
- Editable text with list support (bullet, numbered, checklist)
- Resizable (min 120x80)
- **Lock/unlock** — same pattern as ShapeNode

**ImageNode** (`nodes/ImageNode.tsx`):
- Displays image from `node.data.src`
- Editable caption (double-click; stored in `node.data.caption`)
- `keepAspectRatio` resizer (min 60x60)
- 8 connection handles
- **Lock/unlock** — same pattern as ShapeNode

**TableNode** (`nodes/TableNode.tsx`):
- Editable grid via `node.data.cells: string[][]` (default 3×3)
- Add/remove rows and columns via floating toolbar (shown when selected, hidden when locked)
- Toggle header row (dark styled) with `node.data.hasHeader`
- Tab/Enter keyboard navigation between cells
- Customizable `borderColor` and `headerBg`
- 8 connection handles; free-resize (no aspect lock)
- **Lock/unlock** — floating toolbar hidden, cell edits blocked when locked

**GroupNode** (`nodes/GroupNode.tsx`):
- Visual container with dashed border
- 6 color options (inline color dots)
- Editable label (double-click on label chip above node)
- Created via `G` key with 2+ selected nodes
- Semi-transparent background (`${color}10`)
- **Lock/unlock** — color dots hidden, label editing blocked, lock icon badge shown

### Edge System

**EditableEdge** (`edges/EditableEdge/`):
- Interactive control points (drag to reshape path)
- 4 path algorithms:
  - `BezierCatmullRom` (default) — smooth curved
  - `CatmullRom` — smooth through all points
  - `Linear` — angled segments
  - `Straight` — orthogonal/rectilinear
- **Smart routing** (`edges/EditableEdge/path/smart.ts`) — obstacle-avoidance path that routes around other nodes (A*-inspired grid walk)
- **Edge bundling** — parallel edges between the same node pair are detected and rendered with lateral offsets; curvature scales with edge count
- **Condition labels with icons** — `node.data.conditionType: "yes" | "no" | "true" | "false" | "success" | "error" | "default" | null`; colored pill badge rendered alongside edge label
- Edge label (double-click to add/edit; draggable via GSAP)
- Arrow styles: `"end" | "start" | "both" | "none"`
- Line styles: solid, dashed, animated dotted
- Animated moving ball (with direction control)
- 7 preset stroke colors
- Stroke width customizable (1/2/3 px from header)

**ControlPoint** (`edges/EditableEdge/ControlPoint.tsx`):
- Draggable circles on edge path
- Keyboard: arrow keys to move, Delete to remove, Space to toggle
- Right-click to delete
- Black/white color scheme (`stroke: #1a1a1a`)

### FlowHeader Toolbar

**Left section:** Menu button, editable diagram title, "SyncFlow" subtitle
**Middle section (desktop only):**
- Font family dropdown (Inter, Roboto, Poppins, Georgia, Arial, Courier New)
- Font size dropdown (10–32px)
- B / I / U toggles (with Ctrl+B/I/U shortcuts)
- Text color picker + fill color picker
- Stroke width selector (edge styling)
- Text alignment (left / center / right)
- List formatting (bullet / numbered / checklist / clear)
**Right section:** Cursor mode toggle (Select/Pan), collaborator avatars, **Templates button** (opens TemplateModal), **Vote button**, Share button

**Dropdown positioning:** All dropdowns (ColorPicker, FillColorPicker, font family, font size, stroke width) use `getBoundingClientRect()` on the trigger button and render with `position: fixed` + explicit `top/left` coordinates. This avoids clipping by `overflow-x: auto` on the toolbar container.

### Vote Panel (`VotePanel.tsx`)

Flow-level collaborative voting, opened from FlowHeader Vote button:
- Vote types: **Approve** (green), **Needs Review** (amber), **Reject** (red)
- Current user vote stored in `localStorage` key `syncspace-diagram-votes` (`FlowVote[]`)
- Mock pre-seeded votes: John Berkley → Approve, Alice Smith → Needs Review
- Animated progress bars per vote type
- Who-voted list showing all collaborators with online status dots
- Click active vote to retract it; click-outside-to-close

### Edge Toolbar

Horizontal floating bar at top-center when edge is selected:
- 7 color swatches with ring selection
- 4 path algorithm buttons (including Smart routing)
- 3 line style buttons (solid/dashed/animated)
- 4 arrow direction buttons
- Moving ball toggle + direction
- Label text input
- Condition type selector (Yes/No/True/False/Success/Error/Default/None)
- Close button

### Node Locking System

All node types support locking. State stored in `node.data.locked` + ReactFlow's native `node.draggable`/`node.deletable`.

**Lock behavior:**
- `node.draggable = false` — node cannot be moved
- `node.deletable = false` — Delete/Backspace key ignored
- `node.data.lockedPosition: {x, y}` — position snapshot taken at lock time
- `onNodesChange` in `useDiagram` filters position/dimension changes for locked nodes AND force-restores their `position` after every `applyNodeChanges` call (fixes ReactFlow uncontrolled-mode drift)
- `updateNodesStyle` skips locked nodes (style toolbar has no effect)
- All inline editing (text, caption, label, cells) blocked via `&& !locked` guards
- `useEffect([locked])` in each node component exits any active editing session when locked
- Amber lock badge (top-left interior) always visible when node is locked
- Amber/gray lock toggle button appears top-left when node is selected

### Flow Sidebar (`Sidebar/Sidebar.tsx` + `SidebarItem.tsx`)

Compact Miro-style shapes palette (left panel, auto-collapses on mobile):
- Shared `TILE` and `TILE_LABEL` CSS token strings for uniform dark tile appearance across all items
- **Shapes section:** 2-column grid of `SidebarItem` tiles — each shows a 34×34 SVG preview of the shape + short label; draggable via HTML5 drag API with off-screen ghost image
- **Sticky Notes section:** 5 color tiles showing a 28×28 colored note preview with fold corner + ruled lines; drag sets `"sticky-note-color"` on `dataTransfer`
- **Elements section:** 2-column grid — Table tile (SVG grid preview) + Image upload button (triggers file input)
- `SHAPE_LABELS` record maps shape type keys to display labels

### Templates System (`src/app/components/flow/templates/`)

Miro/FigJam-style template picker, triggered from FlowHeader **Templates** button:

**`templateData.ts`:**
- `Template` type: `{ id, title, category, description, preview (emoji), tags, data: { nodes, edges } }`
- `TEMPLATE_CATEGORIES`: All, AI, Agile, Brainstorming, Processes, Meetings, Planning, Research, Systems
- `TEMPLATES` array: 8 built-in templates — Blank Canvas, Mind Map, Basic Flowchart, Sprint Planning, Meeting Notes, System Architecture, User Journey, AI Pipeline
- All shape nodes use `type: "shape"` with `data: { type: ShapeType, text, fill, color }`; sticky notes use `type: "sticky-note"` with `data: { text, color }`
- `RECOMMENDED_IDS`, `POPULAR_IDS` — curated lists for sectioned display

**`useTemplateStore.ts`** (`src/app/store/useTemplateStore.ts`):
- Zustand store: `isOpen`, `selectedCategory`, `searchQuery`, `recentIds`
- `openModal()` resets category to "All" and clears search
- `addRecent(id)` prepends id, caps at 6, persists to localStorage key `"syncspace-recent-templates"`
- `loadRecentsFromStorage()` — call on mount in DiagramFrame

**`TemplateCard.tsx`:** Tile with `h-28` emoji preview area, per-template colored background, category badge overlay, title + description footer. Hover: `scale-[1.02]` + blue border glow.

**`TemplateModal.tsx`:**
- `fixed inset-0 z-[200]` backdrop with blur; `max-w-5xl max-h-[88vh]` panel
- Left sidebar (`w-44`): category buttons with active (`bg-blue-600/20 text-blue-400`) / inactive states
- Right content: when not searching + "All" selected → sectioned (Recommended / Recently Used / Popular / All Templates); when searching → flat filtered grid; when category selected → flat section
- `handleApply`: calls `diagram.takeSnapshot()` (undo point) → `diagram.uploadJson(JSON.stringify(template.data))` → saves to localStorage `"syncspace-diagram"` → `store.addRecent(id)` → `store.closeModal()`
- ESC key closes; click backdrop closes
- DiagramFrame mounts `<TemplateModal diagram={diagram} />` and passes `onOpenTemplates={templateStore.openModal}` to FlowHeader

### Multiplayer Cursors (`CursorOverlay.tsx`)

**Currently hidden — pending backend integration.**

Implementation ready:
- 3 mock collaborators (John Berkley #3b82f6, Alice Smith #22c55e, Bob Wilson #a855f7)
- Random-walk animation every 700ms, clamped to canvas bounds
- SVG cursor arrow (filled in collaborator color) + name chip
- `pointer-events: none` absolute overlay sibling to `<ReactFlow>`
- CSS transitions (`left 0.6s ease, top 0.6s ease`) for smooth movement
- To enable: uncomment import + `<CursorOverlay />` in `DiagramFrame.tsx`

### Keyboard Shortcuts

| Keys | Action |
|------|--------|
| Ctrl+C/V | Copy/paste selected nodes |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+A | Select all |
| Ctrl+B/I/U | Bold/italic/underline on selected nodes |
| Delete/Backspace | Delete selected |
| Shift+F | Zoom to fit selection |
| G | Group selected nodes (2+) |
| Space + drag | Free-draw connection line |
| ? or Ctrl+/ | Toggle shortcuts panel |

### Main Diagram Hook (`src/app/hooks/useDiagram.tsx`)

Central hook managing all flow interactions:
- **Selection:** `selectedNodes`, `selectedEdges` (via `useStore` + `shallow`)
- **Style updates:** `updateNodesStyle(style)`, `updateEdgesStyle(style)` — spread into `node.data` / `edge.style`
- **Clipboard:** `copySelection()`, `pasteSelection()` (offset +40px)
- **Grouping:** `groupSelectedNodes()` — creates GroupNode enclosing selection
- **Connection:** `onConnect`, `onConnectStart`, `onConnectEnd` — free-draw via Space+drag
- **Persistence:** localStorage auto-save, JSON import/export via `uploadJson(jsonString)` — calls `setNodes` + `setEdges` internally; used by TemplateModal to apply templates
- **Undo/Redo:** via `useUndoRedo` hook (100-item history); `takeSnapshot()` is exposed in return object for external use (e.g. TemplateModal calls it before applying a template)
- **Sticky note drop color:** reads `evt.dataTransfer.getData("sticky-note-color")` in `onDrop` to preserve the dragged color (falls back to `"#fef9c3"`)
- **Helper lines:** snap-to-grid alignment guides during drag
- **Edge editing:** `editingEdgeId` / `setEditingEdgeId` for edge toolbar

---

## Hooks Reference

| Hook | File | Purpose |
|------|------|---------|
| `useTheme` | `useTheme.tsx` | Dark mode: reads/writes localStorage, syncs `.dark` class |
| `useDiagram` | `useDiagram.tsx` | All flow canvas state and actions |
| `useUndoRedo` | `useUndoRedo.tsx` | Undo/redo history (100 max) |
| `useHelperLines` | `useHelperLines.tsx` | Snap-to-grid alignment guides |
| `useEditMode` | `useEditMode.ts` | Role-based permissions (`"owner" | "editor" | "viewer"`) — hardcoded to `"owner"` |
| `useWindowSize` | `useWindowSize.tsx` | `[width, height]` of viewport |
| `useTouchDevice` | `useTouchDevice.ts` | Touch detection via `matchMedia('(pointer: coarse)')` |
| `useLocalStorage` | `useLocalStorage.tsx` | Generic localStorage hook |
| `useDraggableEdgeLabel` | `useDraggableEdgeLabel.tsx` | GSAP-based draggable edge labels |

---

## Permission System

`useEditMode(role)` returns `EditPermissions`:
```typescript
type UserRole = "owner" | "editor" | "viewer";
interface EditPermissions {
  canEditBoardMetadata: boolean;  // owner only
  canEditTasks: boolean;          // owner or editor
  canDeleteTasks: boolean;        // owner only
  canReorderTasks: boolean;       // owner or editor
}
```
Currently hardcoded to `"owner"` — replace with real auth when backend is integrated.

---

## Platform Detection

`src/app/lib/platformIcons.ts` — detects platform from URL (GitHub, Figma, Notion, Google Docs/Sheets/Slides, Jira, Confluence, Linear, Slack, etc.) and returns icon + color info for the linked resources panel.

---

## Mobile Responsiveness (In Progress)

**Current state:**
- Dashboard nav: hidden on mobile with hamburger toggle
- Board panels: collapse by default on mobile, overlay on open
- Flow canvas:
  - Shapes sidebar: auto-collapses on `< 768px`, floating toggle button at bottom-left
  - MiniMap: hidden on mobile
  - Controls panel: repositions to bottom-right on mobile
  - FlowHeader: formatting toolbar hidden on mobile
  - Mobile floating toolbar: appears at bottom when nodes selected (B/I/U, colors, alignment)
  - Touch-friendly handles: 16px on `@media (pointer: coarse)` with expanded touch targets
  - Keyboard shortcuts: hidden on mobile

**Planned but not yet implemented:**
- `useTapToEdit` hook (tap-to-select → tap-again-to-edit, replacing double-click)
- Bottom sheet for shapes palette (replacing side drawer)
- Touch-friendly color dots (larger on touch)
- Edge toolbar responsive scrolling
- Tablet condensed toolbar with overflow popover

---

## File Structure Overview

```
src/app/
├── layout.tsx                        # Root layout (ThemeProvider + SessionProvider)
├── globals.css                       # CSS vars, dark mode, Tailwind v4 config
├── page.tsx                          # Landing page
├── dashboard/
│   ├── layout.tsx                    # Nav sidebar + main grid
│   ├── page.tsx                      # Dashboard home
│   ├── boards/
│   │   ├── page.tsx                  # Board listing
│   │   ├── AddBoardModal.tsx
│   │   └── [boardid]/
│   │       ├── layout.tsx            # 3-pane board layout
│   │       ├── page.tsx              # BoardTaskFlow
│   │       └── tasks/page.tsx        # Full-screen diagram
│   ├── history/page.tsx
│   ├── notifications/page.tsx
│   ├── organization/                 # Org settings sub-pages
│   ├── profile/page.tsx
│   └── settings/page.tsx
├── flow/page.tsx                     # Standalone flow editor
├── components/
│   ├── flow/                         # ← Entire flow canvas system
│   │   ├── DiagramFrame.tsx
│   │   ├── FlowHeader/FlowHeader.tsx
│   │   ├── Sidebar/Sidebar.tsx, SidebarItem.tsx
│   │   ├── nodes/ShapeNode.tsx, StickyNoteNode.tsx, GroupNode.tsx
│   │   ├── edges/EditableEdge/, ConnectionLine.tsx, MarkerDefinition.tsx
│   │   ├── EdgeToolbar/EdgeToolbar.tsx
│   │   ├── ColorPicker.tsx, FillColorPicker.tsx
│   │   ├── templates/templateData.ts, TemplateCard.tsx, TemplateModal.tsx
│   │   ├── Menu.tsx, About.tsx, KeyboardShortcuts.tsx
│   │   ├── nodeStyles.css, store.ts
│   │   └── HelperLines/, JsonViewer/, Downloads/, minimap-node/
│   ├── kanban/                       # DraggableTaskCard, DroppableColumn
│   ├── analytics-charts/             # Recharts components
│   ├── BoardSidebar.tsx, BoardTaskFlow.tsx, BoardLinkedResources.tsx
│   ├── TaskModal.tsx, EditableText.tsx, SelectPopover.tsx, Popover.tsx
│   └── ThemeProvider.tsx, Skeleton.tsx, etc.
├── store/                            # Zustand stores
├── hooks/                            # All custom hooks
├── icons/                            # Custom SVG icon components
├── lib/                              # platformIcons.ts
└── shape/                            # SVG shape definitions (9 shapes)
```

---

## Design Conventions

- **Component naming:** PascalCase.tsx
- **Stores:** `useStoreName.ts`
- **Hooks:** `useHookName.ts`
- **Dark mode:** always include `dark:` variants in Tailwind classes
- **Node data vs style:** font/text properties stored in `node.data` (not `node.style`). The `updateNodesStyle` function maps `backgroundColor` → `data.fill`.
- **Save state pattern:** per-field optimistic updates with `"idle" | "loading" | "success" | "error"` keyed by `"${id}-${field}"`
- **No tests configured** — verify via `npm run dev` + browser
- **No backend** — all async operations are simulated delays in stores
- **Sidebar tile system:** use shared `TILE` and `TILE_LABEL` CSS token strings (defined in `Sidebar.tsx`) for any new shape/element tiles to stay visually consistent

---

## Known Gotchas & Past Fixes

### Dropdown clipping in FlowHeader
`overflow-x: auto` on the toolbar container clips absolutely-positioned children. All dropdowns (ColorPicker, FillColorPicker, font family, font size, stroke width) must use `position: fixed` with coordinates derived from `buttonRef.current.getBoundingClientRect()`. Never use `position: absolute` + `top: 100%` inside the toolbar.

### TDZ errors in node components (ImageNode, StickyNoteNode)
`const locked = !!data.locked` must be declared **before** any `useState` or `useEffect` that references it. React function component bodies execute top-to-bottom; placing `const` after a hook that captures it triggers a Temporal Dead Zone error.

### Sticky note drop color
`onDrop` in `useDiagram.tsx` reads `"sticky-note-color"` from `dataTransfer`. The `SidebarItem` for sticky notes must call `evt.dataTransfer.setData("sticky-note-color", color)` in its `onDragStart`. Do not hardcode the color in `onDrop`.

### `takeSnapshot` must be in useDiagram return object
`takeSnapshot` is destructured from `useUndoRedo()` inside `useDiagram.tsx`. It is used internally AND must be included in the hook's return object so external callers (e.g. `TemplateModal`) can create undo points before destructive operations.

### Template apply uses `uploadJson`
`diagram.uploadJson(JSON.stringify(template.data))` is the correct way to apply a template — it already calls `setNodes` + `setEdges` internally. Always call `diagram.takeSnapshot()` first to create an undo point.

---

## Backend API Contract

> **For Go backend developers:** This section is the complete specification of every API endpoint the frontend needs, derived directly from the Zustand stores and component data operations. All async store actions currently use `setTimeout(..., 300ms)` mocks — replace each with the corresponding `fetch` call below.

### Base URL Convention

```
/api/v1/
```

All endpoints are prefixed with `/api/v1/`. All request and response bodies are JSON. All protected endpoints require `Authorization: Bearer <jwt_token>` header.

---

### Auth Strategy

The frontend uses **NextAuth.js** with Google + GitHub OAuth providers. Backend must:

1. Accept OAuth callback and issue a **JWT** (recommended) or session cookie
2. Expose a token endpoint for email/password login
3. All protected routes return **401 Unauthorized** on invalid/expired token; frontend will clear session and redirect to `/signin`

**OAuth flow:**
```
Frontend → NextAuth → [Google|GitHub] OAuth → NextAuth callback → Backend token exchange → JWT returned to client
```

**Auth header (all protected routes):**
```
Authorization: Bearer <jwt_token>
```

---

### Canonical TypeScript Types

These are the exact types from the frontend stores and components. The Go backend structs must match these field names and types exactly.

```typescript
// ─── Auth ──────────────────────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;         // URL
  createdAt: string;       // ISO 8601
}

interface AuthResponse {
  user: User;
  token: string;           // JWT
}

// ─── Organizations ─────────────────────────────────────────────────────────

interface Organization {
  id: string;
  name: string;
  memberCount: number;
  boardCount: number;
}

type OrgRole = "owner" | "admin" | "member" | "viewer";
type MemberStatus = "active" | "invited" | "suspended";

interface Member {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: MemberStatus;
}

// ─── Boards ────────────────────────────────────────────────────────────────

type BoardStatus = "active" | "on-hold" | "archived";

interface BoardTag {
  label: string;
  color: string;           // hex e.g. "#2563EB"
  textColor: string;       // contrasting hex e.g. "#ffffff"
}

interface Board {
  id: string;
  title: string;
  description: string;
  owner: string;           // user id
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  tags: BoardTag[];
  status: BoardStatus;
  coverColor: string;      // hex
  memberCount?: number;    // optional summary field for board listing
}

// ─── Board Tasks ───────────────────────────────────────────────────────────

type TaskPriority = "high" | "medium" | "low";

// Board stages/columns (ordered):
// "Planning" | "Design" | "Development" | "QA" | "Deployment"

interface BoardTask {
  id: string;
  boardId: string;
  stage: string;           // one of the stage names above
  title: string;
  tags: string[];          // e.g. ["Marketing > Research", "External"]
  startDate: string;       // "YYYY-MM-DD"
  endDate: string;         // "YYYY-MM-DD"
  assignee: string;        // user name or id
  priority: TaskPriority;
  comments: number;        // count
  attachments: number;     // count
  flagged: boolean;
}

// ─── Linked Resources ──────────────────────────────────────────────────────

interface LinkedResource {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;          // hex
}

interface BoardLinkedResources {
  boardId: string;
  description: string;
  documentationLinks: LinkedResource[];
  links: LinkedResource[];
}

// ─── Notifications ─────────────────────────────────────────────────────────

interface NotificationSettings {
  comments: boolean;
  invites: boolean;
  productUpdates: boolean;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;       // ISO 8601
}

// ─── Activity / History ────────────────────────────────────────────────────

interface ActivityEvent {
  id: string;
  actor: string;           // user name
  action: string;          // e.g. "created board", "moved task"
  target: string;          // entity name
  boardId?: string;
  createdAt: string;       // ISO 8601
}

// ─── Diagrams (Flow Canvas) ────────────────────────────────────────────────

type ShapeType =
  | "circle" | "round-rectangle" | "rectangle" | "hexagon"
  | "diamond" | "arrow-rectangle" | "cylinder" | "triangle" | "parallelogram";

type Algorithm = "smart" | "straight" | "linear" | "catmull-rom" | "bezier";

type ConditionType = "yes" | "no" | "true" | "false" | "success" | "error" | "default" | null;

interface NodeComment {
  id: string;
  author: string;
  text: string;
  createdAt: number;       // Unix epoch ms
  resolved: boolean;
}

// ShapeNode data (node.type = "shape")
interface ShapeNodeData {
  type: ShapeType;
  text?: string;
  fill?: string;           // background hex
  color?: string;          // text hex
  fontSize?: string;       // e.g. "14px"
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
  listType?: "bullet" | "numbered" | "checklist" | null;
  checkedItems?: boolean[];
  locked?: boolean;
  lockedPosition?: { x: number; y: number };
  comments?: NodeComment[];
}

// StickyNoteNode data (node.type = "sticky-note")
interface StickyNoteData {
  text: string;
  color?: string;          // background hex
  textAlign?: "left" | "center" | "right";
  listType?: "bullet" | "numbered" | "checklist" | null;
  checkedItems?: boolean[];
  locked?: boolean;
  lockedPosition?: { x: number; y: number };
  comments?: NodeComment[];
}

// GroupNode data (node.type = "group")
interface GroupNodeData {
  label?: string;
  color?: string;          // hex, semi-transparent bg = color + "10"
  locked?: boolean;
  comments?: NodeComment[];
}

// ImageNode data (node.type = "image")
interface ImageNodeData {
  src: string;             // URL
  caption?: string;
  locked?: boolean;
  comments?: NodeComment[];
}

// TableNode data (node.type = "table")
interface TableNodeData {
  cells: string[][];       // [row][col], default 3x3
  hasHeader: boolean;
  borderColor?: string;
  headerBg?: string;
  locked?: boolean;
  comments?: NodeComment[];
}

interface ControlPointData {
  id: string;
  x: number;
  y: number;
  active?: boolean;
}

// EditableEdge data (edge.type = "editable-edge")
interface EditableEdgeData {
  algorithm?: Algorithm;
  points: ControlPointData[];
  animation?: string;
  animationDirection?: string;
  showMovingBall?: boolean;
  arrowStyle?: "end" | "start" | "both" | "none";
  labelPosition?: number;
  title?: string;
  conditionType?: ConditionType;
  locked?: boolean;
}

// Full diagram snapshot (stored in DB and sent over wire)
interface DiagramNode {
  id: string;
  type: "shape" | "sticky-note" | "group" | "image" | "table";
  position: { x: number; y: number };
  data: ShapeNodeData | StickyNoteData | GroupNodeData | ImageNodeData | TableNodeData;
  draggable?: boolean;
  deletable?: boolean;
  style?: Record<string, string | number>;
  zIndex?: number;
  measured?: { width: number; height: number };
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: "editable-edge";
  data?: EditableEdgeData;
  selected?: boolean;
  animated?: boolean;
  style?: Record<string, string | number>;
  markerEnd?: { type: string; color?: string };
  markerStart?: { type: string; color?: string };
}

interface Diagram {
  id: string;
  title: string;
  boardId?: string;        // null for standalone /flow diagrams
  ownerId: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

// ─── Voting ────────────────────────────────────────────────────────────────

type VoteType = "approve" | "review" | "reject";

interface FlowVote {
  userId: string;
  name: string;
  vote: VoteType;
}

// ─── Permissions ───────────────────────────────────────────────────────────

type BoardRole = "owner" | "editor" | "viewer";

interface EditPermissions {
  canEditBoardMetadata: boolean;   // owner only
  canEditTasks: boolean;           // owner or editor
  canDeleteTasks: boolean;         // owner only
  canReorderTasks: boolean;        // owner or editor
}
```

---

### API Endpoints

#### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/signup` | No | Register with email/password |
| `POST` | `/api/v1/auth/signin` | No | Login with email/password |
| `GET` | `/api/v1/auth/me` | Yes | Get current user from JWT |
| `POST` | `/api/v1/auth/oauth/callback` | No | OAuth token exchange (Google/GitHub) |

**POST /auth/signup**
```json
Request:  { "name": "string", "email": "string", "password": "string" }
Response: { "user": User, "token": "string" }
```

**POST /auth/signin**
```json
Request:  { "email": "string", "password": "string" }
Response: { "user": User, "token": "string" }
```

**GET /auth/me**
```json
Response: { "user": User }
```

---

#### Users / Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/users/me` | Yes | Get user profile |
| `PATCH` | `/api/v1/users/me` | Yes | Update profile fields |
| `GET` | `/api/v1/users/me/notifications/settings` | Yes | Get notification prefs |
| `PATCH` | `/api/v1/users/me/notifications/settings` | Yes | Update notification prefs |

**PATCH /users/me**
```json
Request:  { "name": "string", "bio": "string", "avatar": "url_string" }
Response: { "user": User }
```

**PATCH /users/me/notifications/settings**
```json
Request:  { "comments": true, "invites": true, "productUpdates": false }
Response: { "settings": NotificationSettings }
```

---

#### Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/organizations/me` | Yes | Get org info |
| `PATCH` | `/api/v1/organizations/me` | Yes | Update org name |
| `GET` | `/api/v1/organizations/me/members` | Yes | List members |
| `POST` | `/api/v1/organizations/me/members/invite` | Yes | Invite member by email |
| `PATCH` | `/api/v1/organizations/me/members/:memberId` | Yes | Update role or status |
| `DELETE` | `/api/v1/organizations/me/members/:memberId` | Yes | Remove member |

**POST /organizations/me/members/invite**
```json
Request:  { "email": "string", "role": "admin" | "member" | "viewer" }
Response: { "member": Member }
```

**PATCH /organizations/me/members/:memberId**
```json
Request:  { "role": OrgRole?, "status": MemberStatus? }
Response: { "member": Member }
```

---

#### Boards

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/boards` | Yes | List all boards (current user's org) |
| `POST` | `/api/v1/boards` | Yes | Create board |
| `GET` | `/api/v1/boards/:boardId` | Yes | Get board metadata |
| `PATCH` | `/api/v1/boards/:boardId` | Yes | Update board (full metadata) |
| `PATCH` | `/api/v1/boards/:boardId/title` | Yes | Update title only (optimistic) |
| `PATCH` | `/api/v1/boards/:boardId/description` | Yes | Update description only (optimistic) |
| `DELETE` | `/api/v1/boards/:boardId` | Yes | Delete board |

**POST /boards**
```json
Request:  { "title": "string", "description": "string", "coverColor": "#hex" }
Response: { "board": Board }
```

**PATCH /boards/:boardId**
```json
Request:  {
  "title": "string",
  "description": "string",
  "tags": BoardTag[],
  "status": "active" | "on-hold" | "archived",
  "coverColor": "#hex"
}
Response: { "board": Board }
```

**PATCH /boards/:boardId/title**
```json
Request:  { "title": "string" }
Response: { "board": { "id": "...", "title": "..." } }
```

**PATCH /boards/:boardId/description**
```json
Request:  { "description": "string" }
Response: { "board": { "id": "...", "description": "..." } }
```

---

#### Board Tasks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/boards/:boardId/tasks` | Yes | List all tasks for a board |
| `POST` | `/api/v1/boards/:boardId/tasks` | Yes | Create task |
| `PATCH` | `/api/v1/boards/:boardId/tasks/:taskId/title` | Yes | Update title (optimistic) |
| `PATCH` | `/api/v1/boards/:boardId/tasks/:taskId/priority` | Yes | Update priority (optimistic) |
| `PATCH` | `/api/v1/boards/:boardId/tasks/:taskId/dates` | Yes | Update date range (optimistic) |
| `PATCH` | `/api/v1/boards/:boardId/tasks/:taskId/assignee` | Yes | Update assignee (optimistic) |
| `PATCH` | `/api/v1/boards/:boardId/tasks/:taskId/stage` | Yes | Move between stages (optimistic) |
| `DELETE` | `/api/v1/boards/:boardId/tasks/:taskId` | Yes | Delete task |

> **Save state key pattern:** The frontend tracks per-field save state with key `"${taskId}-${field}"` — e.g. `"task-1-title"`. Each `PATCH` above maps to one field key.

**POST /boards/:boardId/tasks**
```json
Request:  {
  "stage": "Planning",
  "title": "string",
  "tags": ["string"],
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "assignee": "string",
  "priority": "high" | "medium" | "low",
  "flagged": false
}
Response: { "task": BoardTask }
```

**PATCH /boards/:boardId/tasks/:taskId/title**
```json
Request:  { "title": "string" }
Response: { "task": { "id": "...", "title": "..." } }
```

**PATCH /boards/:boardId/tasks/:taskId/priority**
```json
Request:  { "priority": "high" | "medium" | "low" }
Response: { "task": { "id": "...", "priority": "..." } }
```

**PATCH /boards/:boardId/tasks/:taskId/dates**
```json
Request:  { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
Response: { "task": { "id": "...", "startDate": "...", "endDate": "..." } }
```

**PATCH /boards/:boardId/tasks/:taskId/assignee**
```json
Request:  { "assignee": "string" }
Response: { "task": { "id": "...", "assignee": "..." } }
```

**PATCH /boards/:boardId/tasks/:taskId/stage**
```json
Request:  { "stage": "string" }
Response: { "task": { "id": "...", "stage": "..." } }
```

---

#### Linked Resources

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/boards/:boardId/resources` | Yes | Get board's linked resources |
| `PATCH` | `/api/v1/boards/:boardId/resources` | Yes | Save all linked resources |

**GET /boards/:boardId/resources**
```json
Response: {
  "description": "string",
  "documentationLinks": LinkedResource[],
  "links": LinkedResource[]
}
```

**PATCH /boards/:boardId/resources**
```json
Request:  {
  "description": "string",
  "documentationLinks": LinkedResource[],
  "links": LinkedResource[]
}
Response: { "resources": BoardLinkedResources }
```

---

#### Diagrams (Flow Canvas)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/diagrams/:diagramId` | Yes | Load diagram (nodes + edges) |
| `PUT` | `/api/v1/diagrams/:diagramId` | Yes | Full save (title + nodes + edges) |
| `POST` | `/api/v1/diagrams` | Yes | Create new blank diagram |
| `DELETE` | `/api/v1/diagrams/:diagramId` | Yes | Delete diagram |
| `GET` | `/api/v1/diagrams/:diagramId/votes` | Yes | Get all votes |
| `POST` | `/api/v1/diagrams/:diagramId/votes` | Yes | Cast or update vote |
| `DELETE` | `/api/v1/diagrams/:diagramId/votes/me` | Yes | Retract current user's vote |

> **Important:** `nodes` and `edges` are stored as JSON blobs. The Go backend should treat them as `jsonb` (Postgres) — no need to parse individual node fields.

**GET /diagrams/:diagramId**
```json
Response: { "diagram": Diagram }
```

**PUT /diagrams/:diagramId**
```json
Request:  {
  "title": "string",
  "nodes": DiagramNode[],
  "edges": DiagramEdge[]
}
Response: { "diagram": Diagram }
```

**POST /diagrams**
```json
Request:  { "title": "string", "boardId": "string?" }
Response: { "diagram": Diagram }
```

**POST /diagrams/:diagramId/votes**
```json
Request:  { "vote": "approve" | "review" | "reject" }
Response: { "votes": FlowVote[] }
```

**GET /diagrams/:diagramId/votes**
```json
Response: { "votes": FlowVote[] }
```

---

#### Activity / History

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/activity` | Yes | User's activity feed (paginated) |
| `GET` | `/api/v1/boards/:boardId/activity` | Yes | Board-scoped activity |

**Query params:** `?page=1&limit=20`

```json
Response: {
  "events": ActivityEvent[],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

#### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/notifications` | Yes | List notifications |
| `PATCH` | `/api/v1/notifications/:id/read` | Yes | Mark one as read |
| `POST` | `/api/v1/notifications/read-all` | Yes | Mark all as read |

**GET /notifications**
```json
Response: { "notifications": Notification[], "unreadCount": 3 }
```

---

### localStorage → API Migration Map

These are all current localStorage usages in the frontend and their backend replacement:

| localStorage Key | Current Use | Replace With |
|---|---|---|
| `syncspace-diagram` | Auto-save current diagram | `PUT /api/v1/diagrams/:id` |
| `syncspace-diagram-votes` | Store diagram votes | `GET/POST/DELETE /api/v1/diagrams/:id/votes` |
| `syncspace-recent-templates` | Track recently used templates | Keep local (no backend needed — UI state only) |
| `theme` | Light/dark mode preference | Keep local (user device preference) |

---

### Store → API Mapping

| Zustand Store | Mock Operation | Real API Call |
|---|---|---|
| `useBoardStore.updateBoardTitle()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/title` |
| `useBoardStore.updateBoardDescription()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/description` |
| `useBoardStore.updateBoardDetails()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId` |
| `useBoardTaskStore.updateTaskTitle()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/tasks/:taskId/title` |
| `useBoardTaskStore.updateTaskPriority()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/tasks/:taskId/priority` |
| `useBoardTaskStore.updateTaskDates()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/tasks/:taskId/dates` |
| `useBoardTaskStore.updateTaskAssignee()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/tasks/:taskId/assignee` |
| `useBoardTaskStore.updateTaskStage()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/tasks/:taskId/stage` |
| `useLinkedResourcesStore.saveLinkedResources()` | `setTimeout 300ms` | `PATCH /api/v1/boards/:boardId/resources` |
| `useDiagram` (localStorage auto-save) | localStorage write | `PUT /api/v1/diagrams/:id` |

---

### Error Response Format

All endpoints should return errors in this shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "fields": { "title": "required" }
  }
}
```

HTTP status codes:
- `200 OK` — success
- `201 Created` — resource created
- `400 Bad Request` — validation error
- `401 Unauthorized` — missing/invalid JWT
- `403 Forbidden` — insufficient role
- `404 Not Found` — resource doesn't exist
- `500 Internal Server Error` — server error

---

### Save State Pattern (Frontend Behavior)

The frontend uses per-field optimistic save states to show inline feedback. For every `PATCH` call, the frontend:

1. Sets `saveStates["${id}-${field}"] = "loading"`
2. Makes the API call
3. On `2xx` → sets state to `"success"` for 1.5s, then resets to `"idle"`
4. On error → sets state to `"error"`, reverts optimistic update

The backend just needs standard HTTP status codes — the frontend handles the UI feedback.

---

### Multiplayer / Real-Time (Future)

The following features are implemented in the frontend but currently use mock data — they require a real-time backend (WebSockets or SSE):

| Feature | Current State | Backend Requirement |
|---|---|---|
| `CursorOverlay` — live collaborator cursors | Hidden (mock random walk) | WebSocket: broadcast `{ userId, x, y }` events per diagram |
| Diagram vote sync | localStorage only | Already has REST endpoints above; add WebSocket push for live updates |
| Presence indicators | Hardcoded `isOnline: true/false` | WebSocket: user join/leave events per diagram room |

To enable `CursorOverlay`: uncomment its import in `DiagramFrame.tsx` and replace the random-walk animation with WebSocket position events.
