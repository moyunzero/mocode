type MessageLike = {
  role: string;
  parts?: unknown[];
};

/** Whether onFinish should write messages to the session row. */
export function shouldPersistOnFinish(params: {
  isAborted: boolean;
  messagesToPersist: MessageLike[];
  responseMessage: MessageLike | undefined;
  hasPendingToolCalls: (message: MessageLike) => boolean;
}): boolean {
  if (params.messagesToPersist.length === 0) return false;

  if (params.isAborted) return true;

  if (params.responseMessage && params.hasPendingToolCalls(params.responseMessage)) {
    return false;
  }

  return true;
}

/** @deprecated Use {@link shouldPersistOnFinish} */
export function shouldPersistAbortedFinish(params: {
  isAborted: boolean;
  messages: MessageLike[];
}): boolean {
  return shouldPersistOnFinish({
    isAborted: params.isAborted,
    messagesToPersist: params.messages,
    responseMessage: undefined,
    hasPendingToolCalls: () => false,
  });
}

export function ingestAbortedUsageIfPresent(params: {
  completedUsage: { totalTokens: number } | null | undefined;
  ingest: (usage: { totalTokens: number }) => void;
}): void {
  if (!params.completedUsage) return;
  params.ingest(params.completedUsage);
}
