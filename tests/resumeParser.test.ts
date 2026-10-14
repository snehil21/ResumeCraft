import assert from "node:assert/strict";
import test from "node:test";

import { parseResumeText } from "../src/utils/resumeParser.ts";

const ANONYMIZED_ENGINEER_RESUME = `Jordan Example
Backend Engineer
Pune, Maharashtra
jordan@example.test | +91 98765 43210
linkedin.com/in/jordan-example | github.com/jordan-example

Professional Summary
Backend engineer focused on reliable distributed systems.

Professional Experience
Senior Engineer | Example Commerce
Jan 2022 - Present
- Built resilient order processing services.

Education
B.Tech in Computer Science | Example Institute
Aug 2015 - May 2019

Technical Skills
Java, TypeScript, AWS, Kafka

Selected Projects
Local Resume Builder
2023 - 2024

Certifications
Example Cloud Associate

Achievements
Engineering excellence award`;

test("detects contact details, supported sections, links, and date ranges", () => {
  const result = parseResumeText(ANONYMIZED_ENGINEER_RESUME);

  assert.equal(result.contact.fullName?.value, "Jordan Example");
  assert.equal(result.contact.email?.value, "jordan@example.test");
  assert.equal(result.contact.phone?.value, "+91 98765 43210");
  assert.deepEqual(result.contact.links.map((link) => link.type), ["linkedin", "github"]);
  assert.equal(result.sections.summary.length, 1);
  assert.equal(result.sections.experience.length, 1);
  assert.equal(result.sections.education.length, 1);
  assert.equal(result.sections.skills.length, 1);
  assert.equal(result.sections.projects.length, 1);
  assert.equal(result.sections.certifications.length, 1);
  assert.equal(result.sections.achievements.length, 1);
  assert.equal(result.dateRanges.length, 3);
  assert.equal(result.dateRanges[0].isCurrent, true);
  assert.equal(result.dateRanges[0].end, null);
});

test("maps common experience aliases deterministically", () => {
  const workHistory = parseResumeText(`Taylor Example\nWork History\nDeveloper\n2020 - 2022`);
  const professionalExperience = parseResumeText(
    `Taylor Example\nProfessional Experience\nDeveloper\n2022 - Current`
  );

  assert.equal(workHistory.sections.experience[0].heading, "Work History");
  assert.equal(professionalExperience.sections.experience[0].heading, "Professional Experience");
  assert.equal(professionalExperience.dateRanges[0].isCurrent, true);
});

test("preserves original text and keeps unsupported sections recoverable", () => {
  const source = `Morgan Example
morgan@example.test

Summary
Product-minded engineer.

VOLUNTEERING
Mentor | Community Code Club
2021 - Present

Skills
JavaScript, accessibility`;
  const result = parseResumeText(source);

  assert.equal(result.originalText, source);
  assert.equal(result.unrecognized.length, 1);
  assert.equal(result.unrecognized[0].heading, "VOLUNTEERING");
  assert.match(result.unrecognized[0].content, /Community Code Club/);
  assert.equal(result.sections.skills[0].content, "JavaScript, accessibility");
});

test("marks uncertain header fields and empty sections for review", () => {
  const result = parseResumeText(`Casey Example\nPlatform Specialist\nRemote, India\nSummary\n\nSkills\nGo, SQL`);

  assert.equal(result.contact.fullName?.confidence, "medium");
  assert.equal(result.contact.headline?.confidence, "low");
  assert.equal(result.contact.location?.confidence, "medium");
  assert.ok(result.needsReview.some((item) => item.text === "Summary"));
  assert.ok(result.needsReview.some((item) => item.text === "Platform Specialist"));
});

test("does not discard content when no supported headings are present", () => {
  const result = parseResumeText(`Riley Example\nriley@example.test\nBuilt internal developer tools.\nEnjoys mentoring.`);

  assert.equal(result.originalText.includes("Built internal developer tools."), true);
  assert.equal(result.unrecognized.length, 1);
  assert.match(result.unrecognized[0].content, /developer tools/);
});

test("uses embedded hyperlink targets that are not visible in extracted PDF text", () => {
  const result = parseResumeText(
    `Jordan Example\nBackend Engineer\nSummary\nBuilds reliable systems.`,
    ["https://www.linkedin.com/in/jordan-example", "https://portfolio.example.dev"]
  );

  assert.deepEqual(result.contact.links.map((link) => link.type), ["linkedin", "portfolio"]);
  assert.equal(result.contact.links[0].value, "https://www.linkedin.com/in/jordan-example");
});

test("detects a location alongside other contact details", () => {
  const result = parseResumeText(`Jordan Example
Backend Engineer
jordan@example.test | Bengaluru, Karnataka, India | +91 98765 43210
Summary
Builds reliable systems.`);

  assert.equal(result.contact.location?.value, "Bengaluru, Karnataka, India");
  assert.equal(result.contact.location?.confidence, "medium");
});

test("splits date-bounded work history into separate experience entries", () => {
  const result = parseResumeText(`Jordan Example
Professional Experience
Amazon (via Consulting Partner)   May 2026 - Present
Software Development Engineer I   Bengaluru, India
• Built a shared caching layer.
• Hardened deployment pipelines.
Cimpress India   August 2024 - April 2026
Software Development Engineer I   Remote
• Migrated an event processor.
Oracle Financial Services Software   July 2023 - September 2023
Java Developer Intern   Bengaluru, India
• Built a scheduled metric collector.`);

  assert.equal(result.sections.experience.length, 3);
  assert.match(result.sections.experience[0].content, /^Amazon/);
  assert.match(result.sections.experience[1].content, /^Cimpress/);
  assert.match(result.sections.experience[2].content, /^Oracle/);
  assert.equal(result.sections.experience[0].dateRanges[0].isCurrent, true);
});
