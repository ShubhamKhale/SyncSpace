# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js, port 3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
npm run start    # Start production server
```

No test runner is configured. There is no backend in this directory — this is a frontend-only Next.js app with mock/simulated async data.

## Tech Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS v4** — configured via `@import "tailwindcss"` in `globals.css`, NOT via `tailwind.config.js`
- **Zustand v5** — all client state
- **@xyflow/react** — flow/diagram canvas
- **@dnd-kit** — drag-and-drop in kanban
- **Recharts** — analytics charts
- **lucide-react** — icons throughout

## Architecture Overview

### Route Structure

```
/dashboard                          → Dashboard home (stats, recent activity)
/dashboard/boards                   → Board listing grid
/dashboard/boards/[boardid]         → Board detail (3-pane layout)
/dashboard/boards/[boardid]/tasks   → Task flow/diagram view (full screen, no sidebars)
/dashboard/history                  → Activity history
/dashboard/notifications            → Notifications
/dashboard/organization             → Org overview, members, roles sub-pages
/dashboard/profile                  → Profile
/dashboard/settings                 → Settings
```

The dashboard layout (`src/app/dashboard/layout.tsx`) renders a left nav sidebar. When the path is an individual board (`/dashboard/boards/[boardid]`), the sidebar is hidden and the board layout takes over the full viewport.

### Board Detail Layout (3-pane)

`src/app/dashboard/boards/[boardid]/layout.tsx` renders three collapsible panels:
- **Left**: `BoardSidebar` — board metadata, health, recent activity, user bar with theme toggle
- **Center**: board page children (`BoardTaskFlow` — kanban/timeline/matrix views)
- **Right**: `BoardLinkedResources` — docs and external links

The `/tasks` sub-route suppresses all sidebars and renders full-screen `DiagramFrame` (the flow canvas).

### State Management

All stores live in `src/app/store/`:

| Store | Purpose |
|---|---|
| `useBoardStore` | Board metadata (title, description, tags, status, coverColor), with per-field save states |
| `useBoardTaskStore` | Tasks array with optimistic updates per field (title, priority, dates, assignee, stage) |
| `useLinkedResourcesStore` | Docs and external links for a board's right panel |
| `useTaskStore` | General task store (separate from board tasks) |
| `globalTaskStore` | App-wide task state |
| `flowStore` | ReactFlow nodes/edges for the diagram canvas |
| `flow/store.ts` | Connection line path state for editable edges (local to flow components) |

Save states follow the pattern `"idle" | "loading" | "success" | "error"` keyed by `"${taskId}-${field}"`.

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
- `DiagramFrame.tsx` — root component, wraps `ReactFlowProvider`, renders the canvas with `FlowEditor`, resizable JSON viewer panel, undo/redo, fullscreen
- `FlowEditor.tsx` — `<ReactFlow>` with custom node types, edge types, minimap, controls
- `nodes/ShapeNode.tsx` — single custom node type supporting multiple shapes
- `edges/EditableEdge/` — custom editable edge with control points and multiple path algorithms (bezier, catmull-rom, linear, straight)
- `Sidebar/` — shape picker panel; `SidebarItem` is the draggable shape
- `FlowHeader/FlowHeader.tsx` — toolbar with mode toggle, color pickers, downloads
- `Menu.tsx` — context menu for nodes

### Permission System

`src/app/hooks/useEditMode.ts` returns `EditPermissions` based on a `UserRole` (`"owner" | "editor" | "viewer"`). Currently hardcoded to `"owner"` at call sites — replace with real auth role when integrating a backend.

### Path Alias

`@/` maps to `src/` (configured in `tsconfig.json`). Use `@/app/...` for all internal imports.
