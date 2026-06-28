import { describe, expect, test } from "bun:test";
import { Mode } from "@mocode/shared";
import { requiresLocalWriteApproval } from "./local-write-approval";

describe("requiresLocalWriteApproval", () => {
  test("writeFile in BUILD requires approval", () => {
    expect(requiresLocalWriteApproval("writeFile", Mode.BUILD, new Set())).toBe(true);
  });

  test("editFile in BUILD requires approval", () => {
    expect(requiresLocalWriteApproval("editFile", Mode.BUILD, new Set())).toBe(true);
  });

  test("readFile does not require approval", () => {
    expect(requiresLocalWriteApproval("readFile", Mode.BUILD, new Set())).toBe(false);
  });

  test("PLAN mode skips approval gate", () => {
    expect(requiresLocalWriteApproval("writeFile", Mode.PLAN, new Set())).toBe(false);
  });

  test("session allowlist skips approval", () => {
    expect(requiresLocalWriteApproval("writeFile", Mode.BUILD, new Set(["writeFile"]))).toBe(
      false,
    );
  });
});
