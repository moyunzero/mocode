import { createElement } from "react";
import { McpApprovalDialog } from "../components/dialogs/mcp-approval-dialog";
import type { DialogContextValue } from "../providers/dialog";
import type { McpApprovalVerdict } from "./mcp-approval-ui";

export type LocalWriteApprovalVerdict = McpApprovalVerdict;

/** Opens writeFile/editFile approval — same three-action UX as MCP write approval. */
export function requestLocalWriteApproval(
  dialog: DialogContextValue,
  toolName: string,
  input: unknown,
): Promise<LocalWriteApprovalVerdict> {
  return new Promise((resolve) => {
    let settled = false;

    const settle = (verdict: LocalWriteApprovalVerdict) => {
      if (settled) return;
      settled = true;
      resolve(verdict);
    };

    dialog.open({
      title: "Approve file change",
      onClose: () => settle("reject"),
      children: createElement(McpApprovalDialog, {
        toolName,
        input,
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
