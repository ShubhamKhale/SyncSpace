# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server with Turbopack (Next.js, port 3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
npm run start    # Start production server
```

`npm run dev` uses `--turbopack` for fast on-demand compilation (~3–8s first route, <100ms subsequent).
No test runner is configured. This is NOT a pure mock app — it's a client for a separate external backend (REST API + WebSocket service), not a full-stack Next.js app with its own API routes.

### Backend Integration

- **REST API**: `src/lib/api.ts` — `apiFetch`/`apiDelete`/`encryptedFetch` wrappers. JWT bearer auth read from localStorage (`ss_jwt`), auto-redirect to `/signin` on 401, `storeAuthTokens`/`clearAuthTokens`/`isAuthenticated` helpers. Base URL: `NEXT_PUBLIC_API_BASE` (default `http://localhost:8080`).
- **Payload encryption**: `src/lib/crypto.ts` — AES-GCM via Web Crypto API (12-byte nonce + ciphertext + GCM tag, base64 wire format). `encryptedFetch` uses this for sensitive payloads (onboarding, boards list).
- **WebSocket**: `src/lib/wsClient.ts` — hand-rolled client with auto-reconnect/exponential backoff (doubling up to 30s), message queueing while disconnected, JWT-in-query-string auth. Base URL: `NEXT_PUBLIC_WS_BASE` (default `ws://localhost:8068`).
- **Auth**: `src/pages/api/auth/[...nextauth].ts` (legacy Pages Router, coexists with App Router) configures NextAuth with GitHub + Google OAuth. Used on `/signin` and `/signup` alongside email/password.
- No `src/app/api/**` route handlers and no `middleware.ts` exist — this NextAuth handler is the only API route in the repo.

### Real-Time Collaboration

- `src/app/hooks/useFlowPresence.ts` — WebSocket-based presence: live participant list, cursor positions, presenter tracking, throttled updates. Exposes `Participant`/`PresenterInfo` and `onDiagramUpdated`/`onPresentationSlide`/`onPresentationStopped` callbacks.
- `src/app/components/flow/CursorOverlay.tsx` — renders other users' live cursors on the canvas (rAF-driven, viewport-aware).
- `src/app/components/flow/VotePanel.tsx` — real-time voting on a diagram (approve/needs-review/reject), synced over WS, shows per-participant vote.
- `src/app/components/flow/PresentationMode.tsx` — presenter mode: step through nodes as "slides" (prev/next/exit), synced to viewers via `useFlowPresence`.

### AI Diagram Generation

