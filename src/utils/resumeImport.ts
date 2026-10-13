import { SECTION_LABELS, SECTIONS } from "../constants/sections.ts";
import type {
  BasicDetail,
  EducationDetail,
  ProjectDetail,
  ResumeDocument,
  ResumeInformation,
  WorkExpDetail,
} from "../types/index.ts";
import { RESUME_SECTION_TYPES } from "./resumeParser.ts";
import type {
  DetectedDateRange,
  ParsedResume,
  ResumeSectionType,
} from "./resumeParser.ts";

export interface ImportReviewDateRange {
  id: string;
  start: string;
  end: string;
  isCurrent: boolean;
  needsReview: boolean;
}

export interface ImportReviewSection {
  id: string;
  type: ResumeSectionType;
  heading: string;
  content: string;
  include: boolean;
  needsReview: boolean;
  dateRanges: ImportReviewDateRange[];
}

export interface ImportReviewUnrecognized {
  id: string;
  heading: string;
  content: string;
  include: boolean;
  reason: string;
}

export interface ImportReviewContact {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  otherLinks: string;
  reviewFields: string[];
}

export interface ImportReviewDraft {
  originalText: string;
  contact: ImportReviewContact;
  sections: ImportReviewSection[];
  unrecognized: ImportReviewUnrecognized[];
}

const createId = (prefix: string): string => {
  const randomId = globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
};

const toReviewDateRange = (
  range: DetectedDateRange,
  sectionId: string,
  index: number
): ImportReviewDateRange => ({
  id: `${sectionId}-date-${index}`,
  start: range.start,
  end: range.end ?? "Present",
  isCurrent: range.isCurrent,
  needsReview: range.confidence !== "high",
});

export const createImportReviewDraft = (parsed: ParsedResume): ImportReviewDraft => {
  const reviewLines = new Set(parsed.needsReview.map((item) => item.lineNumber));
  const linkedin = parsed.contact.links.find((link) => link.type === "linkedin")?.value ?? "";
  const github = parsed.contact.links.find((link) => link.type === "github")?.value ?? "";
  const otherLinks = parsed.contact.links
    .filter((link) => link.type !== "linkedin" && link.type !== "github")
    .map((link) => link.value)
    .join("\n");

  const sections = RESUME_SECTION_TYPES.flatMap((type) =>
    parsed.sections[type].map((section, index) => {
      const id = `${type}-${section.headingLineNumber}-${index}`;
      return {
        id,
        type,
        heading: section.heading,
        content: section.content,
        include: true,
        needsReview: reviewLines.has(section.headingLineNumber),
        dateRanges: section.dateRanges.map((range, dateIndex) =>
          toReviewDateRange(range, id, dateIndex)
        ),
      };
    })
  );

  const contactEntries = {
    fullName: parsed.contact.fullName,
    headline: parsed.contact.headline,
    email: parsed.contact.email,
    phone: parsed.contact.phone,
    location: parsed.contact.location,
  };

  return {
    originalText: parsed.originalText,
    contact: {
      fullName: parsed.contact.fullName?.value ?? "",
      headline: parsed.contact.headline?.value ?? "",
      email: parsed.contact.email?.value ?? "",
      phone: parsed.contact.phone?.value ?? "",
      location: parsed.contact.location?.value ?? "",
      linkedin,
      github,
      otherLinks,
      reviewFields: Object.entries(contactEntries)
        .filter(([, value]) => value && value.confidence !== "high")
        .map(([field]) => field),
    },
    sections,
    unrecognized: parsed.unrecognized.map((block, index) => ({
      id: `unrecognized-${block.startLineNumber}-${index}`,
      heading: block.heading ?? "Unrecognized content",
      content: block.content,
      include: false,
      reason: block.reason,
    })),
  };
};

const cleanLines = (content: string): string[] =>
  content
    .split("\n")
    .map((line) => line.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);

const withoutDateLines = (lines: string[], ranges: ImportReviewDateRange[]): string[] =>
  lines.filter(
    (line) =>
      !ranges.some(
        (range) =>
          line.includes(range.start) &&
          (line.includes(range.end) || (range.isCurrent && /present|current|now/i.test(line)))
      )
  );

const splitPrimaryLine = (line = ""): [string, string] => {
  const [primary, ...rest] = line.split(/\s*[|·]\s*/);
  return [primary?.trim() ?? "", rest.join(" | ").trim()];
};

const getIncludedSections = (
  draft: ImportReviewDraft,
  type: ResumeSectionType
): ImportReviewSection[] =>
  draft.sections.filter((section) => section.type === type && section.include);

