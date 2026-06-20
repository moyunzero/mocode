import { describe, expect, test } from "bun:test";

/** Mirrors the resume lock pattern in routes/chat.ts. */
function createResumeLock() {
    const active = new Set<string>();

    return {
        tryAcquire(sessionId: string): boolean {
            if (active.has(sessionId)) return false;
            active.add(sessionId);
            return true;
        },
        release(sessionId: string) {
            active.delete(sessionId);
        },
    };
}

describe("resume session lock", () => {
    test("blocks concurrent resume for the same session", () => {
        const lock = createResumeLock();
        expect(lock.tryAcquire("session-1")).toBe(true);
        expect(lock.tryAcquire("session-1")).toBe(false);
    });

    test("allows resume again after release", () => {
        const lock = createResumeLock();
        expect(lock.tryAcquire("session-1")).toBe(true);
        lock.release("session-1");
        expect(lock.tryAcquire("session-1")).toBe(true);
    });
});
