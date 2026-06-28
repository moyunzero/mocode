import { Mode, type ModeType } from "@mocode/shared";
import type { LanguageModelUsage } from "ai";

export function shouldShowGeneratingInFooter(params: {
  streaming: boolean;
  hasTextPart: boolean;
  toolsPending: boolean;
}): boolean {
  return params.streaming && !params.hasTextPart && !params.toolsPending;
}

export function shouldShowDurationInFooter(params: {
  streaming: boolean;
  durationMs?: number;
}): boolean {
  if (params.streaming) return false;
  return params.durationMs != null && params.durationMs > 0;
}

function formatDuration(durationMs: number): string {
  const seconds = durationMs / 1000;
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}

export function formatAssistantFooter(params: {
  mode: ModeType;
  model: string;
  durationMs?: number;
  streaming: boolean;
  usage?: LanguageModelUsage;
}): string {
  const parts: string[] = [];
  parts.push(params.mode === Mode.PLAN ? "Plan" : "Build");
  parts.push(params.model);

  if (shouldShowDurationInFooter(params)) {
    parts.push(formatDuration(params.durationMs!));
  }

  if (params.usage?.inputTokens != null) {
    parts.push(`↑${params.usage.inputTokens}`);
  }
  if (params.usage?.outputTokens != null) {
    parts.push(`↓${params.usage.outputTokens}`);
  }

  return parts.join(" · ");
}
