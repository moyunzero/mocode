import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import {
  BASH_APPROVAL_ACTION_COUNT,
  BASH_APPROVAL_DEFAULT_INDEX,
  moveDialogSelection,
} from "../../lib/dialog-action-nav";
import { useKeyboardLayer } from "../../providers/keyboard-layer";
import { useTheme } from "../../providers/theme";

type BashApprovalDialogProps = {
  command: string;
  onApproveOnce: () => void;
  onReject: () => void;
  onAllowSession: () => void;
};

type ActionButtonProps = {
  label: string;
  hint?: string;
  selected?: boolean;
  onSelect: () => void;
  onMouseMove?: () => void;
};

function ActionButton({ label, hint, selected, onSelect, onMouseMove }: ActionButtonProps) {
  const { colors } = useTheme();

  return (
    <box
      flexDirection="row"
      paddingX={1}
      height={1}
      backgroundColor={selected ? colors.selection : undefined}
      onMouseMove={onMouseMove}
      onMouseDown={onSelect}
    >
      <text selectable={false} fg={selected ? "black" : "white"} attributes={TextAttributes.BOLD}>
        {label}
      </text>
      {hint ? (
        <text selectable={false} fg={selected ? "black" : "gray"}>
          {" "}
          {hint}
        </text>
      ) : null}
    </box>
  );
}

/** Three-action modal body for dangerous bash approval (D-12, D-14). Phase 01 plan 02 UI; plan 03 keyboard. */
export function BashApprovalDialog({
  command,
  onApproveOnce,
  onReject,
  onAllowSession,
}: BashApprovalDialogProps) {
  // Default highlight = Reject (index 1). Enter without arrow keys denies the command (D-20).
  const [selectedIndex, setSelectedIndex] = useState(BASH_APPROVAL_DEFAULT_INDEX);
  const { isTopLayer } = useKeyboardLayer();

  const actions = [
    { label: "Approve once", onSelect: onApproveOnce },
    { label: "Reject", onSelect: onReject },
    {
      label: "Allow for this session",
      hint: "(skip future prompts for this command)",
      onSelect: onAllowSession,
    },
  ] as const;

  // Keyboard layer "dialog" must be topmost — same pattern as DialogSearchList (D-21).
  // preventDefault on arrows stops them from scrolling the chat behind the modal.
  useKeyboard((key) => {
    if (!isTopLayer("dialog")) return;

    if (key.name === "return" || key.name === "enter") {
      actions[selectedIndex]?.onSelect();
    } else if (key.name === "up") {
      key.preventDefault();
      setSelectedIndex((i) => moveDialogSelection(i, "up", BASH_APPROVAL_ACTION_COUNT));
    } else if (key.name === "down") {
      key.preventDefault();
      setSelectedIndex((i) => moveDialogSelection(i, "down", BASH_APPROVAL_ACTION_COUNT));
    }
  });

  return (
    <box flexDirection="column" gap={1}>
      <text attributes={TextAttributes.DIM}>The model wants to run:</text>
      <box paddingX={1} paddingY={1}>
        <text selectable={false}>{command}</text>
      </box>
      <box flexDirection="column" gap={0}>
        {actions.map((action, i) => (
          <ActionButton
            key={action.label}
            label={action.label}
            hint={"hint" in action ? action.hint : undefined}
            selected={i === selectedIndex}
            onSelect={action.onSelect}
            onMouseMove={() => setSelectedIndex(i)}
          />
        ))}
      </box>
    </box>
  );
}
