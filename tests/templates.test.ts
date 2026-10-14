import assert from "node:assert/strict";
import test from "node:test";

import { DESIGN_LIMITS, TEMPLATE_DEFAULTS } from "../src/constants/design.ts";
import { TEMPLATE_OPTIONS, getTemplateOption } from "../src/constants/templates.ts";
import { isResumeDocument } from "../src/utils/resumeDocument.ts";

test("defines three distinct resume templates", () => {
  assert.deepEqual(TEMPLATE_OPTIONS.map(({ title }) => title), [
    "ATS Classic",
    "Modern Split",
    "Compact Technical",
  ]);
  assert.equal(getTemplateOption("vertical").supportsColumns, false);
  assert.equal(getTemplateOption("classic").supportsColumns, true);
  assert.equal(getTemplateOption("compact").supportsColumns, true);
});

test("keeps every template default inside the safe design limits", () => {
  Object.values(TEMPLATE_DEFAULTS).forEach(({ theme, pageMargin, columnRatio }) => {
    assert.ok(theme.baseFontSize >= DESIGN_LIMITS.baseFontSize.min);
    assert.ok(theme.baseFontSize <= DESIGN_LIMITS.baseFontSize.max);
    assert.ok(theme.nameFontSize >= DESIGN_LIMITS.nameFontSize.min);
    assert.ok(theme.headingFontSize >= DESIGN_LIMITS.headingFontSize.min);
    assert.ok(pageMargin >= DESIGN_LIMITS.pageMargin.min);
    assert.ok(columnRatio >= DESIGN_LIMITS.columnRatio.min);
    assert.ok(columnRatio <= DESIGN_LIMITS.columnRatio.max);
  });
  assert.ok(TEMPLATE_DEFAULTS.compact.theme.baseFontSize < TEMPLATE_DEFAULTS.classic.theme.baseFontSize);
});

test("accepts Compact Technical documents in the versioned schema", () => {
  const timestamp = "2026-01-01T00:00:00.000Z";
  const section = (id: string) => ({ id, sectionTitle: id, visible: true });
  const document = {
    schemaVersion: 1,
    id: "resume-test",
    title: "Technical resume",
    template: "compact",
    theme: TEMPLATE_DEFAULTS.compact.theme,
    page: { size: "A4", margin: 18 },
    layout: { sectionOrder: [], columns: [[], []], mode: "two", columnRatio: 60 },
    resumeInformation: {
      basicInfo: section("basicInfo"), workExp: section("workExp"),
      project: section("project"), education: section("education"),
      achievement: section("achievement"), summary: section("summary"), other: section("other"),
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  assert.equal(isResumeDocument(document), true);
});
