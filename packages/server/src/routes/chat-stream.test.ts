import { describe, expect, test } from "bun:test";
import {
  getActiveStreamResponse,
  registerStreamBuffer,
  clearActiveStream,
} from "../lib/active-stream-registry";
import { StreamReplayBuffer } from "../lib/stream-buffer";

describe("GET /chat/:id/stream (D-12)", () => {
  test("returns 204 when no active stream registered", () => {
    clearActiveStream("session-1");
    const res = getActiveStreamResponse("session-1", "user-1");
    expect(res.status).toBe(204);
  });

  test("returns 200 when active stream registered for owner", async () => {
    const buffer = new StreamReplayBuffer();
    const source = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new TextEncoder().encode("data: {}\n\n"));
        c.close();
      },
    });
    buffer.ingest(source);
    registerStreamBuffer("session-1", "user-1", buffer);

    await new Promise((r) => setTimeout(r, 5));

    const res = getActiveStreamResponse("session-1", "user-1");
    expect(res.status).toBe(200);
    clearActiveStream("session-1");
  });

  test("returns 404 for cross-user session (T-03-02)", () => {
    const buffer = new StreamReplayBuffer();
    registerStreamBuffer("session-1", "owner-user", buffer);
    const res = getActiveStreamResponse("session-1", "other-user");
    expect(res.status).toBe(404);
    clearActiveStream("session-1");
  });
});

describe("credits gate scaffold (D-22)", () => {
  test("getActiveStreamResponse respects creditsAllowed flag", () => {
    clearActiveStream("session-2");
    const res = getActiveStreamResponse("session-2", "user-1", { creditsAllowed: false });
    expect(res.status).toBe(402);
  });
});
