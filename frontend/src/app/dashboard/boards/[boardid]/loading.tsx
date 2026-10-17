import { BoardTaskFlowSkeleton } from "@/app/components/Skeleton";

// Rendered inside [boardid]/layout.tsx, which already draws the real board
// sidebar and linked-resources panels — so this covers only the center pane.
// (A full 3-pane skeleton here would nest fake side panels inside the center.)
export default function BoardLoading() {
  return <BoardTaskFlowSkeleton />;
}
