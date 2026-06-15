/** Runtime context passed to slash-command actions. */
import type { ToastContextValue } from "../../providers/toast";
import type { DialogContextValue } from "../../providers/dialog";

export type CommandContext = {
    exit: () => void;
    /** Short-lived feedback for commands that don't open a dialog. */
    toast: ToastContextValue;
    /** Modal picker for commands like /theme or /models. */
    dialog: DialogContextValue;
}

export type Command = {
    name: string;
    description: string;
    value: string;
    /** Optional side effect; otherwise the command value is inserted into the textarea. */
    action?:(ctx:CommandContext) => void | Promise<void>;
}