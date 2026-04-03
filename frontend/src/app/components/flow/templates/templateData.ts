import type { Node, Edge } from "@xyflow/react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  preview: string; // emoji used as visual preview
  tags: string[];
  data: { nodes: Node[]; edges: Edge[] };
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  "All",
  "AI",
  "Agile",
  "Brainstorming",
  "Processes",
  "Meetings",
  "Planning",
  "Research",
  "Systems",
] as const;

// ─── Curated sections ─────────────────────────────────────────────────────────

export const RECOMMENDED_IDS = ["mindmap", "flowchart", "sysarch"];
export const POPULAR_IDS = ["flowchart", "sprint", "mindmap"];

// ─── Template definitions ─────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  // 1. Blank Canvas ─────────────────────────────────────────────────────────
  {
    id: "blank",
    title: "Blank Canvas",
    category: "All",
    description: "Start from scratch with an empty canvas",
    preview: "⬜",
    tags: ["empty", "blank", "start"],
    data: { nodes: [], edges: [] },
  },

  // 2. Mind Map ─────────────────────────────────────────────────────────────
  {
    id: "mindmap",
    title: "Mind Map",
    category: "Brainstorming",
    description: "Central idea with radiating branches for brainstorming",
    preview: "🧠",
    tags: ["brainstorm", "ideas", "mind map", "creative"],
    data: {
      nodes: [
        {
          id: "mm-center",
          type: "shape",
          position: { x: 340, y: 220 },
          style: { width: 140, height: 60 },
          data: {
            type: "round-rectangle",
            text: "Central Idea",
            fill: "#3b82f6",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "bold",
          },
        },
        {
          id: "mm-1",
          type: "shape",
          position: { x: 80, y: 80 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Topic A", fill: "#8b5cf6", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "mm-2",
          type: "shape",
          position: { x: 600, y: 80 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Topic B", fill: "#10b981", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "mm-3",
          type: "shape",
          position: { x: 80, y: 340 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Topic C", fill: "#f59e0b", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "mm-4",
          type: "shape",
          position: { x: 600, y: 340 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Topic D", fill: "#ef4444", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "mm-5",
          type: "shape",
          position: { x: 340, y: 380 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Topic E", fill: "#ec4899", color: "#ffffff", fontSize: "13px" },
        },
      ] as Node[],
      edges: [
        { id: "mme-1", source: "mm-center", target: "mm-1", type: "smoothstep" },
        { id: "mme-2", source: "mm-center", target: "mm-2", type: "smoothstep" },
        { id: "mme-3", source: "mm-center", target: "mm-3", type: "smoothstep" },
        { id: "mme-4", source: "mm-center", target: "mm-4", type: "smoothstep" },
        { id: "mme-5", source: "mm-center", target: "mm-5", type: "smoothstep" },
      ] as Edge[],
    },
  },

  // 3. Basic Flowchart ───────────────────────────────────────────────────────
  {
    id: "flowchart",
    title: "Basic Flowchart",
    category: "Processes",
    description: "Start → Process → Decision → End flow diagram",
    preview: "📊",
    tags: ["flow", "process", "decision", "steps"],
    data: {
      nodes: [
        {
          id: "fc-start",
          type: "shape",
          position: { x: 300, y: 40 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Start", fill: "#10b981", color: "#ffffff", fontSize: "14px", fontWeight: "bold" },
        },
        {
          id: "fc-process1",
          type: "shape",
          position: { x: 300, y: 150 },
          style: { width: 140, height: 56 },
          data: { type: "rectangle", text: "Define Requirements", fill: "#3b82f6", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "fc-process2",
          type: "shape",
          position: { x: 300, y: 270 },
          style: { width: 140, height: 56 },
          data: { type: "rectangle", text: "Build Solution", fill: "#3b82f6", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "fc-decision",
          type: "shape",
          position: { x: 290, y: 390 },
          style: { width: 160, height: 70 },
          data: { type: "diamond", text: "Tests Pass?", fill: "#f59e0b", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "fc-fix",
          type: "shape",
          position: { x: 520, y: 395 },
          style: { width: 120, height: 56 },
          data: { type: "rectangle", text: "Fix Issues", fill: "#ef4444", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "fc-end",
          type: "shape",
          position: { x: 300, y: 530 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Deploy", fill: "#10b981", color: "#ffffff", fontSize: "14px", fontWeight: "bold" },
        },
      ] as Node[],
      edges: [
        { id: "fce-1", source: "fc-start", target: "fc-process1", type: "smoothstep" },
        { id: "fce-2", source: "fc-process1", target: "fc-process2", type: "smoothstep" },
        { id: "fce-3", source: "fc-process2", target: "fc-decision", type: "smoothstep" },
        { id: "fce-4", source: "fc-decision", target: "fc-fix", type: "smoothstep", label: "No" },
        { id: "fce-5", source: "fc-fix", target: "fc-process2", type: "smoothstep" },
        { id: "fce-6", source: "fc-decision", target: "fc-end", type: "smoothstep", label: "Yes" },
      ] as Edge[],
    },
  },

  // 4. Sprint Planning ───────────────────────────────────────────────────────
  {
    id: "sprint",
    title: "Sprint Planning",
    category: "Agile",
    description: "Backlog → In Progress → Review → Done kanban lanes",
    preview: "🏃",
    tags: ["agile", "sprint", "kanban", "scrum"],
    data: {
      nodes: [
        // Lane labels
        {
          id: "sp-label-backlog",
          type: "shape",
          position: { x: 40, y: 20 },
          style: { width: 140, height: 36 },
          data: { type: "rectangle", text: "📋 Backlog", fill: "#374151", color: "#d1d5db", fontSize: "12px", fontWeight: "bold" },
        },
        {
          id: "sp-label-inprogress",
          type: "shape",
          position: { x: 220, y: 20 },
          style: { width: 140, height: 36 },
          data: { type: "rectangle", text: "⚡ In Progress", fill: "#1d4ed8", color: "#dbeafe", fontSize: "12px", fontWeight: "bold" },
        },
        {
          id: "sp-label-review",
          type: "shape",
          position: { x: 400, y: 20 },
          style: { width: 140, height: 36 },
          data: { type: "rectangle", text: "🔍 Review", fill: "#7c3aed", color: "#ede9fe", fontSize: "12px", fontWeight: "bold" },
        },
        {
          id: "sp-label-done",
          type: "shape",
          position: { x: 580, y: 20 },
          style: { width: 140, height: 36 },
          data: { type: "rectangle", text: "✅ Done", fill: "#065f46", color: "#d1fae5", fontSize: "12px", fontWeight: "bold" },
        },
        // Cards
        { id: "sp-b1", type: "sticky-note", position: { x: 50, y: 80 }, style: { width: 120, height: 80 }, data: { text: "User auth flow", color: "#fef9c3" } },
        { id: "sp-b2", type: "sticky-note", position: { x: 50, y: 180 }, style: { width: 120, height: 80 }, data: { text: "API rate limiting", color: "#fef9c3" } },
        { id: "sp-b3", type: "sticky-note", position: { x: 50, y: 280 }, style: { width: 120, height: 80 }, data: { text: "Dashboard redesign", color: "#fef9c3" } },
        { id: "sp-ip1", type: "sticky-note", position: { x: 230, y: 80 }, style: { width: 120, height: 80 }, data: { text: "Payment integration", color: "#dbeafe" } },
        { id: "sp-ip2", type: "sticky-note", position: { x: 230, y: 180 }, style: { width: 120, height: 80 }, data: { text: "Search feature", color: "#dbeafe" } },
        { id: "sp-r1", type: "sticky-note", position: { x: 410, y: 80 }, style: { width: 120, height: 80 }, data: { text: "Email notifications", color: "#ede9fe" } },
        { id: "sp-d1", type: "sticky-note", position: { x: 590, y: 80 }, style: { width: 120, height: 80 }, data: { text: "User onboarding", color: "#dcfce7" } },
        { id: "sp-d2", type: "sticky-note", position: { x: 590, y: 180 }, style: { width: 120, height: 80 }, data: { text: "Profile settings", color: "#dcfce7" } },
      ] as Node[],
      edges: [] as Edge[],
    },
  },

  // 5. Meeting Notes ─────────────────────────────────────────────────────────
  {
    id: "meeting",
    title: "Meeting Notes",
    category: "Meetings",
    description: "Agenda, key decisions, and action items layout",
    preview: "📝",
    tags: ["meeting", "notes", "agenda", "decisions", "actions"],
    data: {
      nodes: [
        {
          id: "mt-title",
          type: "shape",
          position: { x: 180, y: 20 },
          style: { width: 260, height: 50 },
          data: { type: "round-rectangle", text: "Team Meeting", fill: "#1e293b", color: "#f1f5f9", fontSize: "16px", fontWeight: "bold" },
        },
        // Agenda
        { id: "mt-agenda-label", type: "sticky-note", position: { x: 40, y: 110 }, style: { width: 160, height: 140 }, data: { text: "📋 Agenda\n\n• Q3 review\n• Roadmap planning\n• Team updates\n• AOB", color: "#fef9c3" } },
        // Decisions
        { id: "mt-decisions-label", type: "sticky-note", position: { x: 240, y: 110 }, style: { width: 160, height: 140 }, data: { text: "✅ Decisions\n\n• Launch in Oct\n• Hire 2 engineers\n• Weekly syncs", color: "#dcfce7" } },
        // Action items
        { id: "mt-actions-label", type: "sticky-note", position: { x: 440, y: 110 }, style: { width: 160, height: 140 }, data: { text: "⚡ Action Items\n\n• Alice: spec doc\n• Bob: designs\n• Carol: API", color: "#dbeafe" } },
        // Parking lot
        { id: "mt-parking", type: "sticky-note", position: { x: 140, y: 300 }, style: { width: 340, height: 90 }, data: { text: "🅿️ Parking Lot — Topics for future discussion", color: "#fce7f3" } },
      ] as Node[],
      edges: [] as Edge[],
    },
  },

  // 6. System Architecture ──────────────────────────────────────────────────
  {
    id: "sysarch",
    title: "System Architecture",
    category: "Systems",
    description: "Frontend, backend, database, and external services",
    preview: "🏗️",
    tags: ["architecture", "system", "backend", "api", "database"],
    data: {
      nodes: [
        {
          id: "sa-client",
          type: "shape",
          position: { x: 280, y: 20 },
          style: { width: 140, height: 56 },
          data: { type: "round-rectangle", text: "Client\n(Next.js)", fill: "#3b82f6", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "sa-gateway",
          type: "shape",
          position: { x: 280, y: 140 },
          style: { width: 140, height: 56 },
          data: { type: "rectangle", text: "API Gateway", fill: "#8b5cf6", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "sa-auth",
          type: "shape",
          position: { x: 80, y: 260 },
          style: { width: 120, height: 56 },
          data: { type: "rectangle", text: "Auth Service", fill: "#f59e0b", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "sa-api",
          type: "shape",
          position: { x: 280, y: 260 },
          style: { width: 140, height: 56 },
          data: { type: "rectangle", text: "Core API\n(Node.js)", fill: "#10b981", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "sa-worker",
          type: "shape",
          position: { x: 480, y: 260 },
          style: { width: 120, height: 56 },
          data: { type: "rectangle", text: "Worker\nService", fill: "#f59e0b", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "sa-db",
          type: "shape",
          position: { x: 200, y: 390 },
          style: { width: 120, height: 60 },
          data: { type: "cylinder", text: "PostgreSQL", fill: "#1e293b", color: "#94a3b8", fontSize: "12px" },
        },
        {
          id: "sa-cache",
          type: "shape",
          position: { x: 380, y: 390 },
          style: { width: 120, height: 60 },
          data: { type: "cylinder", text: "Redis Cache", fill: "#dc2626", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "sa-storage",
          type: "shape",
          position: { x: 560, y: 390 },
          style: { width: 120, height: 56 },
          data: { type: "rectangle", text: "S3 Storage", fill: "#d97706", color: "#ffffff", fontSize: "12px" },
        },
      ] as Node[],
      edges: [
        { id: "sae-1", source: "sa-client", target: "sa-gateway", type: "smoothstep" },
        { id: "sae-2", source: "sa-gateway", target: "sa-auth", type: "smoothstep" },
        { id: "sae-3", source: "sa-gateway", target: "sa-api", type: "smoothstep" },
        { id: "sae-4", source: "sa-gateway", target: "sa-worker", type: "smoothstep" },
        { id: "sae-5", source: "sa-api", target: "sa-db", type: "smoothstep" },
        { id: "sae-6", source: "sa-api", target: "sa-cache", type: "smoothstep" },
        { id: "sae-7", source: "sa-worker", target: "sa-storage", type: "smoothstep" },
      ] as Edge[],
    },
  },

  // 7. User Journey Map ──────────────────────────────────────────────────────
  {
    id: "userjourney",
    title: "User Journey Map",
    category: "Research",
    description: "Map customer touchpoints, emotions, and pain points",
    preview: "🗺️",
    tags: ["ux", "research", "journey", "customer", "touchpoints"],
    data: {
      nodes: [
        {
          id: "uj-stage1",
          type: "shape",
          position: { x: 40, y: 40 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Awareness", fill: "#6366f1", color: "#ffffff", fontSize: "13px", fontWeight: "bold" },
        },
        {
          id: "uj-stage2",
          type: "shape",
          position: { x: 220, y: 40 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Consideration", fill: "#3b82f6", color: "#ffffff", fontSize: "13px", fontWeight: "bold" },
        },
        {
          id: "uj-stage3",
          type: "shape",
          position: { x: 400, y: 40 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Decision", fill: "#10b981", color: "#ffffff", fontSize: "13px", fontWeight: "bold" },
        },
        {
          id: "uj-stage4",
          type: "shape",
          position: { x: 580, y: 40 },
          style: { width: 120, height: 50 },
          data: { type: "round-rectangle", text: "Retention", fill: "#f59e0b", color: "#ffffff", fontSize: "13px", fontWeight: "bold" },
        },
        // Touchpoints
        { id: "uj-t1", type: "sticky-note", position: { x: 40, y: 130 }, style: { width: 120, height: 90 }, data: { text: "Sees social media ad\n\n😐 Neutral", color: "#ede9fe" } },
        { id: "uj-t2", type: "sticky-note", position: { x: 220, y: 130 }, style: { width: 120, height: 90 }, data: { text: "Reads reviews\n\n🤔 Curious", color: "#dbeafe" } },
        { id: "uj-t3", type: "sticky-note", position: { x: 400, y: 130 }, style: { width: 120, height: 90 }, data: { text: "Free trial signup\n\n😊 Excited", color: "#dcfce7" } },
        { id: "uj-t4", type: "sticky-note", position: { x: 580, y: 130 }, style: { width: 120, height: 90 }, data: { text: "Weekly usage\n\n😄 Satisfied", color: "#fef9c3" } },
        // Pain points
        {
          id: "uj-pain",
          type: "sticky-note",
          position: { x: 220, y: 270 },
          style: { width: 280, height: 80 },
          data: { text: "⚠️ Pain Points: Pricing unclear, onboarding confusing, slow load times", color: "#fce7f3" },
        },
      ] as Node[],
      edges: [
        { id: "uje-1", source: "uj-stage1", target: "uj-stage2", type: "smoothstep" },
        { id: "uje-2", source: "uj-stage2", target: "uj-stage3", type: "smoothstep" },
        { id: "uje-3", source: "uj-stage3", target: "uj-stage4", type: "smoothstep" },
      ] as Edge[],
    },
  },

  // 8. AI Pipeline ───────────────────────────────────────────────────────────
  {
    id: "aipipeline",
    title: "AI Pipeline",
    category: "AI",
    description: "Data ingestion → preprocessing → model → output flow",
    preview: "🤖",
    tags: ["ai", "ml", "pipeline", "data", "model"],
    data: {
      nodes: [
        {
          id: "ai-ingest",
          type: "shape",
          position: { x: 40, y: 200 },
          style: { width: 130, height: 60 },
          data: { type: "round-rectangle", text: "Data Ingestion", fill: "#6366f1", color: "#ffffff", fontSize: "13px" },
        },
        {
          id: "ai-preprocess",
          type: "shape",
          position: { x: 240, y: 200 },
          style: { width: 130, height: 60 },
          data: { type: "rectangle", text: "Preprocessing\n& Cleaning", fill: "#3b82f6", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "ai-features",
          type: "shape",
          position: { x: 440, y: 200 },
          style: { width: 130, height: 60 },
          data: { type: "rectangle", text: "Feature\nEngineering", fill: "#8b5cf6", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "ai-model",
          type: "shape",
          position: { x: 640, y: 200 },
          style: { width: 130, height: 60 },
          data: { type: "round-rectangle", text: "LLM / Model", fill: "#ec4899", color: "#ffffff", fontSize: "13px", fontWeight: "bold" },
        },
        {
          id: "ai-eval",
          type: "shape",
          position: { x: 540, y: 340 },
          style: { width: 130, height: 60 },
          data: { type: "diamond", text: "Eval\nPass?", fill: "#f59e0b", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "ai-output",
          type: "shape",
          position: { x: 760, y: 340 },
          style: { width: 130, height: 60 },
          data: { type: "round-rectangle", text: "Output /\nDeployment", fill: "#10b981", color: "#ffffff", fontSize: "12px" },
        },
        {
          id: "ai-retrain",
          type: "shape",
          position: { x: 340, y: 340 },
          style: { width: 130, height: 60 },
          data: { type: "rectangle", text: "Retrain /\nFine-tune", fill: "#ef4444", color: "#ffffff", fontSize: "12px" },
        },
        // Annotations
        { id: "ai-note1", type: "sticky-note", position: { x: 640, y: 60 }, style: { width: 140, height: 80 }, data: { text: "Models: GPT-4, Claude, Llama, custom", color: "#ede9fe" } },
      ] as Node[],
      edges: [
        { id: "aie-1", source: "ai-ingest", target: "ai-preprocess", type: "smoothstep" },
        { id: "aie-2", source: "ai-preprocess", target: "ai-features", type: "smoothstep" },
        { id: "aie-3", source: "ai-features", target: "ai-model", type: "smoothstep" },
        { id: "aie-4", source: "ai-model", target: "ai-eval", type: "smoothstep" },
        { id: "aie-5", source: "ai-eval", target: "ai-output", type: "smoothstep", label: "Pass" },
        { id: "aie-6", source: "ai-eval", target: "ai-retrain", type: "smoothstep", label: "Fail" },
        { id: "aie-7", source: "ai-retrain", target: "ai-model", type: "smoothstep" },
      ] as Edge[],
    },
  },
];
