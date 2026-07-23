"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBoardFlowsStore } from "@/app/store/useBoardFlowsStore";

const DiagramFrame = dynamic(
  () => import("@/app/components/flow/DiagramFrame"),
  { ssr: false }
);

// UUID v4 pattern — localStorage IDs don't match this
function isLocalId(id: string) {
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default function FlowEditorPage({
  params,
}: {
  params: Promise<{ boardid: string; flowId: string }>;
}) {
  const { boardid, flowId } = use(params);
  const boardId = boardid;
  const router = useRouter();
  const migrateFlow = useBoardFlowsStore((s) => s.migrateFlow);

  // resolvedFlowId: null = still checking, string = ready to render
  const [resolvedFlowId, setResolvedFlowId] = useState<string | null>(
    isLocalId(flowId) ? null : flowId
  );
  const [migrationFailed, setMigrationFailed] = useState(false);

  useEffect(() => {
    if (!isLocalId(flowId)) return; // UUID — no migration needed

    migrateFlow(boardId, flowId)
      .then((serverFlow) => {
        router.replace(`/dashboard/boards/${boardId}/flows/${serverFlow.id}`);
        // Don't set resolvedFlowId — the redirect handles rendering
      })
      .catch(() => {
        // Backend unavailable — fall back to using the local ID as-is
        setMigrationFailed(true);
        setResolvedFlowId(flowId);
      });
  }, [boardId, flowId, migrateFlow, router]);

  if (!resolvedFlowId) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#94a3b8",
          fontSize: 14,
          gap: 8,
        }}
      >
        {migrationFailed ? "Migration failed — loading locally…" : "Syncing flow to server…"}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DiagramFrame flowId={resolvedFlowId} boardId={boardId} />
    </div>
  );
}
