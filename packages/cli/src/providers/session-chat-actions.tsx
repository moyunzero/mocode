import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { ModeType, SupportedChatModelId } from "@mocode/shared";
import type { ResumeEligibility } from "../lib/stream-interrupt";

type SessionChatActions = {
  continueGeneration: (params: { mode: ModeType; model: SupportedChatModelId }) => Promise<void>;
  resumeStream: () => Promise<void>;
  getEligibility: () => ResumeEligibility;
};

let activeSessionChatActions: SessionChatActions | null = null;

export function getSessionChatActions(): SessionChatActions | null {
  return activeSessionChatActions;
}

const SessionChatActionsContext = createContext<{
  register: (actions: SessionChatActions | null) => void;
} | null>(null);

export function SessionChatActionsProvider({ children }: { children: ReactNode }) {
  const register = useCallback((actions: SessionChatActions | null) => {
    activeSessionChatActions = actions;
  }, []);

  return (
    <SessionChatActionsContext.Provider value={{ register }}>
      {children}
    </SessionChatActionsContext.Provider>
  );
}

export function useRegisterSessionChatActions(actions: SessionChatActions | null) {
  const ctx = useContext(SessionChatActionsContext);

  useEffect(() => {
    if (!ctx) return;
    ctx.register(actions);
    return () => ctx.register(null);
  }, [ctx, actions]);
}

export function useSessionChatActions() {
  return getSessionChatActions();
}
