import { describe, expect, test } from "bun:test";
import { buildBashEnv } from "./bash-env";

describe("buildBashEnv", () => {
    test("includes only allowlisted vars plus TERM", () => {
        process.env.DATABASE_URL = "postgres://secret";
        process.env.PATH = "/usr/bin";

        const env = buildBashEnv();

        expect(env.PATH).toBe("/usr/bin");
        expect(env.TERM).toBe("dumb");
        expect(env.DATABASE_URL).toBeUndefined();

        delete process.env.DATABASE_URL;
    });
});
