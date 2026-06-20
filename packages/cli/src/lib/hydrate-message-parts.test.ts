import { describe, expect, test } from "bun:test";
import { hydrateClientParts } from "./hydrate-message-parts";

describe("hydrateClientParts", () => {
    test("falls back to text content when parts are missing", () => {
        expect(hydrateClientParts(null, "Hello from legacy message")).toEqual([
            { type: "text", text: "Hello from legacy message" },
        ]);
    });

    test("returns empty array when parts and content are both absent", () => {
        expect(hydrateClientParts(null, "")).toEqual([]);
    });

    test("hydrates persisted tool-call parts with done status", () => {
        expect(
            hydrateClientParts(
                [{ type: "tool-call", id: "1", name: "readFile", args: { path: "a.ts" } }],
                "",
            ),
        ).toEqual([
            {
                type: "tool-call",
                id: "1",
                name: "readFile",
                args: { path: "a.ts" },
                status: "done",
            },
        ]);
    });

    test("normalizes legacy tool_call parts", () => {
        expect(
            hydrateClientParts(
                [{ type: "tool_call", id: "2", name: "grep", args: { pattern: "foo" } }],
                "",
            ),
        ).toEqual([
            {
                type: "tool-call",
                id: "2",
                name: "grep",
                args: { pattern: "foo" },
                status: "done",
            },
        ]);
    });
});
