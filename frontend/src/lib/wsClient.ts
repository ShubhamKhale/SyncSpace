const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://localhost:8068";

export interface WSMessage {
  type: string;
  payload: unknown;
}

type Handler = (msg: WSMessage) => void;

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 1_000;
const handlers = new Set<Handler>();
const queue: string[] = [];

function _connect(token: string) {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
  ws = new WebSocket(`${WS_BASE}/ws?token=${encodeURIComponent(token)}`);

  ws.onopen = () => {
    retryDelay = 1_000;
    while (queue.length) ws!.send(queue.shift()!);
  };

  ws.onmessage = ({ data }) => {
    try {
      const msg = JSON.parse(data as string) as WSMessage;
      handlers.forEach((h) => h(msg));
    } catch {}
  };

  ws.onclose = () => {
    ws = null;
    const token = typeof window !== "undefined" ? localStorage.getItem("ss_jwt") : null;
    if (!token) return;
    retryDelay = Math.min(retryDelay * 2, 30_000);
    reconnectTimer = setTimeout(() => _connect(token), retryDelay);
  };

  ws.onerror = () => ws?.close();
}

export function ensureConnected() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("ss_jwt");
  if (!token) return;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  _connect(token);
}

export function wsSend(msg: object) {
  const str = JSON.stringify(msg);
  if (ws?.readyState === WebSocket.OPEN) ws.send(str);
  else queue.push(str);
}

export function wsSubscribe(handler: Handler) {
  handlers.add(handler);
}

export function wsUnsubscribe(handler: Handler) {
  handlers.delete(handler);
}
