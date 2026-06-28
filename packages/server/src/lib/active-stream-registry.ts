import { StreamReplayBuffer } from "./stream-buffer";

type ActiveEntry = {
  userId: string;
  buffer: StreamReplayBuffer;
};

const activeStreams = new Map<string, ActiveEntry>();

export function registerStreamBuffer(
  sessionId: string,
  userId: string,
  buffer: StreamReplayBuffer,
): void {
  activeStreams.set(sessionId, { userId, buffer });
}

export function clearActiveStream(
  sessionId: string,
  buffer?: StreamReplayBuffer,
): void {
  const current = activeStreams.get(sessionId);
  if (!current) return;
  if (buffer && current.buffer !== buffer) return;
  activeStreams.delete(sessionId);
}

export function getActiveStreamResponse(
  sessionId: string,
  userId: string,
  options?: { creditsAllowed?: boolean },
): Response {
  if (options?.creditsAllowed === false) {
    return new Response(null, { status: 402 });
  }

  const entry = activeStreams.get(sessionId);
  if (!entry) {
    return new Response(null, { status: 204 });
  }

  if (entry.userId !== userId) {
    return new Response(null, { status: 404 });
  }

  return new Response(entry.buffer.createReplayStream(), {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}
