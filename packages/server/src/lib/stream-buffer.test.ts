import { describe, expect, test } from "bun:test";
import { StreamReplayBuffer } from "./stream-buffer";

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) text += decoder.decode(value);
  }
  return text;
}

describe("StreamReplayBuffer (D-12 SaaS)", () => {
  test("replays buffered chunks to late reconnect", async () => {
    const buffer = new StreamReplayBuffer();
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("chunk-a\n"));
        controller.enqueue(new TextEncoder().encode("chunk-b\n"));
        controller.close();
      },
    });

    buffer.ingest(source);

    await new Promise((r) => setTimeout(r, 10));

    const replay = buffer.createReplayStream();
    const text = await readAll(replay);
    expect(text).toBe("chunk-a\nchunk-b\n");
  });

  test("live subscriber receives chunks after connect", async () => {
    const buffer = new StreamReplayBuffer();
    let resolveGate!: () => void;
    const gate = new Promise<void>((r) => {
      resolveGate = r;
    });

    const source = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode("early\n"));
        await gate;
        controller.enqueue(new TextEncoder().encode("late\n"));
        controller.close();
      },
    });

    buffer.ingest(source);

    await new Promise((r) => setTimeout(r, 5));
    const replay = buffer.createReplayStream();
    const readPromise = readAll(replay);

    resolveGate();
    const text = await readPromise;
    expect(text).toBe("early\nlate\n");
  });
});
