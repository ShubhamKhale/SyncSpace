import { encryptPayload, decryptPayload } from "./crypto";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_BASE) {
  // eslint-disable-next-line no-console
  console.error(
    "NEXT_PUBLIC_API_BASE is not set in production — API calls will hit localhost and fail. Set it in your deployment environment."
  );
}

export const API = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8068";

function getHeaders(
  extra: Record<string, string> = {}
): Record<string, string> {
  const jwt =
    typeof window !== "undefined" ? localStorage.getItem("ss_jwt") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  return headers;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: getHeaders(options.headers as Record<string, string>),
  });

  if (res.status === 401) {
    clearAuthTokens();
    if (typeof window !== "undefined") window.location.href = "/signin";
    throw new Error("Unauthorized");
  }

  // Guard against non-JSON responses (HTML error pages, plain text, etc.)
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return undefined as unknown as T;
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Invalid JSON response from ${path}`);
  }

  if (json !== null && typeof json === "object") {
    const envelope = json as Record<string, unknown>;
    if (envelope.success === false) throw new Error((envelope.error as string) ?? "Unknown error");
    if (envelope.data !== undefined) return envelope.data as T;
  }

  return json as T;
}

// Only GET /api/boards and POST /api/boards use AES-256-GCM encryption
export async function encryptedFetch<T>(
  path: string,
  method: "GET" | "POST",
  body?: object
): Promise<T> {
  const jwt = localStorage.getItem("ss_jwt");
  const sessionKey = localStorage.getItem("ss_session_key");
  const userId = localStorage.getItem("ss_user_id");

  if (!jwt || !sessionKey || !userId) throw new Error("Not authenticated");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
    "X-User-ID": userId,
  };

  let fetchBody: string | undefined;
  if (body) {
    const encrypted = await encryptPayload(sessionKey, body);
    fetchBody = JSON.stringify({ data: encrypted });
  }

  const res = await fetch(`${API}${path}`, { method, headers, body: fetchBody });

  if (res.status === 401) {
    clearAuthTokens();
    window.location.href = "/signin";
    throw new Error("Unauthorized");
  }

  const json = await res.json();
  if (json.success === false) throw new Error(json.error ?? "Unknown error");

  const encryptedData =
    typeof json.data === "string" ? json.data : (json.data as { data: string })?.data;

  const decrypted = await decryptPayload(sessionKey, encryptedData);

  // Decrypted payload may itself be wrapped in { success, data } envelope
  if (decrypted && typeof decrypted === "object" && "success" in (decrypted as object)) {
    const envelope = decrypted as { success: boolean; data?: unknown; error?: string };
    if (envelope.success === false) throw new Error(envelope.error ?? "Unknown error");
    return envelope.data as T;
  }
  return decrypted as T;
}

export function storeAuthTokens(
  token: string,
  sessionKey: string,
  userId: string
): void {
  localStorage.setItem("ss_jwt", token);
  localStorage.setItem("ss_session_key", sessionKey);
  localStorage.setItem("ss_user_id", userId);
}

export function clearAuthTokens(): void {
  localStorage.removeItem("ss_jwt");
  localStorage.removeItem("ss_session_key");
  localStorage.removeItem("ss_user_id");
}

export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("ss_jwt");
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (res.status === 401) {
    clearAuthTokens();
    if (typeof window !== "undefined") window.location.href = "/signin";
    throw new Error("Unauthorized");
  }
  if (res.status !== 204 && !res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? "Delete failed");
  }
}
