import assert from "node:assert/strict";
import test from "node:test";

import {
  colorContrastRatio,
  ensureReadableBodyColor,
  isReadableBodyColor,
  SAFE_BODY_TEXT_COLOR,
} from "../src/utils/colorContrast.ts";

test("accepts readable body colors and rejects white on white", () => {
  assert.ok(colorContrastRatio("#1f2937") >= 4.5);
  assert.equal(isReadableBodyColor("#1f2937"), true);
  assert.equal(isReadableBodyColor("#ffffff"), false);
});

test("replaces unsafe and invalid body colors with the safe default", () => {
  assert.equal(ensureReadableBodyColor("#ffffff"), SAFE_BODY_TEXT_COLOR);
  assert.equal(ensureReadableBodyColor("not-a-color"), SAFE_BODY_TEXT_COLOR);
  assert.equal(ensureReadableBodyColor("#111827"), "#111827");
});
