"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, apiDelete } from "@/lib/api";
import { ensureConnected, wsSend, wsSubscribe, wsUnsubscribe, WSMessage } from "@/lib/wsClient";

export interface Participant {
  id: string;
  name: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface PresenterInfo {
  id: string;
  name: string;
}

function throttle<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let last = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  }) as T;
}

interface FlowPresenceOptions {
  onDiagramUpdated?: (data: { nodes: unknown[]; edges: unknown[] }) => void;
  onPresentationSlide?: (nodeId: string, slideIndex: number) => void;
  onPresentationStopped?: () => void;
}

export function useFlowPresence(boardId: string, flowId: string, options?: FlowPresenceOptions) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [presenter, setPresenter] = useState<PresenterInfo | null>(null);
  const cursorsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const myIdRef = useRef<string | null>(null);
  const activeRef = useRef(false);

  // stable refs for callbacks — never re-subscribe on callback identity change
  const onDiagramUpdatedRef = useRef(options?.onDiagramUpdated);
  const onPresentationSlideRef = useRef(options?.onPresentationSlide);
  const onPresentationStoppedRef = useRef(options?.onPresentationStopped);
  onDiagramUpdatedRef.current = options?.onDiagramUpdated;
  onPresentationSlideRef.current = options?.onPresentationSlide;
  onPresentationStoppedRef.current = options?.onPresentationStopped;

  const fetchParticipants = useCallback(async () => {
    try {
      const list = await apiFetch<Participant[]>(
        `/api/boards/${boardId}/flows/${flowId}/participants`
      );
      setParticipants(list ?? []);
    } catch {}
  }, [boardId, flowId]);

  useEffect(() => {
    if (!boardId || !flowId) return;
    activeRef.current = true;

    const join = async () => {
      try {
        const own = await apiFetch<Participant>(
          `/api/boards/${boardId}/flows/${flowId}/participants/join`,
          { method: "POST", body: JSON.stringify({}) }
        );
        myIdRef.current = own?.id ?? null;
      } catch {}

      await fetchParticipants();
      ensureConnected();
      wsSend({ type: "flow.join", payload: { flow_id: flowId } });
    };

    join();

    const handler = (msg: WSMessage) => {
      if (!activeRef.current) return;
      const { type, payload } = msg as { type: string; payload: Record<string, unknown> };

      if (type === "presence.list") {
        const ids = new Set<string>((payload.user_ids as string[]) ?? []);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, isOnline: ids.has(p.id) || p.id === myIdRef.current }))
        );
      } else if (type === "presence.join") {
        fetchParticipants();
      } else if (type === "presence.leave") {
        const uid = payload.user_id as string;
        setParticipants((prev) => prev.filter((p) => p.id !== uid));
        cursorsRef.current.delete(uid);
      } else if (type === "cursor.move") {
        const uid = payload.user_id as string;
        if (uid !== myIdRef.current) {
          cursorsRef.current.set(uid, { x: payload.x as number, y: payload.y as number });
        }
      } else if (type === "diagram_updated") {
        const { nodes, edges } = payload as { nodes: unknown[]; edges: unknown[] };
        onDiagramUpdatedRef.current?.({ nodes, edges });
      } else if (type === "presentation.started") {
        const presId = payload.presenter_id as string;
        const presName = payload.presenter_name as string;
        // ignore if WE are the one presenting (server echoes to room incl. sender)
        if (presId !== myIdRef.current) {
          setPresenter({ id: presId, name: presName });
        }
      } else if (type === "presentation.stopped") {
        setPresenter(null);
        onPresentationStoppedRef.current?.();
      } else if (type === "presentation.slide") {
        const nodeId = payload.node_id as string;
        const slideIndex = payload.slide_index as number;
        onPresentationSlideRef.current?.(nodeId, slideIndex);
      }
    };

    wsSubscribe(handler);

    return () => {
      activeRef.current = false;
      wsUnsubscribe(handler);
      wsSend({ type: "flow.leave", payload: { flow_id: flowId } });
      apiDelete(`/api/boards/${boardId}/flows/${flowId}/participants/leave`).catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, flowId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sendCursorMove = useCallback(
    throttle((x: number, y: number) => {
      wsSend({ type: "cursor.update", payload: { flow_id: flowId, x, y } });
    }, 30),
    [flowId]
  );

  const broadcastPresentStart = useCallback((presenterName: string) => {
    wsSend({ type: "presentation.start", payload: { flow_id: flowId, presenter_name: presenterName } });
  }, [flowId]);

  const broadcastPresentStop = useCallback(() => {
    wsSend({ type: "presentation.stop", payload: { flow_id: flowId } });
  }, [flowId]);

  const broadcastPresentSlide = useCallback((nodeId: string, slideIndex: number) => {
    wsSend({ type: "presentation.slide", payload: { flow_id: flowId, node_id: nodeId, slide_index: slideIndex } });
  }, [flowId]);

  return {
    participants,
    cursorsRef,
    sendCursorMove,
    myId: myIdRef.current,
    presenter,
    broadcastPresentStart,
    broadcastPresentStop,
    broadcastPresentSlide,
  };
}
