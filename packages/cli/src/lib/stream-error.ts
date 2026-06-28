/** Unwrap MoCode `{ error: string }` JSON bodies embedded in Error.message. */
function unwrapServerErrorEnvelope(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return text;

  try {
    const data = JSON.parse(trimmed) as { error?: unknown };
    if (typeof data.error === "string" && data.error.length > 0) {
      return data.error;
    }
  } catch {
    // Not JSON — return the original text.
  }

  return text;
}

/** Surfaces real stream/API errors in the TUI instead of AI SDK's generic mask. */
export function formatChatStreamError(error: unknown): string {
  if (error == null) {
    return "Unknown error";
  }
  if (typeof error === "string") {
    return unwrapServerErrorEnvelope(error);
  }
  if (error instanceof Error) {
    return unwrapServerErrorEnvelope(error.message);
  }
  return String(error);
}
