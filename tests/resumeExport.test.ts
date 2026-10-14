import assert from "node:assert/strict";
import test from "node:test";

import { TEMPLATE_DEFAULTS } from "../src/constants/design.ts";
import {
  calculatePrintedPageCount,
  createResumePdfTitle,
  getEmailHref,
  getExternalHref,
  getPhoneHref,
  getPrintPageStyle,
  PRINT_PAGE_DIMENSIONS,
} from "../src/utils/resumeExport.ts";
import type { ResumeDocument } from "../src/types/index.ts";

const documentFixture = (name: string, title: string): ResumeDocument => ({
  schemaVersion: 1,
  id: "resume-export-test",
  title,
  template: "classic",
  theme: TEMPLATE_DEFAULTS.classic.theme,
  page: { size: "A4", margin: 24 },
  layout: { sectionOrder: [], columns: [[], []], mode: "two", columnRatio: 55 },
  resumeInformation: {
    basicInfo: { id: "basicInfo", sectionTitle: "Basic information", visible: true, detail: { name } },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

test("creates a meaningful, filesystem-safe PDF title", () => {
  assert.equal(createResumePdfTitle(documentFixture("Renée O'Connor", "Backend résumé")), "Renee-O-Connor-Backend-resume");
  assert.equal(createResumePdfTitle(documentFixture("Alex Morgan", "Untitled resume")), "Alex-Morgan-Resume");
});

test("uses exact print dimensions for A4 and Letter", () => {
  assert.match(getPrintPageStyle("A4"), /size: A4/);
  assert.match(getPrintPageStyle("A4"), /width: 210mm/);
  assert.match(getPrintPageStyle("LETTER"), /size: letter/);
  assert.match(getPrintPageStyle("LETTER"), /width: 8\.5in/);
  assert.ok(PRINT_PAGE_DIMENSIONS.A4.heightPx > PRINT_PAGE_DIMENSIONS.LETTER.heightPx);
});

test("reports page overflow from rendered content height", () => {
  assert.equal(calculatePrintedPageCount(900, 1000), 1);
  assert.equal(calculatePrintedPageCount(1001, 1000), 1);
  assert.equal(calculatePrintedPageCount(1002, 1000), 2);
  assert.equal(calculatePrintedPageCount(2400, 1000), 3);
});

test("normalizes clickable contact and external links", () => {
  assert.equal(getEmailHref(" alex@example.com "), "mailto:alex@example.com");
  assert.equal(getPhoneHref("+91 (912) 345-6789"), "tel:+919123456789");
  assert.equal(getExternalHref("example.com/profile"), "https://example.com/profile");
  assert.equal(getExternalHref("https://example.com/profile"), "https://example.com/profile");
});
