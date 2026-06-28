/** Minimal shape for transcript visibility checks (CLI + server). */
export type AssistantMessageLike = {
  role: string;
  parts?: Array<{ type: string; text?: string }>;
};

/** Transcript-visible assistant body (text, reasoning, or tool parts — not step-start alone). */
export function hasVisibleAssistantContent(message: AssistantMessageLike): boolean {
  if (message.role !== "assistant") return false;
  if (!Array.isArray(message.parts) || message.parts.length === 0) return false;

  return message.parts.some((part) => {
    if (part.type === "text" && typeof part.text === "string" && part.text.length > 0) return true;
    if (part.type === "reasoning" && typeof part.text === "string" && part.text.length > 0) {
      return true;
    }
    return part.type === "dynamic-tool" || part.type.startsWith("tool-");
  });
}
