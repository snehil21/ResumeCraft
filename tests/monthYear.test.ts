import assert from "node:assert/strict";
import test from "node:test";

import { fromMonthInputValue, toMonthInputValue } from "../src/utils/monthYear.ts";

test("converts stored resume dates into month input values", () => {
  assert.equal(toMonthInputValue("2026-05-15"), "2026-05");
  assert.equal(toMonthInputValue("2024-8"), "2024-08");
  assert.equal(toMonthInputValue("August 2024"), "2024-08");
  assert.equal(toMonthInputValue("Aug 2024"), "2024-08");
  assert.equal(toMonthInputValue("08/2024"), "2024-08");
});

test("keeps month input values in the partial ISO format used by the resume", () => {
  assert.equal(fromMonthInputValue("2024-08"), "2024-08");
  assert.equal(toMonthInputValue("Present"), "");
  assert.equal(toMonthInputValue(""), "");
});
