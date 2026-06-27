import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { resolveRgBinary, runRipgrep } from "./ripgrep";

describe("resolveRgBinary", () => {
  test("returns a non-empty path when @vscode/ripgrep is installed", () => {
    const binary = resolveRgBinary();
    expect(binary.length).toBeGreaterThan(0);
  });
});

describe("runRipgrep", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `ripgrep-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    await writeFile(join(tempDir, ".gitignore"), "node_modules/\n");
    await mkdir(join(tempDir, "node_modules"), { recursive: true });
    await writeFile(join(tempDir, "node_modules", "foo.txt"), "needle inside node_modules");
    await writeFile(join(tempDir, "visible.txt"), "needle visible");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("respects .gitignore and excludes node_modules matches", async () => {
    const binary = resolveRgBinary();
    const result = await runRipgrep(tempDir, tempDir, "needle");

    const files = result.matches.map((m) => m.file);
    expect(files).toContain("visible.txt");
    expect(files.some((f) => f.includes("node_modules"))).toBe(false);
  });
});
