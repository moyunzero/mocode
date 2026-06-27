import type { ReactNode } from "react";

export type DialogConfig = {
    title: string;
    children: ReactNode;
    /**
     * Called before dialog state clears (Phase 01, plan 02).
     * Used by bash approval to resolve "reject" on Esc/backdrop dismiss (D-15/A4).
     * DialogProvider invokes this inside close() before nulling currentDialog.
     */
    onClose?: () => void;
}