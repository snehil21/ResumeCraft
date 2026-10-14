import assert from "node:assert/strict";
import test from "node:test";

import { parseResumeText } from "../src/utils/resumeParser.ts";
import {
  buildImportedResumeInformation,
  createImportReviewDraft,
} from "../src/utils/resumeImport.ts";

const REVIEW_SAMPLE = `Alex Example
Platform Engineer
alex@example.test | +91 91234 56789
linkedin.com/in/alex-example | github.com/alex-example

Summary
Backend engineer building reliable systems.

Work History
Senior Engineer | Example Systems
Jan 2021 - Present
- Improved service reliability.

Education
B.Tech Computer Science | Example University
2016 - 2020

Skills
Java, AWS, Kafka

VOLUNTEERING
Mentored early-career developers.`;

test("creates an editable review draft without changing the original text", () => {
  const review = createImportReviewDraft(parseResumeText(REVIEW_SAMPLE));

  assert.equal(review.originalText, REVIEW_SAMPLE);
  assert.equal(review.contact.fullName, "Alex Example");
  assert.equal(review.contact.linkedin, "linkedin.com/in/alex-example");
  assert.ok(review.contact.reviewFields.includes("fullName"));
  assert.equal(review.sections.find((section) => section.type === "experience")?.include, true);
  assert.equal(review.unrecognized[0].heading, "VOLUNTEERING");
  assert.equal(review.unrecognized[0].include, false);
});

test("converts only included reviewed sections into resume information", () => {
  const review = createImportReviewDraft(parseResumeText(REVIEW_SAMPLE));
  review.contact.fullName = "Alex Reviewed";
  review.sections = review.sections.map((section) =>
    section.type === "education" ? { ...section, include: false } : section
  );
  review.unrecognized[0] = { ...review.unrecognized[0], include: true };

  const information = buildImportedResumeInformation(review);
  const basicInfo = information.basicInfo.detail as { name?: string };

  assert.equal(basicInfo.name, "Alex Reviewed");
  assert.equal(information.workExp.visible, true);
  assert.equal(information.education.visible, false);
  assert.match(String(information.other.detail), /Skills/);
  assert.match(String(information.other.detail), /VOLUNTEERING/);
});

test("keeps edited date fields when creating experience entries", () => {
  const review = createImportReviewDraft(parseResumeText(REVIEW_SAMPLE));
  const experience = review.sections.find((section) => section.type === "experience");
  assert.ok(experience);

  experience.dateRanges[0] = {
    ...experience.dateRanges[0],
    start: "Feb 2021",
    end: "Sep 2024",
    isCurrent: false,
  };

  const information = buildImportedResumeInformation(review);
  const work = information.workExp.details?.[0] as {
    startDate?: string;
    endDate?: string;
  };

  assert.equal(work.startDate, "Feb 2021");
  assert.equal(work.endDate, "Sep 2024");
});
