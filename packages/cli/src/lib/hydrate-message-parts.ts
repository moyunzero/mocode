import { messagePartsSchema } from "@mocode/shared";
import type { ClientMessagePart } from "../hooks/use-chat";

/** Hydrates persisted DB parts; falls back to plain text content for legacy rows. */
export function hydrateClientParts(
    parts: unknown | null,
    content: string,
): ClientMessagePart[] {
    const parsedParts = parts === null ? null : messagePartsSchema.safeParse(parts);

    if (parsedParts?.success) {
        return parsedParts.data.map((part) =>
            part.type === "tool-call" || part.type === "tool_call"
                ? {
                      type: "tool-call",
                      id: part.id,
                      name: part.name,
                      args: part.args,
                      ...(part.result !== undefined ? { result: part.result } : {}),
                      status: "done" as const,
                  }
                : part,
        );
    }

    return content ? [{ type: "text", text: content }] : [];
}
