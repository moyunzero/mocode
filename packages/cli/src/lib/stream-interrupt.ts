import type { UIMessage } from "ai";
import { hasVisibleAssistantContent } from "@mocode/shared";
import { stripIncompleteAssistantMessages as stripFromTransport } from "./local-chat-transport";

export const INTERRUPTED_TOOL_ERROR_TEXT = "Interrupted by user";

export type ResumeEligibility = "user-only" | "partial-assistant" | "none";
export type ChatStatus = "ready" | "streaming" | "submitted" | "error";
export type ResumeTransportAction = "regenerate" | "none";

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

/** Pending tool call ids on the last assistant message (for Esc during local tool exec). */
export function collectPendingToolCallIds(messages: UIMessage[]): string[] {
  const lastIndex = messages.findLastIndex((message) => message.role === "assistant");
  if (lastIndex === -1) return [];

  const parts = messages[lastIndex]?.parts;
  if (!Array.isArray(parts)) return [];

  const ids: string[] = [];
  for (const part of parts) {
    const toolPart = part as ToolPart & { toolCallId?: string };
    if (!isPendingToolPart(toolPart)) continue;
    if (typeof toolPart.toolCallId === "string") ids.push(toolPart.toolCallId);
  }
  return ids;
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

export function stripIncompleteAssistantMessages<UI_MESSAGE extends UIMessage>(
  messages: UI_MESSAGE[],
): UI_MESSAGE[] {
  return stripFromTransport(messages);
}

export function detectResumeEligibility(
  messages: UIMessage[],
  chatStatus: ChatStatus,
): ResumeEligibility {
  if (chatStatus === "streaming" || chatStatus === "submitted") return "none";
  if (messages.length === 0) return "none";

  const last = messages[messages.length - 1];
  if (last.role === "user") return "user-only";
  if (last.role === "assistant" && hasVisibleAssistantContent(last)) {
    return "partial-assistant";
  }
  return "none";
}

export function resolveResumeTransport(eligibility: ResumeEligibility): ResumeTransportAction {
  if (eligibility === "user-only") return "regenerate";
  // /resume on partial assistant: drop failed reply and regenerate from last user (D-11 UX).
  if (eligibility === "partial-assistant") return "regenerate";
  return "none";
}

export function shouldAutoResumeOnMount(params: {
  eligibility: ResumeEligibility;
  hasAutoResumed: boolean;
  initialPromptPending: boolean;
}): boolean {
  if (params.hasAutoResumed || params.initialPromptPending) return false;
  return params.eligibility === "user-only";
}
