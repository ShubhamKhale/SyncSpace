import type { FocusEvent } from "react";

/**
 * onFocus handler that puts the caret after the existing text. Fields focused
 * via autoFocus otherwise start with the caret at position 0, so typing would
 * insert before the node's current label instead of continuing it.
 */
export function caretToEnd(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  const el = e.currentTarget;
  const end = el.value.length;
  el.setSelectionRange(end, end);
  if (el instanceof HTMLTextAreaElement) el.scrollTop = el.scrollHeight;
}
