import assert from "node:assert/strict";
import test from "node:test";

import { calculatePaginationLayout, shouldKeepSectionTogether } from "../src/utils/resumePagination.ts";

test("moves a section that would cross the page boundary to the next page", () => {
  const result = calculatePaginationLayout(
    [[{ id: "section:projects", top: 850, height: 320 }]],
    1000,
    40,
    40
  );

  assert.deepEqual(result.breaks["section:projects"], { space: 190, continuationTitle: undefined });
  assert.equal(result.pageCount, 2);
});

test("keeps column flows independent and repeats a continued section heading", () => {
  const result = calculatePaginationLayout(
    [
      [
        { id: "section:work", top: 180, height: 360 },
        { id: "entry:work:second", top: 560, height: 500, continuationHeight: 32, continuationTitle: "Work Experience" },
      ],
      [{ id: "section:education", top: 180, height: 240 }],
    ],
    1000,
    40,
    40
  );

  assert.deepEqual(result.breaks["entry:work:second"], {
    space: 480,
    continuationTitle: "Work Experience",
  });
  assert.equal(result.breaks["section:education"], undefined);
  assert.equal(result.pageCount, 2);
});

test("splits a large section instead of wasting most of the current page", () => {
  assert.equal(shouldKeepSectionTogether(900, 820, 960), false);
  assert.equal(shouldKeepSectionTogether(400, 320, 960), true);
  assert.equal(shouldKeepSectionTogether(700, 720, 960), true);
});
