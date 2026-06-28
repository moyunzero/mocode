import { describe, expect, test } from "bun:test";
import {
  clearActiveStream,
  getActiveStreamResponse,
  registerStreamBuffer,
} from "./active-stream-registry";
import { StreamReplayBuffer } from "./stream-buffer";

describe("clearActiveStream buffer identity", () => {
  test("does not remove a newer buffer registered for the same session", () => {
    const oldBuffer = new StreamReplayBuffer();
    const newBuffer = new StreamReplayBuffer();

    registerStreamBuffer("session-race", "user-1", oldBuffer);
    registerStreamBuffer("session-race", "user-1", newBuffer);

    clearActiveStream("session-race", oldBuffer);

    const res = getActiveStreamResponse("session-race", "user-1");
    expect(res.status).toBe(200);
    clearActiveStream("session-race", newBuffer);
  });

  test("clears the matching buffer on persist failure path", () => {
    const buffer = new StreamReplayBuffer();
    registerStreamBuffer("session-fail", "user-1", buffer);

    clearActiveStream("session-fail", buffer);

    expect(getActiveStreamResponse("session-fail", "user-1").status).toBe(204);
  });

  test("clear without buffer removes current entry (legacy callers)", () => {
    const buffer = new StreamReplayBuffer();
    registerStreamBuffer("session-legacy", "user-1", buffer);

    clearActiveStream("session-legacy");

    expect(getActiveStreamResponse("session-legacy", "user-1").status).toBe(204);
  });
});
