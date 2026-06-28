import { describe, expect, test, mock } from "bun:test";
import {
  shouldPersistOnFinish,
  shouldPersistAbortedFinish,
  ingestAbortedUsageIfPresent,
} from "../lib/chat-abort";

describe("chat abort persistence (D-01)", () => {
  test("isAborted finish with partial assistant must persist", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
      {
        id: "a1",
        role: "assistant",
        parts: [{ type: "text", text: "partial response" }],
      },
    ];

    expect(
      shouldPersistAbortedFinish({
        isAborted: true,
        messages,
      }),
    ).toBe(true);
  });

  test("isAborted with user-only must persist", () => {
    expect(
      shouldPersistAbortedFinish({
        isAborted: true,
        messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] }],
      }),
    ).toBe(true);
  });

  test("isAborted with no persistable messages must not persist (D-02)", () => {
    expect(
      shouldPersistOnFinish({
        isAborted: true,
        messagesToPersist: [],
        responseMessage: undefined,
        hasPendingToolCalls: () => false,
      }),
    ).toBe(false);
  });

  test("aborted finish with pending tools still persists", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
      {
        id: "a1",
        role: "assistant",
        parts: [{ type: "text", text: "partial" }],
      },
    ];

    expect(
      shouldPersistOnFinish({
        isAborted: true,
        messagesToPersist: messages,
        responseMessage: {
          id: "a1",
          role: "assistant",
          parts: [{ type: "dynamic-tool", state: "input-streaming" }],
        },
        hasPendingToolCalls: () => true,
      }),
    ).toBe(true);
  });

  test("non-aborted finish with pending tools must not persist", () => {
    const responseMessage = {
      id: "a1",
      role: "assistant",
      parts: [{ type: "dynamic-tool", state: "input-streaming" }],
    };

    expect(
      shouldPersistOnFinish({
        isAborted: false,
        messagesToPersist: [{ id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] }, responseMessage],
        responseMessage,
        hasPendingToolCalls: () => true,
      }),
    ).toBe(false);
  });
});

describe("chat abort billing stub (D-19)", () => {
  test("should ingest usage on abort when completedUsage present", () => {
    const ingest = mock(() => Promise.resolve());
    ingestAbortedUsageIfPresent({
      completedUsage: { totalTokens: 42 },
      ingest,
    });
    expect(ingest).toHaveBeenCalled();
  });
});
