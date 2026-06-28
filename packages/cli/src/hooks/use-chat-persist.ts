type PersistStatus = "ready" | "streaming" | "submitted";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function scheduleLocalSessionPersist(params: {
  status: PersistStatus;
  sessionId: string;
  messages: unknown[];
  persistFn: () => void;
  debounceMs: number;
}): void {
  const key = params.sessionId;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);

  if (params.status === "ready") {
    params.persistFn();
    timers.delete(key);
    return;
  }

  if (params.status === "streaming" || params.status === "submitted") {
    const timer = setTimeout(() => {
      params.persistFn();
      timers.delete(key);
    }, params.debounceMs);
    timers.set(key, timer);
  }
}
