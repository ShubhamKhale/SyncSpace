/**
 * True when a key event comes from a text field, so node delete-key handlers
 * (which listen on window) don't remove the node while the user is typing —
 * e.g. in a label textarea, the comment panel, or the AI prompt input.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest("input, textarea, select, [contenteditable='true']");
}
