import type { UIMessage } from "ai";
import { hasVisibleAssistantContent } from "@mocode/shared";

type ChatStatus = "ready" | "streaming" | "submitted" | "error";

function extractLastUserText(messages: UIMessage[]): string {
  const user = messages.findLast((message) => message.role === "user");
  if (!user?.parts) return "";

  for (const part of user.parts) {
    if (part.type === "text" && "text" in part && typeof part.text === "string") {
      return part.text;
    }
  }
  return "";
}

export function resolvePreResponseEsc(params: {
  status: ChatStatus;
  messages: UIMessage[];
  lastSubmittedText: string;
}): { composerRestoreText: string; removeEmptyAssistant: boolean } | null {
  if (params.status !== "submitted" && params.status !== "streaming") return null;

  const last = params.messages[params.messages.length - 1];

  if (params.status === "streaming") {
    if (last?.role === "assistant" && hasVisibleAssistantContent(last)) return null;
    if (last?.role !== "user" && last?.role !== "assistant") return null;
  }

  const composerRestoreText = params.lastSubmittedText || extractLastUserText(params.messages);
  if (!composerRestoreText) return null;

  const hasEmptyAssistant =
    last?.role === "assistant" &&
    (!Array.isArray(last.parts) || last.parts.length === 0 || !hasVisibleAssistantContent(last));

  return {
    composerRestoreText,
    removeEmptyAssistant: hasEmptyAssistant || last?.role === "user",
  };
}
