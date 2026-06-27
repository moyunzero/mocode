import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import simpleGit from "simple-git";
import { Mode } from "@mocode/shared";
import { executeLocalTool } from "./local-tools";

describe("git tools via executeLocalTool", () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = join(tmpdir(), `git-tools-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });
    process.chdir(tempDir);

    const git = simpleGit(tempDir);
    await git.init(["-b", "main"]);
    await git.addConfig("user.email", "test@example.com");
    await git.addConfig("user.name", "Test User");
    await writeFile(join(tempDir, "README.md"), "initial\n");
    await git.add(".");
    await git.commit("initial commit");
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  test("gitStatus returns branch, clean flag, and file counts", async () => {
    const result = (await executeLocalTool("gitStatus", {}, Mode.BUILD)) as {
      branch: string;
      clean: boolean;
      staged: number;
      unstaged: number;
      untracked: number;
      summary: string;
    };

    expect(result.branch).toBe("main");
    expect(result.clean).toBe(true);
    expect(result.staged).toBe(0);
    expect(result.unstaged).toBe(0);
    expect(result.untracked).toBe(0);
    expect(result.summary).toContain("main");
  });

  test("gitDiff returns unstaged working tree changes by default", async () => {
    await writeFile(join(tempDir, "README.md"), "modified\n");

    const result = (await executeLocalTool("gitDiff", {}, Mode.BUILD)) as { diff: string };
    expect(result.diff).toContain("modified");
  });

  test("gitDiff with staged:true returns staged diff only", async () => {
    await writeFile(join(tempDir, "README.md"), "staged change\n");
    const git = simpleGit(tempDir);
    await git.add("README.md");

    const result = (await executeLocalTool("gitDiff", { staged: true }, Mode.BUILD)) as {
      diff: string;
    };
    expect(result.diff).toContain("staged change");
  });

  test("gitDiff with ref compares working tree against a commit", async () => {
    await writeFile(join(tempDir, "second.txt"), "second file\n");
    const git = simpleGit(tempDir);
    await git.add(".");
    await git.commit("second commit");
    await writeFile(join(tempDir, "second.txt"), "modified second\n");

    const result = (await executeLocalTool("gitDiff", { ref: "HEAD~1" }, Mode.BUILD)) as {
      diff: string;
    };
    expect(result.diff.length).toBeGreaterThan(0);
  });
});
