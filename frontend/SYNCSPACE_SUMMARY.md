# SyncSpace Frontend — Complete Technical Summary

> Use this document as context for Claude Desktop sessions to discuss features, architecture decisions, and plan new development.

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
**Right section:** Cursor mode toggle (Select/Pan), collaborator avatars, **Vote button**, Share button

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
- **Persistence:** localStorage auto-save, JSON import/export
- **Undo/Redo:** via `useUndoRedo` hook (100-item history)
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
