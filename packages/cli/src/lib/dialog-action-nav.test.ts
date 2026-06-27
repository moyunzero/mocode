import { describe, expect, test } from "bun:test";
import {
  BASH_APPROVAL_ACTION_COUNT,
  BASH_APPROVAL_DEFAULT_INDEX,
  moveDialogSelection,
} from "./dialog-action-nav";

describe("dialog-action-nav", () => {
  test("BASH_APPROVAL_ACTION_COUNT is 3", () => {
    expect(BASH_APPROVAL_ACTION_COUNT).toBe(3);
  });

  test("BASH_APPROVAL_DEFAULT_INDEX is 1 (Reject)", () => {
    expect(BASH_APPROVAL_DEFAULT_INDEX).toBe(1);
  });

  const moveCases = [
    { current: 1, direction: "up" as const, count: 3, expected: 0 },
    { current: 1, direction: "down" as const, count: 3, expected: 2 },
    { current: 0, direction: "up" as const, count: 3, expected: 0 },
    { current: 2, direction: "down" as const, count: 3, expected: 2 },
  ];

  test.each(moveCases)(
    "moveDialogSelection($current, $direction, $count) returns $expected",
    ({ current, direction, count, expected }) => {
      expect(moveDialogSelection(current, direction, count)).toBe(expected);
    },
  );
});
