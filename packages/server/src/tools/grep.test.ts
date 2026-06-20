import { describe, expect, test } from "bun:test";
import { MAX_GREP_PATTERN_LENGTH, validateGrepPattern } from "./grep";

describe("validateGrepPattern", () => {
    test("rejects empty patterns", () => {
        expect(validateGrepPattern("")).toBe("Pattern must not be empty");
    });

    test("rejects overly long patterns", () => {
        expect(validateGrepPattern("a".repeat(MAX_GREP_PATTERN_LENGTH + 1))).toMatch(/maximum length/);
    });

    test("accepts normal patterns", () => {
        expect(validateGrepPattern("function\\s+\\w+")).toBeNull();
    });
});
