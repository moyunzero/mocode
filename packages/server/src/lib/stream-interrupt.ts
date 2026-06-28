import type { UIMessage } from "ai";
import { hasVisibleAssistantContent } from "@mocode/shared";

export const INTERRUPTED_TOOL_ERROR_TEXT = "Interrupted by user";

type ToolPart = {
  type: string;
  state?: string;
  errorText?: string;
};

function isPendingToolPart(part: ToolPart): boolean {
  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
    const state = part.state;
    return state !== "output-available" && state !== "output-error";
  }
  return false;
}

function finalizeAssistantParts(parts: unknown[]): unknown[] {
  return parts.map((part) => {
    const toolPart = part as ToolPart;
    if (!isPendingToolPart(toolPart)) return part;
    return {
      ...toolPart,
      state: "output-error",
      errorText: INTERRUPTED_TOOL_ERROR_TEXT,
    };
  });
}

export function stripIncompleteAssistantMessages<UI_MESSAGE extends UIMessage>(
  messages: UI_MESSAGE[],
): UI_MESSAGE[] {
  return messages.filter(
    (message) => message.role !== "assistant" || hasVisibleAssistantContent(message),
  );
}

export function finalizeInterruptedAssistant<UI_MESSAGE extends UIMessage>(
  messages: UI_MESSAGE[],
): UI_MESSAGE[] {
  const lastIndex = messages.findLastIndex((message) => message.role === "assistant");
  if (lastIndex === -1) return messages;

  const last = messages[lastIndex];
  if (!Array.isArray(last.parts) || last.parts.length === 0) return messages;

  const updated = {
    ...last,
    parts: finalizeAssistantParts(last.parts),
  } as UI_MESSAGE;

  return [...messages.slice(0, lastIndex), updated, ...messages.slice(lastIndex + 1)];
}

export function normalizeInterruptedMessages<UI_MESSAGE extends UIMessage>(
  messages: UI_MESSAGE[],
): UI_MESSAGE[] {
  return stripIncompleteAssistantMessages(finalizeInterruptedAssistant(messages));
}
