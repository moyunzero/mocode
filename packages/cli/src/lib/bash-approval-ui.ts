import { createElement } from "react";
import { BashApprovalDialog } from "../components/dialogs/bash-approval-dialog";
import type { DialogContextValue } from "../providers/dialog";
import type { BashApprovalVerdict } from "./bash-approval";

/**
 * Bridge from async `onToolCall` to the modal DialogProvider (Phase 01, HARNESS-03).
 *
 * Flow: use-chat awaits this promise → user picks an action in BashApprovalDialog
 * → verdict resolves → onToolCall either runs bash or returns output-error.
 *
 * Esc / backdrop dismiss → reject (D-15, assumption A4): dismissing without an
 * explicit Approve is treated as denial, same as clicking Reject.
 *
 * `settled` guard: button handlers call settle() then dialog.close(), which fires
 * onClose. Without the guard, onClose would resolve("reject") after approve.
 */
export function requestBashApproval(
  dialog: DialogContextValue,
  command: string,
): Promise<BashApprovalVerdict> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (verdict: BashApprovalVerdict) => {
      if (settled) return;
      settled = true;
      resolve(verdict);
    };

    dialog.open({
      title: "Approve dangerous command",
      // Fires on Esc, backdrop click, or dialog.close() — maps to reject unless already settled.
      onClose: () => settle("reject"),
      children: createElement(BashApprovalDialog, {
        command,
        onApproveOnce: () => {
          settle("approve-once");
          dialog.close();
        },
        onReject: () => {
          settle("reject");
          dialog.close();
        },
        onAllowSession: () => {
          settle("allow-session");
          dialog.close();
        },
      }),
    });
  });
}
