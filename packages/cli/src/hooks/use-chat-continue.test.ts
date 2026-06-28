import { describe, expect, test } from "bun:test";
import { resolveResumeTransport } from "../lib/stream-interrupt";

describe("resolveResumeTransport (D-15 regenerate)", () => {
  test("user-only returns regenerate", () => {
    expect(resolveResumeTransport("user-only")).toBe("regenerate");
  });

  test("partial-assistant returns regenerate (drop partial, redo)", () => {
    expect(resolveResumeTransport("partial-assistant")).toBe("regenerate");
  });

  test("none returns none", () => {
    expect(resolveResumeTransport("none")).toBe("none");
  });
});
