/**
 * Pure keyboard navigation helpers for fixed-length dialog action lists (Phase 01, plan 03).
 *
 * Extracted without React imports (D-18/D-20) so unit tests can lock boundary behavior
 * independently of OpenTUI. BashApprovalDialog is the first consumer; pattern mirrors
 * dialog-search-list.tsx keyboard layer usage (D-21).
 */

/** Number of actions in the bash approval dialog (Approve once, Reject, Allow for session). */
export const BASH_APPROVAL_ACTION_COUNT = 3;

/** Default keyboard selection: Reject (safest default per D-20 — Enter without moving highlights denies). */
export const BASH_APPROVAL_DEFAULT_INDEX = 1;

export type DialogSelectionDirection = "up" | "down";

/** Move selection index within a fixed-length dialog action list, clamped at boundaries. */
export function moveDialogSelection(
  currentIndex: number,
  direction: DialogSelectionDirection,
  itemCount: number,
): number {
  if (direction === "up") {
    return Math.max(0, currentIndex - 1);
  }
  return Math.min(itemCount - 1, currentIndex + 1);
}
