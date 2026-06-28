import { describe, expect, test, mock, beforeEach } from "bun:test";
import { scheduleLocalSessionPersist } from "./use-chat-persist";

describe("scheduleLocalSessionPersist (D-06)", () => {
  beforeEach(() => {
    mock.restore();
  });

  test("calls persistFn within debounce window when status is streaming", async () => {
    const persistFn = mock(() => {});
    scheduleLocalSessionPersist({
      status: "streaming",
      sessionId: "s1",
      messages: [{ id: "m1" }],
      persistFn,
      debounceMs: 50,
    });

    await new Promise((r) => setTimeout(r, 80));
    expect(persistFn).toHaveBeenCalled();
  });

  test("persists immediately when status is ready", () => {
    const persistFn = mock(() => {});
    scheduleLocalSessionPersist({
      status: "ready",
      sessionId: "s1",
      messages: [{ id: "m1" }],
      persistFn,
      debounceMs: 400,
    });
    expect(persistFn).toHaveBeenCalledTimes(1);
  });

  test("ready persist is idempotent per explicit call (effect deps should not retrigger)", () => {
    const persistFn = mock(() => {});
    const params = {
      status: "ready" as const,
      sessionId: "s1",
      messages: [{ id: "m1" }],
      persistFn,
      debounceMs: 400,
    };
    scheduleLocalSessionPersist(params);
    scheduleLocalSessionPersist(params);
    expect(persistFn).toHaveBeenCalledTimes(2);
  });
});
