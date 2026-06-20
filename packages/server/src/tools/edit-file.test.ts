import { describe, expect, test } from "bun:test";
import { replaceAllLiteral } from "./edit-file";

describe("replaceAllLiteral", () => {
    test("replaces all literal occurrences", () => {
        expect(replaceAllLiteral("foo bar foo", "foo", "baz")).toBe("baz bar baz");
    });

    test("treats regex metacharacters as literal text", () => {
        expect(replaceAllLiteral("a.b (test)", "a.b (test)", "ok")).toBe("ok");
    });
});
