import { TextAttributes } from "@opentui/core";
import { getNewlineHint } from "../terminal-capabilities";
import { useTheme } from "../providers/theme";

/** Footer hints: model label plus submit/newline shortcuts for this terminal. */
export function StatusBar() {
  const hint = getNewlineHint();
  const { colors } = useTheme();

  return (
    <box flexDirection="row" gap={1} flexWrap="wrap">
      <text fg={colors.primary}>Build</text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {">"}
      </text>
      <text>opus-4-6</text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        ·
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {hint.submit} 提交
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        ·
      </text>
      <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
        {hint.newline} 换行
      </text>
      {hint.note ? (
        <>
          <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
            ·
          </text>
          <text attributes={TextAttributes.DIM} fg={colors.dimSeparator}>
            {hint.note}
          </text>
        </>
      ) : null}
    </box>
  );
}