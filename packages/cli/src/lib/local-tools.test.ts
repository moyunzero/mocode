import { describe, expect, test } from "bun:test";
import { Mode } from "@mocode/shared";
import { executeLocalTool } from "./local-tools";

describe("executeLocalTool PLAN mode guards", () => {
  test("gitStatus succeeds in PLAN mode", async () => {
    await expect(executeLocalTool("gitStatus", {}, Mode.PLAN)).resolves.toBeDefined();
  });

  test("bash throws in PLAN mode", async () => {
    await expect(executeLocalTool("bash", { command: "echo hi" }, Mode.PLAN)).rejects.toThrow(
      /not available in PLAN mode/,
    );
  });
});
