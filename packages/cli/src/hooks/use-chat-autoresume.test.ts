import { describe, expect, test } from "bun:test";
import { shouldAutoResumeOnMount } from "../lib/stream-interrupt";

describe("shouldAutoResumeOnMount (D-10, D-11)", () => {
  test("true only for user-only when not yet auto-resumed and no initial prompt", () => {
    expect(
      shouldAutoResumeOnMount({
        eligibility: "user-only",
        hasAutoResumed: false,
        initialPromptPending: false,
      }),
    ).toBe(true);
  });

  test("false for partial-assistant even with messages", () => {
    expect(
      shouldAutoResumeOnMount({
        eligibility: "partial-assistant",
        hasAutoResumed: false,
        initialPromptPending: false,
      }),
    ).toBe(false);
  });

  test("false when already auto-resumed", () => {
    expect(
      shouldAutoResumeOnMount({
        eligibility: "user-only",
        hasAutoResumed: true,
        initialPromptPending: false,
      }),
    ).toBe(false);
  });

  test("false when initial prompt pending", () => {
    expect(
      shouldAutoResumeOnMount({
        eligibility: "user-only",
        hasAutoResumed: false,
        initialPromptPending: true,
      }),
    ).toBe(false);
  });
});