const createWorkDetails = (draft: ImportReviewDraft): WorkExpDetail[] =>
  getIncludedSections(draft, "experience").map((section, index) => {
    const lines = withoutDateLines(cleanLines(section.content), section.dateRanges);
    const [title, companyName] = splitPrimaryLine(lines[0]);
    const dateRange = section.dateRanges[0];

    return {
      id: `import-work-${index}`,
      title,
      companyName,
      startDate: dateRange?.start,
      endDate: dateRange?.isCurrent ? "Present" : dateRange?.end,
      points: lines.slice(1),
    };
  });

const createEducationDetails = (draft: ImportReviewDraft): EducationDetail[] =>
  getIncludedSections(draft, "education").map((section, index) => {
    const lines = withoutDateLines(cleanLines(section.content), section.dateRanges);
    const [title, college] = splitPrimaryLine(lines[0]);
    const dateRange = section.dateRanges[0];

    return {
      id: `import-education-${index}`,
      title,
      college,
      startDate: dateRange?.start,
      endDate: dateRange?.isCurrent ? "Present" : dateRange?.end,
    };
  });

const createProjectDetails = (draft: ImportReviewDraft): ProjectDetail[] =>
  getIncludedSections(draft, "projects").map((section, index) => {
    const lines = withoutDateLines(cleanLines(section.content), section.dateRanges);
    return {
      id: `import-project-${index}`,
      title: lines[0] ?? "",
      overview: lines[1] ?? "",
      points: lines.slice(2),
    };
  });

const joinSectionContent = (
  draft: ImportReviewDraft,
  type: ResumeSectionType
): string => getIncludedSections(draft, type).map((section) => section.content.trim()).filter(Boolean).join("\n\n");

export const buildImportedResumeInformation = (
  draft: ImportReviewDraft
): ResumeInformation => {
  const workDetails = createWorkDetails(draft);
  const educationDetails = createEducationDetails(draft);
  const projectDetails = createProjectDetails(draft);
  const achievements = getIncludedSections(draft, "achievements").flatMap((section) =>
    cleanLines(section.content)
  );
  const additionalBlocks = [
    ...(["skills", "certifications"] as ResumeSectionType[]).flatMap((type) =>
      getIncludedSections(draft, type).map(
        (section) => `${section.heading}\n${section.content}`.trim()
      )
    ),
    ...draft.unrecognized
      .filter((block) => block.include)
      .map((block) => `${block.heading}\n${block.content}`.trim()),
    draft.contact.location ? `Location\n${draft.contact.location}` : "",
    draft.contact.otherLinks ? `Additional links\n${draft.contact.otherLinks}` : "",
  ].filter(Boolean);

  const basicDetail: BasicDetail = {
    name: draft.contact.fullName,
    title: draft.contact.headline,
    email: draft.contact.email,
    phone: draft.contact.phone,
    linkedin: draft.contact.linkedin,
    github: draft.contact.github,
  };

  return {
    [SECTIONS.basicInfo]: {
      id: SECTIONS.basicInfo,
      sectionTitle: SECTION_LABELS.basicInfo,
      visible: true,
      detail: basicDetail,
    },
    [SECTIONS.workExp]: {
      id: SECTIONS.workExp,
      sectionTitle: SECTION_LABELS.workExp,
      visible: workDetails.length > 0,
      details: workDetails.length ? workDetails : [{ id: "import-work-empty" }],
    },
    [SECTIONS.project]: {
      id: SECTIONS.project,
      sectionTitle: SECTION_LABELS.project,
      visible: projectDetails.length > 0,
      details: projectDetails.length ? projectDetails : [{ id: "import-project-empty" }],
    },
    [SECTIONS.education]: {
      id: SECTIONS.education,
      sectionTitle: SECTION_LABELS.education,
      visible: educationDetails.length > 0,
      details: educationDetails.length ? educationDetails : [{ id: "import-education-empty" }],
    },
    [SECTIONS.achievement]: {
      id: SECTIONS.achievement,
      sectionTitle: SECTION_LABELS.achievement,
      visible: achievements.length > 0,
      points: achievements,
    },
    [SECTIONS.summary]: {
      id: SECTIONS.summary,
      sectionTitle: SECTION_LABELS.summary,
      visible: Boolean(joinSectionContent(draft, "summary")),
      detail: joinSectionContent(draft, "summary"),
    },
    [SECTIONS.other]: {
      id: SECTIONS.other,
      sectionTitle: SECTION_LABELS.other,
      visible: additionalBlocks.length > 0,
      detail: additionalBlocks.join("\n\n"),
    },
  };
};

export const buildImportedResumeDocument = (
  draft: ImportReviewDraft,
  currentDocument: ResumeDocument,
  sourceName?: string | null
): ResumeDocument => {
  const timestamp = new Date().toISOString();
  const fallbackTitle = sourceName?.replace(/\.(pdf|docx)$/i, "").trim();
  const title = draft.contact.fullName.trim() || fallbackTitle || "Imported resume";

  return {
    ...currentDocument,
    id: createId("resume"),
    title: `${title} resume`,
    resumeInformation: buildImportedResumeInformation(draft),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};
