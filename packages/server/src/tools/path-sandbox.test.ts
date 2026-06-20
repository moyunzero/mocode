import { describe, expect, test } from "bun:test";
import { join } from "path";
import { resolvePathInCwd } from "./path-sandbox";

describe("resolvePathInCwd", () => {
    const cwd = "/repo/app";

    test("allows paths inside cwd", () => {
        expect(resolvePathInCwd(cwd, "src/index.ts")).toBe("/repo/app/src/index.ts");
        expect(resolvePathInCwd(cwd, "./README.md")).toBe("/repo/app/README.md");
    });

    test("blocks sibling directories that share a cwd prefix", () => {
        expect(resolvePathInCwd(cwd, "../app2/secret.txt")).toBeNull();
    });

    test("blocks absolute paths outside cwd", () => {
        expect(resolvePathInCwd(cwd, "/etc/passwd")).toBeNull();
    });

    test("normalizes cwd before checking", () => {
        const nested = join("/tmp", "mocode-sandbox-test", "project");
        expect(resolvePathInCwd(nested + "/", "src/main.ts")).toBe(
            join(nested, "src/main.ts"),
        );
    });
});
