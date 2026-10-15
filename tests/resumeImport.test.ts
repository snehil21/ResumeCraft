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
  assert.equal(information.skills.visible, true);
  assert.equal((information.skills.details?.[0] as { title?: string }).title, "Java, AWS, Kafka");
  assert.match(String(information.other.detail), /VOLUNTEERING/);
});

test("imports certifications as structured entries with dates and links", () => {
  const review = createImportReviewDraft(parseResumeText(`Alex Example
Certifications
AWS Certified Solutions Architect
Jan 2024 - Jan 2027`));
  const certificationSection = review.sections.find((section) => section.type === "certifications");
  assert.ok(certificationSection);
  certificationSection.links = ["https://verify.example.test/aws"];
  const information = buildImportedResumeInformation(review);
  const certification = information.certifications.details?.[0] as {
    title?: string;
    website?: string;
    startDate?: string;
    endDate?: string;
  };

  assert.equal(information.certifications.visible, true);
  assert.equal(information.certifications.details?.length, 1);
  assert.equal(certification.title, "AWS Certified Solutions Architect");
  assert.equal(certification.website, "https://verify.example.test/aws");
  assert.equal(certification.startDate, "Jan 2024");
  assert.equal(certification.endDate, "Jan 2027");
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

test("creates separate work entries with company, title, location, and joined bullets", () => {
  const source = `Jordan Example
Professional Experience
Amazon (via Consulting Partner)   May 2026 - Present
Software Development Engineer I   Bengaluru, India
• Shared Redis Caching: Built a shared caching layer using
Spring Cache and Redisson with database fallback.
• Deployment Pipeline Hardening: Added approval gates.
Cimpress India   August 2024 - April 2026
Software Development Engineer I   Remote
• Migrated a high-throughput service to serverless.`;
  const information = buildImportedResumeInformation(
    createImportReviewDraft(parseResumeText(source))
  );
  const work = information.workExp.details as Array<{
    title?: string;
    companyName?: string;
    location?: string;
    points?: string[];
  }>;

  assert.equal(work.length, 2);
  assert.equal(work[0].companyName, "Amazon (via Consulting Partner)");
  assert.equal(work[0].title, "Software Development Engineer I");
  assert.equal(work[0].location, "Bengaluru, India");
  assert.equal(work[0].points?.length, 2);
  assert.match(work[0].points?.[0] ?? "", /Spring Cache and Redisson/);
  assert.equal(work[1].companyName, "Cimpress India");
  assert.equal(work[1].location, "Remote");
});

test("maps a portfolio link to the website field", () => {
  const review = createImportReviewDraft(
    parseResumeText(`Jordan Example
Backend Engineer
jordan@example.test
Summary
Builds reliable systems.`, ["https://portfolio.example.test"])
  );
  const information = buildImportedResumeInformation(review);
  const basic = information.basicInfo.detail as { website?: string };

  assert.equal(review.contact.website, "https://portfolio.example.test");
  assert.equal(basic.website, "https://portfolio.example.test");
});

test("maps links found in a project into project link fields", () => {
  const information = buildImportedResumeInformation(
    createImportReviewDraft(parseResumeText(`Jordan Example
Projects
ResumeCraft
GitHub https://github.com/jordan-example/resumecraft
Live https://resume.example.test
2024 - Present
- Built a local-first resume editor.`))
  );
  const project = information.project.details?.[0] as {
    title?: string;
    github?: string;
    link?: string;
  };

  assert.equal(project.title, "ResumeCraft");
  assert.equal(project.github, "https://github.com/jordan-example/resumecraft");
  assert.equal(project.link, "https://resume.example.test");
});
