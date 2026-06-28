type Chunk = Uint8Array;

type Subscriber = {
  push: (chunk: Chunk) => void;
  close: () => void;
};

/** Buffers SSE chunks from the tee branch so GET /chat/:id/stream can replay mid-flight. */
export class StreamReplayBuffer {
  private chunks: Chunk[] = [];
  private closed = false;
  private subscribers = new Set<Subscriber>();

  ingest(stream: ReadableStream<Uint8Array>): void {
    const reader = stream.getReader();
    void (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value || value.byteLength === 0) continue;
          this.chunks.push(value);
          for (const sub of this.subscribers) {
            sub.push(value);
          }
        }
      } catch {
        // Ingest errors should not block the primary client SSE branch.
      } finally {
        this.closed = true;
        for (const sub of this.subscribers) {
          sub.close();
        }
        this.subscribers.clear();
      }
    })();
  }

  createReplayStream(): ReadableStream<Uint8Array> {
    let replayIndex = 0;
    const buffer = this;
    let subscriber: Subscriber | null = null;

    return new ReadableStream({
      start(controller) {
        while (replayIndex < buffer.chunks.length) {
          controller.enqueue(buffer.chunks[replayIndex]!);
          replayIndex++;
        }
        if (buffer.closed) {
          controller.close();
          return;
        }

        subscriber = {
          push(chunk) {
            controller.enqueue(chunk);
          },
          close() {
            controller.close();
          },
        };
        buffer.subscribers.add(subscriber);
      },
      cancel() {
        if (subscriber) buffer.subscribers.delete(subscriber);
      },
    });
  }
}
