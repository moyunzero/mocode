/** Runtime context passed to slash-command actions. */
import type { ToastContextValue } from "../../providers/toast";
import type { DialogContextValue } from "../../providers/dialog";
import type { Mode } from "@mocode/database/enums";
import type { SupportedChatModelId } from "@mocode/shared";

export type CommandContext = {
    exit: () => void;
    /** Short-lived feedback for commands that don't open a dialog. */
    toast: ToastContextValue;
    /** Modal picker for commands like /theme, /agents, or /models. */
    dialog: DialogContextValue;
    /** Navigation utility for commands that open a new page (e.g. /new). */
    navigate: (path:string) => void;
    /** Current agent mode from PromptConfigProvider; passed so actions avoid an extra hook. */
    mode: Mode;
    setMode: (mode:Mode) => void;
    /** Updates the chat model used for subsequent streaming requests. */
    setModel: (model:SupportedChatModelId) => void;
}

export type Command = {
    name: string;
    description: string;
    /** Text inserted when the user picks a command without an action, e.g. "/models ". */
    value: string;
    /** Optional side effect; otherwise the command value is inserted into the textarea. */
    action?:(ctx:CommandContext) => void | Promise<void>;
}