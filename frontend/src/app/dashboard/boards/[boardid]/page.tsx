import dynamic from "next/dynamic";

const BoardTaskFlow = dynamic(() => import("@/app/components/BoardTaskFlow"));

type Props = { params: Promise<{ boardid: string }> };

export default async function Page({ params }: Props) {
  const { boardid } = await params;
  return <BoardTaskFlow boardId={boardid} />;
}
