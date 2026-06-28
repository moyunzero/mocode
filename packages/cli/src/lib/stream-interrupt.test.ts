import { describe, expect, test } from "bun:test";
import {
  collectPendingToolCallIds,
  finalizeInterruptedAssistant,
  detectResumeEligibility,
  INTERRUPTED_TOOL_ERROR_TEXT,
  stripIncompleteAssistantMessages,
} from "./stream-interrupt";

describe("finalizeInterruptedAssistant", () => {
  test("pending dynamic-tool becomes output-error with Interrupted by user (D-04)", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "run tool" }] },
      {
        id: "a1",
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "bash",
            toolCallId: "tc1",
            state: "input-streaming",
            input: { command: "ls" },
          },
        ],
      },
    ] as never;

    const result = finalizeInterruptedAssistant(messages);
    const toolPart = result[1].parts[0] as { state: string; errorText?: string };
    expect(toolPart.state).toBe("output-error");
    expect(toolPart.errorText).toBe(INTERRUPTED_TOOL_ERROR_TEXT);
    expect(INTERRUPTED_TOOL_ERROR_TEXT).toBe("Interrupted by user");
  });
});

describe("collectPendingToolCallIds", () => {
  test("returns pending tool call ids from last assistant", () => {
    const ids = collectPendingToolCallIds([
      { id: "u1", role: "user", parts: [{ type: "text", text: "run" }] },
      {
        id: "a1",
        role: "assistant",
        parts: [
          {
            type: "dynamic-tool",
            toolName: "bash",
            toolCallId: "tc1",
            state: "input-available",
            input: { command: "sleep 20" },
          },
        ],
      },
    ] as never);
    expect(ids).toEqual(["tc1"]);
  });
});

describe("stripIncompleteAssistantMessages", () => {
  test("removes zero-part assistant rows (D-02)", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
      { id: "a1", role: "assistant", parts: [] },
    ] as never;
    expect(stripIncompleteAssistantMessages(messages)).toHaveLength(1);
  });

  test("removes step-start-only assistant placeholders", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] },
      { id: "a1", role: "assistant", parts: [{ type: "step-start" }] },
    ] as never;
    expect(stripIncompleteAssistantMessages(messages)).toHaveLength(1);
  });

  test("retains partial text parts (D-02)", () => {
    const messages = [
      {
        id: "a1",
        role: "assistant",
        parts: [{ type: "text", text: "partial answer" }],
      },
    ] as never;
    expect(stripIncompleteAssistantMessages(messages)).toHaveLength(1);
  });
});

describe("detectResumeEligibility", () => {
  test("returns user-only when last message is user and status ready (D-10)", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
    ] as never;
    expect(detectResumeEligibility(messages, "ready")).toBe("user-only");
  });

  test("returns partial-assistant when last assistant has text parts (D-14)", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
      {
        id: "a1",
        role: "assistant",
        parts: [{ type: "text", text: "partial" }],
      },
    ] as never;
    expect(detectResumeEligibility(messages, "ready")).toBe("partial-assistant");
  });

  test("returns none for step-start-only assistant tail", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
      { id: "a1", role: "assistant", parts: [{ type: "step-start" }] },
    ] as never;
    expect(detectResumeEligibility(messages, "ready")).toBe("none");
  });

  test("returns none when status is streaming or submitted (D-14)", () => {
    const messages = [
      { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
    ] as never;
    expect(detectResumeEligibility(messages, "streaming")).toBe("none");
    expect(detectResumeEligibility(messages, "submitted")).toBe("none");
  });
});

describe("auto-resume policy (D-11)", () => {
  test("partial-assistant eligibility alone must not imply auto-resume", () => {
    const messages = [
      {
        id: "a1",
        role: "assistant",
        parts: [{ type: "text", text: "partial" }],
      },
    ] as never;
    expect(detectResumeEligibility(messages, "ready")).toBe("partial-assistant");
    expect(detectResumeEligibility(messages, "ready")).not.toBe("user-only");
  });
});