Backend-proxied, web-search-grounded — `POST /api/ai/generate-diagram` (Go backend calls Groq's `groq/compound` model with built-in web search, returns a `LogicalGraph` JSON):
- `src/app/lib/diagram-validator/` — validates the backend's `LogicalGraph` JSON structure (`{ title, nodes, edges }`).
- `src/app/lib/layout/` — `assignPositions()`, auto-layout for generated nodes.
- `src/app/lib/reactflow-converter/` — `convertToReactFlow()`, converts logical graph to React Flow nodes/edges.
- `src/app/components/ai/AiDiagramPanel.tsx` — "Generate diagram with AI" side panel (prompt input, generating/error states, Esc + click-outside to close); calls the backend via `apiFetch`, injects result via `diagram.uploadJson()`. Supporting UI: `PromptInput.tsx`, `GenerationProgress.tsx`.

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, NOT via `tailwind.config.js`
- **Zustand v5** — all client state
- **@xyflow/react** (v12) — flow/diagram canvas. Note: `reactflow` v11 is also still installed (partial migration leftover) — use `@xyflow/react` for new code.
- **@dnd-kit** (`core`/`modifiers`/`sortable`/`utilities`) — kanban drag-and-drop, including sortable/reorderable pipeline-stage columns, not just card dragging
- **Recharts** — analytics charts (`BoardActivity`, `TaskCompletionTrend`, `TaskDistribution`, `TeamContribution`, `PriorityPhaseMatrix`)
- **react-markdown** + **remark-gfm** — renders AI chat/summarize/diagram-gen responses (tables, lists, bold) in `BoardAiChat.tsx`/`SummarizeModal.tsx`
- **gsap** (+ Draggable plugin) — draggable edge labels on the flow canvas
- **html-to-image** — PNG/GIF/SVG export of diagrams
- **date-fns** — date formatting for editable date fields (date picker itself is hand-built, `CustomDatePicker.tsx`)
- **@radix-ui/react-dropdown-menu**, **@radix-ui/react-toast** — accessible popover/toast primitives
- **react-window** — virtualized lists (icon picker)
- **next-auth** — Google/GitHub OAuth
- **lucide-react** — primary icon set. `@fortawesome/*`, `react-feather`, `react-icons`, `react-ionicons` are also present and used in places — redundant, prefer lucide-react for new code.
- **Dead dependency**: `monaco-editor` / `react-monaco-editor` are installed but not imported anywhere in `src/` — do not build on them without confirming first.

## Architecture Overview

### Route Structure

```
/                                   → Landing page (marketing)
/signin                             → Sign in (email/password + NextAuth Google/GitHub OAuth)
/signup                             → Sign up (same auth pattern as signin)
/invite                             → Accept org invite via ?token=, fetches invite info from API
/onboarding                         → 3-step wizard: create org (color picker) → invite team → create first board
/dashboard                          → Dashboard home (stats, charts, recent activity)
/dashboard/boards                   → Board listing grid (search filter, grid/list toggle, pagination)
/dashboard/boards/[boardid]         → Board detail (3-pane layout: kanban/timeline/matrix)
/dashboard/boards/[boardid]/tasks   → Full-screen task kanban (DndContext, TaskListCard columns)
/dashboard/boards/[boardid]/flows   → List of flow diagrams belonging to this board
/dashboard/boards/[boardid]/flows/[flowId] → Individual flow/diagram editor bound to a board
/dashboard/history                  → Activity history timeline (paginated, entity_type board/task/org)
/dashboard/notifications            → Notifications center
/dashboard/organization             → Org overview (name, stats, role-gated editing)
/dashboard/organization/members     → Member management table (active/invited counts)
/dashboard/organization/roles       → Roles & permissions reference (read-only)
/dashboard/profile                  → User profile editor (incl. avatar upload with preview)
/dashboard/settings                 → Notification preferences
/flow                               → Standalone full-screen flow/diagram canvas (DiagramFrame)
```

The dashboard layout (`src/app/dashboard/layout.tsx`) renders a left nav sidebar. When the path is an individual board (`/dashboard/boards/[boardid]`), the sidebar is hidden and the board layout takes over the full viewport.

**Important:** `/dashboard/boards/[boardid]/tasks` is a kanban task list (DndContext + TaskListCard columns), NOT the flow canvas. The standalone flow canvas lives at `/flow`.

### Board Detail Layout (3-pane)

`src/app/dashboard/boards/[boardid]/layout.tsx` renders three collapsible panels:
- **Left**: `BoardSidebar` — board metadata, health, recent activity, user bar with theme toggle
- **Center**: board page children (`BoardTaskFlow` — kanban/timeline/matrix views)
- **Right**: `BoardLinkedResources` — docs and external links

When `pathname.includes("/tasks")`, both sidebars are suppressed and children render full-width.

### State Management

All stores live in `src/app/store/`:

| Store | Purpose |
|---|---|
| `useUserStore` | User session state (name/email/avatarUrl/role/orgId), `fetchUser`/`setUser`/`clearUser`, `getInitials()` |
| `useBoardStore` | Board metadata (title, description, tags, status, coverColor), with per-field save states; `LocalBoardMeta` persisted to localStorage via `writeLocalMeta` |
| `useBoardTaskStore` | Board tasks + board `members` (loaded together in `fetchTasks`). `updateTask(id, patch)` / `deleteTask(id)` are optimistic with rollback; the inline per-field editors route through `updateTask`. Converts to the backend's snake_case + RFC3339 in one place (`toPatchBody`). Dates are `YYYY-MM-DD` in the UI; `assigneeId` is stored, `assignee` is the resolved display name |
| `useBoardFlowsStore` | Board-scoped flow CRUD: `fetchFlows`/`createFlow`/`deleteFlow`/`renameFlow`/`duplicateFlow`/`migrateFlow` (migrates a local-only flow to server-backed) |
| `useLinkedResourcesStore` | Docs and external links for a board's right panel |
| `useTaskStore` | General task store (separate from board tasks); `moveTask(activeId, overId, fromList, toList)` for cross-column dnd-kit drag-drop |
| `globalTaskStore` | Legacy — only used by the unrendered `TaskListCard`. Task details open in `TaskModal` (pass `task` for edit mode) |
| `flowStore` | ReactFlow nodes/edges for the diagram canvas |
| `flow/store.ts` | Connection line path state for editable edges (local to flow components) |
| `useTemplateStore` | Template modal state: open/close, selected category, search query, recent template IDs (persisted to `"syncspace-recent-templates"` in localStorage) |

Save states follow the pattern `"idle" | "loading" | "success" | "error"` keyed by `"${taskId}-${field}"`.

### Performance & Code Splitting

Heavy components are lazy-loaded via `next/dynamic()` to keep route chunks small:

| File | Lazy-loaded component | Notes |
|------|-----------------------|-------|
| `src/app/dashboard/page.tsx` | 4 Recharts chart components | Server Component — no `ssr: false` |
| `src/app/flow/page.tsx` | `DiagramFrame` | `{ ssr: false }` — ReactFlow requires browser |
| `src/app/dashboard/boards/[boardid]/page.tsx` | `BoardTaskFlow` | Covers dnd-kit + date-fns chunk |

`next.config.ts` has `experimental.optimizePackageImports: ["lucide-react", "recharts", "@xyflow/react"]` — only imported symbols are bundled, not the whole barrel.

Every route has a `loading.tsx` skeleton for instant visual feedback during navigation:
`/dashboard`, `/dashboard/boards`, `/dashboard/boards/[boardid]`, `/dashboard/boards/[boardid]/tasks`, `/dashboard/boards/[boardid]/flows`, `/dashboard/boards/[boardid]/flows/[flowId]`, `/dashboard/history`, `/dashboard/notifications`, `/dashboard/organization`, `/dashboard/profile`, `/dashboard/settings`, `/flow`, `/onboarding`

`/`, `/signin`, `/signup`, `/invite`, and `/dashboard/organization/members` / `/roles` (fall back to the parent `organization/loading.tsx` Suspense boundary) have no dedicated `loading.tsx`.

### Dark Mode System

Dark mode is driven by a `.dark` class on `<html>`, managed by:
- `src/app/hooks/useTheme.tsx` — reads/writes `"theme"` key in localStorage, syncs to `document.documentElement.classList`, detects system preference on first load
- `src/app/components/ThemeProvider.tsx` — calls `useTheme()` at the root to initialize the class before any component renders
- `src/app/layout.tsx` wraps everything in `<ThemeProvider>`

**Theme toggle** is available in two places: the dashboard nav sidebar bottom bar and the board `BoardSidebar` bottom bar. Both use `const { theme, darkModeToggle } = useTheme()` with `<Sun>` / `<Moon>` icons from lucide-react.

**CSS variables** in `globals.css` have both `:root` (light) and `.dark` overrides. These are used in the dashboard nav only. Board-area components use Tailwind `dark:` classes directly.

**Dark mode surface hierarchy** (board area):
- Shell/page: `dark:bg-slate-900`
- Panel/card: `dark:bg-slate-800`
- Inner row/item: `dark:bg-slate-700`
- Hover: `dark:hover:bg-slate-700` or `dark:hover:bg-slate-600`

**Tailwind v4 dark variant** is declared in `globals.css`:
```css
@variant dark (&:where(.dark, .dark *));
```
This means `dark:` classes respond to `.dark` on any ancestor, not just `<html>`.

### Key Shared Components

- **`EditableText`** — click-to-edit inline text; the `className` prop applies to the outer display `div`, so dark text colors must be passed in the className prop at the call site
- **`SelectPopover`** — dropdown selector; accepts `triggerClassName` as a string prop — dark classes must be embedded in that string at each call site
- **`Popover`** — generic popover wrapper
- **`Skeleton`** / `BoardSidebarSkeleton` / `BoardTaskFlowSkeleton` / `LinkedResourcesSkeleton` — loading states for major panels
- **`TaskModal`** — full task detail modal

### Flow / Diagram Canvas

Lives under `src/app/components/flow/`. Key files:
- `DiagramFrame.tsx` — root component, wraps `ReactFlowProvider`, renders the canvas with `FlowEditor`, resizable JSON viewer panel, undo/redo, fullscreen, vote panel, presentation mode
- `FlowEditor.tsx` — `<ReactFlow>` with custom node types, edge types, minimap, controls
- `nodes/ShapeNode.tsx` — supports 9 shape types; textarea background/border dynamically matches node `data.fill` color; has comment badge + `NodeCommentPanel`
- `nodes/StickyNoteNode.tsx` — sticky note; color stored as `data.color`; has comment badge + `NodeCommentPanel`
- `nodes/GroupNode.tsx` — group container; color stored as `data.color`; has comment badge + `NodeCommentPanel`
- `nodes/ImageNode.tsx` — image embed node
- `nodes/TableNode.tsx` — editable grid table node
- `nodes/NodeCommentPanel.tsx` — Miro-style comment panel (post/resolve/delete); elevates node `zIndex` to 9999 on open; closes on click-outside via capture-phase `mousedown` listener
- `edges/EditableEdge/` — custom editable edge with control points and multiple path algorithms (bezier, catmull-rom, linear, straight)
- `Sidebar/` — compact Miro-style shape picker panel; uses shared `TILE`/`TILE_LABEL` CSS token strings for uniform tile appearance; `SidebarItem` is the draggable shape tile
- `FlowHeader/FlowHeader.tsx` — toolbar with mode toggle, color pickers, downloads, Templates button; all dropdowns use `getBoundingClientRect()` + `position: fixed` to escape `overflow-x-auto` clipping
- `minimap-node/index.tsx` — custom MiniMap node renderer; reads `data.fill` (ShapeNode) OR `data.color` (StickyNote/Group) via `fill || color`; renders actual SVG shape or fallback `<rect>`
- `Menu.tsx` — context menu for nodes
- `templates/` — Template selection modal system (see below)

#### Node Data Fields (important distinction)

- **ShapeNode**: color = `data.fill` (hex), shape type = `data.type`
- **StickyNoteNode / GroupNode**: color = `data.color`, no `data.type`
- **Node comments**: `data.comments: NodeComment[]` — `{ id, author, text, createdAt, resolved }`

Always use `fill || color` when reading a node's background color across all node types.

### Templates System (`src/app/components/flow/templates/`)

Miro/FigJam-style template picker triggered from the FlowHeader toolbar:
- `templateData.ts` — `Template` type, `TEMPLATES` array (8 templates), `TEMPLATE_CATEGORIES`, `RECOMMENDED_IDS`, `POPULAR_IDS`
- `TemplateCard.tsx` — single template tile with emoji preview, category badge, hover effects
- `TemplateModal.tsx` — full modal: categories sidebar + search bar + Recommended/Recent/Popular/All sections; calls `diagram.takeSnapshot()` then `diagram.uploadJson()` to apply
- `src/app/store/useTemplateStore.ts` — Zustand store for `isOpen`, `selectedCategory`, `searchQuery`, `recentIds` (persisted to localStorage key `"syncspace-recent-templates"`)

### Kanban / Drag-and-Drop

Full `@dnd-kit` implementation, not just card dragging:
- `src/app/components/kanban/DraggableTaskCard.tsx`, `DroppableColumn.tsx`, `SortablePipelineStage.tsx` — pipeline-stage columns themselves are sortable/reorderable, in addition to task cards
- `BoardTaskFlow.tsx`, `ShortTaskCard.tsx`, `TaskListCard.tsx`, and `/dashboard/boards/[boardid]/tasks/page.tsx` all use `@dnd-kit`
- `useTaskStore.moveTask` handles cross-column moves

### Flow Canvas — Export, Shortcuts & Extras

- **Export/import**: `DownloadImage.tsx` (PNG via `html-to-image`), `DownloadGif.tsx` (SVG-based via `html-to-image`, 1024x768), `DownloadJson.tsx`, `UploadJson.tsx`
- **Keyboard shortcuts**: `KeyboardShortcuts.tsx` — full cheatsheet overlay (Ctrl+C/V copy-paste, Ctrl+Z/Shift+Z undo-redo, Ctrl+A select all, Delete, Shift+F zoom-to-fit-selection, G group 2+ nodes, Space+drag free-draw connection, Ctrl+/ toggle panel, Esc to close)
- **JSON viewer**: `JsonViewer/JsonViewer.tsx` — syntax-highlighted (regex-based) inspector panel with copy-to-clipboard
- **Icon picker**: `IconPicker/` — virtualized list via `react-window`
- **Helper lines**: `HelperLines/` + `useHelperLines` hook — Figma-style snap/alignment guides while dragging nodes
- **Draggable edge labels**: `useDraggableEdgeLabel` hook — GSAP Draggable-powered, computes point-at-length along the SVG path
- **Undo/redo**: `useUndoRedo` hook — full history stack (max 100), Ctrl+Z/Ctrl+Shift+Z, `getSnapshotJson()` for export
- **Shape library**: `components/shape/`, `shape-node/`, `shapes/` — circle, rectangle, diamond, hexagon, cylinder, parallelogram, triangle, round-rectangle, arrow-rectangle

### Other Hooks (`src/app/hooks/`)

- `useDiagram.tsx` — core diagram/canvas state hook (`diagram.takeSnapshot()`/`diagram.uploadJson()`)
- `useLocalStorage.tsx` — generic localStorage-backed state hook
- `useTouchDevice.ts` — touch-device detection
- `useWindowSize.tsx` — responsive window-size tracking

### Permission System

`src/app/hooks/useEditMode.ts` returns `EditPermissions` based on `UserRole` (`"owner" | "admin" | "member" | "viewer"`), read from `useUserStore`'s real session role (falls back to `"viewer"` if unset). An optional `roleOverride` param lets call sites force a specific role.

### Path Alias

`@/` maps to `src/` (configured in `tsconfig.json`). Use `@/app/...` for all internal imports.

## Known Gotchas

- **Turbopack rejects `:global` in plain CSS files** — `nodeStyles.css` uses plain descendant selectors (`.node .react-flow__resize-control.handle`), not CSS Modules `:global`. Never use `:global` in `.css` files (only valid in `.module.css` with webpack).
- **`ssr: false` not allowed in Server Components** — only use `dynamic(() => import(...), { ssr: false })` inside `"use client"` files or client-only page files. Dashboard page is a Server Component — its dynamic imports have no options.
- **MiniMap node color** — ShapeNode stores color as `data.fill`, StickyNote/Group store as `data.color`. Always use `(fill || color)` when reading minimap node color.
- **Comment panel z-index** — `NodeCommentPanel` sets the parent node's `zIndex: 9999` in ReactFlow's node tree on mount (via `setNodes`) and resets to `0` on unmount. This is the only way to ensure the panel renders above sibling nodes.
- **FlowHeader dropdowns** — use `getBoundingClientRect()` + `position: fixed` for all dropdown menus to escape the `overflow-x-auto` clipping of the toolbar container.
- **`images.domains` deprecated** — `next.config.ts` should eventually migrate to `remotePatterns` (currently using deprecated `domains` — harmless warning).
