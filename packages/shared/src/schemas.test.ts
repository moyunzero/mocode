import { describe, expect, test } from "bun:test";
import { messagePartsSchema } from "./schemas";

describe("messagePartsSchema", () => {
    test("accepts legacy tool_call discriminator", () => {
        const result = messagePartsSchema.safeParse([
            {
                type: "tool_call",
                id: "1",
                name: "readFile",
                args: { path: "src/index.ts" },
            },
        ]);

        expect(result.success).toBe(true);
    });
});
