import assert from "node:assert/strict";
import test from "node:test";

import { TEMPLATE_DEFAULTS } from "../src/constants/design.ts";
import type { ResumeDocument } from "../src/types/index.ts";
import { analyzeResumeHealth, isValidResumeLink } from "../src/utils/resumeHealth.ts";

const healthyDocument = (): ResumeDocument => ({
  schemaVersion: 1,
  id: "resume-health-test",
  title: "Backend resume",
  template: "classic",
  theme: TEMPLATE_DEFAULTS.classic.theme,
  page: { size: "A4", margin: 24 },
  layout: {
    sectionOrder: ["summary", "workExp", "education", "skills"],
    columns: [["summary", "education"], ["workExp", "skills"]],
    mode: "two",
    columnRatio: 55,
  },
  resumeInformation: {
    basicInfo: {
      id: "basicInfo", sectionTitle: "Basic Info", visible: true,
      detail: { name: "Alex Morgan", title: "Backend Engineer", email: "alex@example.com", phone: "+91 91234 56789", linkedin: "linkedin.com/in/alex" },
    },
    summary: { id: "summary", sectionTitle: "Summary", visible: true, detail: "Backend engineer focused on reliable distributed systems and clear operational ownership." },
    workExp: {
      id: "workExp", sectionTitle: "Work Experience", visible: true,
      details: [{ id: "work-1", title: "Senior Engineer", companyName: "Example Systems", startDate: "2022-01", endDate: "2025-06", points: ["Improved service reliability through automated recovery and actionable monitoring."] }],
    },
    education: {
      id: "education", sectionTitle: "Education", visible: true,
      details: [{ id: "education-1", title: "Bachelor of Technology", college: "Example University", startDate: "2017-08", endDate: "2021-05" }],
    },
    skills: { id: "skills", sectionTitle: "Skills", visible: true, kind: "list", points: ["Java Spring AWS Kafka PostgreSQL"] },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

test("returns a clean local review for a complete, readable document", () => {
  const report = analyzeResumeHealth(healthyDocument(), { pageCount: 1 });
  assert.deepEqual(report.counts, { critical: 0, recommended: 0, optional: 0 });
  assert.equal(report.findings.length, 0);
});

test("groups missing essentials by severity and links to editable sections", () => {
  const document = healthyDocument();
  document.resumeInformation.basicInfo.detail = { name: "Alex Morgan" };
  document.resumeInformation.workExp.details = [];
  document.resumeInformation.summary.visible = false;

  const report = analyzeResumeHealth(document);
  assert.ok(report.counts.critical >= 2);
  assert.ok(report.counts.recommended >= 2);
  assert.ok(report.findings.some((finding) => finding.title === "Add an email address" && finding.target.sectionKey === "basicInfo"));
  assert.ok(report.findings.some((finding) => finding.title === "Work Experience needs content" && finding.target.sectionKey === "workExp"));
});

test("detects invalid links, problematic bullets, and inconsistent dates", () => {
  const document = healthyDocument();
  document.resumeInformation.basicInfo.detail = {
    ...(document.resumeInformation.basicInfo.detail as object),
    github: "not a link",
  };
  document.resumeInformation.workExp.details = [{
    id: "work-issue", title: "Engineer", companyName: "Example",
    startDate: "2025-06", endDate: "2022-01", github: "github",
    points: ["Responsible for APIs", "I helped the team", "I helped the team"],
  }];
  document.resumeInformation.education.details = [{
    id: "education-issue", title: "Degree", college: "University",
    startDate: "Sep 2018", endDate: "05/2022",
  }];

  const report = analyzeResumeHealth(document);
  const titles = report.findings.map((finding) => finding.title);
  assert.ok(titles.includes("Fix the github link"));
  assert.ok(titles.includes("Fix an entry link"));
  assert.ok(titles.includes("Correct the date order"));
  assert.ok(titles.includes("Strengthen a weak bullet opening"));
  assert.ok(titles.includes("Remove first-person language"));
  assert.ok(titles.includes("Remove repetitive bullets"));
  assert.ok(titles.includes("Standardize source date formats"));
  assert.ok(report.findings.some((finding) => finding.target.detailIndex === 0));
});

test("flags minimum typography, dense spacing, and page overflow without calling it a score", () => {
  const document = healthyDocument();
  document.theme = { ...document.theme, baseFontSize: 11, lineHeight: 1.2, sectionGap: 8, itemGap: 5 };
  document.page.margin = 16;
  const report = analyzeResumeHealth(document, { pageCount: 3 });
  assert.ok(report.findings.some((finding) => finding.title === "Check small body text" && finding.target.mode === "design"));
  assert.ok(report.findings.some((finding) => finding.title === "Review the dense layout"));
  assert.ok(report.findings.some((finding) => finding.title === "Review page overflow" && finding.severity === "recommended"));
});

test("validates links with or without an explicit web protocol", () => {
  assert.equal(isValidResumeLink("https://example.com/profile"), true);
  assert.equal(isValidResumeLink("linkedin.com/in/example"), true);
  assert.equal(isValidResumeLink("not a link"), false);
  assert.equal(isValidResumeLink("javascript:alert(1)"), false);
});
