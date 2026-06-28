import { Mode, type ModeType } from "@mocode/shared";

const LOCAL_WRITE_TOOLS = new Set(["writeFile", "editFile"]);

export const LOCAL_WRITE_REJECT_ERROR_TEXT =
  "User rejected this file change in the TUI approval dialog — this is not a runtime failure. " +
  "Do not retry the same write unless the user explicitly requests it again in a new message.";

/** BUILD-mode writeFile/editFile require TUI approval unless session-allowed. */
export function requiresLocalWriteApproval(
  toolName: string,
  mode: ModeType,
  sessionAllowed: Set<string>,
): boolean {
  if (mode !== Mode.BUILD) return false;
  if (!LOCAL_WRITE_TOOLS.has(toolName)) return false;
  if (sessionAllowed.has(toolName)) return false;
  return true;
}
