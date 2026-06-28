import { describe, expect, test } from "bun:test";
import { resolvePreResponseEsc } from "./composer-restore";

describe("resolvePreResponseEsc (D-03)", () => {
  test("submitted status restores composer text from ref", () => {
    const result = resolvePreResponseEsc({
      status: "submitted",
      messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
      ],
      lastSubmittedText: "hello",
    });
    expect(result?.composerRestoreText).toBe("hello");
    expect(result?.removeEmptyAssistant).toBe(true);
  });

  test("submitted falls back to last user message when ref empty (initialPrompt path)", () => {
    const result = resolvePreResponseEsc({
      status: "submitted",
      messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "法国有什么好吃的呢？" }] },
      ],
      lastSubmittedText: "",
    });
    expect(result?.composerRestoreText).toBe("法国有什么好吃的呢？");
  });

  test("streaming with step-start-only assistant restores composer", () => {
    const result = resolvePreResponseEsc({
      status: "streaming",
      messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
        { id: "a1", role: "assistant", parts: [{ type: "step-start" }] },
      ],
      lastSubmittedText: "",
    });
    expect(result?.composerRestoreText).toBe("hello");
    expect(result?.removeEmptyAssistant).toBe(true);
  });

  test("streaming with visible assistant text returns null", () => {
    expect(
      resolvePreResponseEsc({
        status: "streaming",
        messages: [
          { id: "u1", role: "user", parts: [{ type: "text", text: "hello" }] },
          {
            id: "a1",
            role: "assistant",
            parts: [{ type: "text", text: "Bonjour" }],
          },
        ],
        lastSubmittedText: "hello",
      }),
    ).toBeNull();
  });

  test("ready status returns null", () => {
    expect(
      resolvePreResponseEsc({
        status: "ready",
        messages: [],
        lastSubmittedText: "hello",
      }),
    ).toBeNull();
  });
});
