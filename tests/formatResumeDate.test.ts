import assert from "node:assert/strict";
import test from "node:test";

import { formatResumeDate } from "../src/utils/formatResumeDate.ts";

test("formats ISO-like resume dates without timezone drift", () => {
  assert.equal(formatResumeDate("2024-01-15", "MMM YYYY"), "Jan 2024");
  assert.equal(formatResumeDate("2024-09", "MM/YYYY"), "09/2024");
  assert.equal(formatResumeDate("2024-09-30", "YYYY"), "2024");
});

test("preserves partial, current, and unrecognized dates safely", () => {
  assert.equal(formatResumeDate("2022", "MMM YYYY"), "2022");
  assert.equal(formatResumeDate("Present", "MM/YYYY"), "Present");
  assert.equal(formatResumeDate("Spring 2021", "YYYY"), "Spring 2021");
});
