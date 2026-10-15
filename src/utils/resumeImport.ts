import { SECTION_LABELS, SECTIONS } from "../constants/sections.ts";
import type {
  BasicDetail,
  EducationDetail,
  GenericDetail,
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
  links: string[];
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
  website: string;
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
  const websiteLink = parsed.contact.links.find((link) => link.type === "portfolio") ??
    parsed.contact.links.find((link) => link.type === "other");
  const website = websiteLink?.value ?? "";
  const otherLinks = parsed.contact.links
    .filter((link) => link.type !== "linkedin" && link.type !== "github" && link !== websiteLink)
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
        links: section.links.map((link) => link.value),
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
      website,
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

const BULLET_PATTERN = /^(?:[-*•▪◦‣]|\d+[.)])\s*/;
const JOB_TITLE_PATTERN = /\b(?:engineer|developer|architect|manager|lead|director|consultant|analyst|specialist|intern|administrator|designer|scientist|officer|associate|president|founder)\b/i;
const LOCATION_MODE_PATTERN = /(?:\s*[|·-]\s*)?(Remote|Hybrid|On[ -]?site)$/i;
const LOCATION_WITH_SEPARATOR_PATTERN = /\s*[|·]\s*([^|·]+(?:,\s*[^|·]+){1,2})$/u;
const LOCATION_SUFFIX_PATTERN = /([\p{L}.'-]+(?:\s+[\p{L}.'-]+){0,2}(?:,\s*[\p{L}.'-]+(?:\s+[\p{L}.'-]+){0,3}){1,2})$/u;

const stripReviewedDates = (line: string, ranges: ImportReviewDateRange[]): string => {
  let result = line;
  ranges.forEach((range) => {
    const endPattern = range.isCurrent ? "(?:Present|Current|Now)" : escapeRegExp(range.end);
    result = result.replace(
      new RegExp(`${escapeRegExp(range.start)}\\s*(?:-|–|—|to)\\s*${endPattern}`, "i"),
      ""
    );
  });
  return result.replace(/^[\s|·,:–—-]+|[\s|·,:–—-]+$/g, "").replace(/\s{2,}/g, " ").trim();
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractLocationSuffix = (line: string): { text: string; location: string } => {
  const modeMatch = line.match(LOCATION_MODE_PATTERN);
  if (modeMatch && modeMatch.index !== undefined) {
    return {
      text: line.slice(0, modeMatch.index).replace(/[\s|·,-]+$/g, "").trim(),
      location: modeMatch[1].trim(),
    };
  }

  const separatedMatch = line.match(LOCATION_WITH_SEPARATOR_PATTERN);
  if (separatedMatch && separatedMatch.index !== undefined) {
    return {
      text: line.slice(0, separatedMatch.index).trim(),
      location: separatedMatch[1].trim(),
    };
  }

  const commaIndex = line.indexOf(",");
  if (commaIndex > 0 && JOB_TITLE_PATTERN.test(line.slice(0, commaIndex))) {
    const beforeComma = line.slice(0, commaIndex).trim();
    const afterComma = line.slice(commaIndex + 1).trim();
    const titleMatches = Array.from(beforeComma.matchAll(new RegExp(JOB_TITLE_PATTERN.source, "gi")));
    const lastTitleMatch = titleMatches[titleMatches.length - 1];
    if (lastTitleMatch?.index !== undefined) {
      const titleEnd = lastTitleMatch.index + lastTitleMatch[0].length;
      let title = beforeComma.slice(0, titleEnd).trim();
      let city = beforeComma.slice(titleEnd).trim();
      const levelMatch = city.match(/^(?:I{1,4}|IV|V|[1-5])\b\s*/i);
      if (levelMatch) {
        title = `${title} ${levelMatch[0].trim()}`;
        city = city.slice(levelMatch[0].length).trim();
      }
      if (city) return { text: title, location: `${city}, ${afterComma}` };
    }
  }

  const match = line.match(LOCATION_SUFFIX_PATTERN);
  if (!match || match.index === undefined) return { text: line.trim(), location: "" };
  const location = match[1].trim();
  const text = line.slice(0, match.index).replace(/[\s|·,-]+$/g, "").trim();
  return { text, location };
};

const parseEntryLines = (content: string, ranges: ImportReviewDateRange[]) => {
  const sourceLines = content.split("\n").map((line) => line.trim()).filter(Boolean);
  const headerLines: string[] = [];
  const points: string[] = [];

  sourceLines.forEach((sourceLine) => {
    const hasBullet = BULLET_PATTERN.test(sourceLine);
    const cleaned = stripReviewedDates(sourceLine.replace(BULLET_PATTERN, ""), ranges);
    if (!cleaned) return;
    if (hasBullet) {
      points.push(cleaned);
    } else if (points.length) {
      points[points.length - 1] = `${points[points.length - 1]} ${cleaned}`.replace(/\s{2,}/g, " ");
    } else {
      headerLines.push(cleaned);
    }
  });

  return { headerLines, points };
};

const getIncludedSections = (
  draft: ImportReviewDraft,
  type: ResumeSectionType
): ImportReviewSection[] =>
  draft.sections.filter((section) => section.type === type && section.include);

const createWorkDetails = (draft: ImportReviewDraft): WorkExpDetail[] =>
  getIncludedSections(draft, "experience").map((section, index) => {
    const { headerLines, points } = parseEntryLines(section.content, section.dateRanges);
    let location = "";
    const headers = headerLines.map((line) => {
      const extracted = extractLocationSuffix(line);
      if (!location && extracted.location) location = extracted.location;
      return extracted.text;
    }).filter(Boolean);
    const delimitedHeader = headers.find((line) => /[|·]/.test(line));
    let title = "";
    let companyName = "";
    if (delimitedHeader) {
      [title, companyName] = splitPrimaryLine(delimitedHeader);
    } else {
      const titleIndex = headers.findIndex((line) => JOB_TITLE_PATTERN.test(line));
      title = titleIndex >= 0 ? headers[titleIndex] : headers[0] ?? "";
      companyName = headers.find((_, headerIndex) => headerIndex !== titleIndex) ?? "";
    }
    const dateRange = section.dateRanges[0];

    return {
      id: `import-work-${index}`,
      title,
      companyName,
      location,
      startDate: dateRange?.start,
      endDate: dateRange?.isCurrent ? "Present" : dateRange?.end,
      currentRole: Boolean(dateRange?.isCurrent),
      points,
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
    const exactLinks = new Set(section.links.map((link) => link.toLowerCase()));
    const lines = withoutDateLines(cleanLines(section.content), section.dateRanges).filter((line) => {
      const normalized = line.replace(/^(?:github|website|portfolio|demo|live)\s*:?[\s-]*/i, "").trim().toLowerCase();
      return !exactLinks.has(normalized) && !section.links.some((link) => normalized === link.toLowerCase());
    });
    const dateRange = section.dateRanges[0];
    const github = section.links.find((link) => /github\.com/i.test(link));
    const link = section.links.find((value) => value !== github);
    return {
      id: `import-project-${index}`,
      title: lines[0] ?? "",
      overview: lines[1] ?? "",
      points: lines.slice(2),
      github,
      link,
      startDate: dateRange?.start,
      endDate: dateRange?.isCurrent ? "Present" : dateRange?.end,
    };
  });

const joinSectionContent = (
  draft: ImportReviewDraft,
  type: ResumeSectionType
): string => getIncludedSections(draft, type).map((section) => section.content.trim()).filter(Boolean).join("\n\n");

const createImportedEntryDetails = (
  draft: ImportReviewDraft,
  type: "skills" | "certifications"
): GenericDetail[] => getIncludedSections(draft, type).flatMap((section, sectionIndex) => {
  const links = new Set(section.links.map((link) => link.toLowerCase()));
  const lines = withoutDateLines(cleanLines(section.content), section.dateRanges).filter((line) => {
    const normalized = line.replace(/^(?:credential|certificate|verify|website)\s*:?\s*/i, "").trim().toLowerCase();
    return !links.has(normalized);
  });
  return lines.map((line, lineIndex) => {
    const [category, values] = splitPrimaryLine(line.replace(/^([^:]+):\s*/, "$1 | "));
    const range = lineIndex === 0 ? section.dateRanges[0] : undefined;
    return {
      id: `import-${type}-${sectionIndex}-${lineIndex}`,
      title: category,
      ...(type === "skills" && values ? { subtitle: values } : {}),
      ...(type === "certifications" && lineIndex === 0 && section.links[0]
        ? { website: section.links[0] }
        : {}),
      startDate: range?.start,
      endDate: range?.isCurrent ? undefined : range?.end,
      currentRole: Boolean(range?.isCurrent),
    };
  });
});

export const buildImportedResumeInformation = (
  draft: ImportReviewDraft
): ResumeInformation => {
  const workDetails = createWorkDetails(draft);
  const educationDetails = createEducationDetails(draft);
  const projectDetails = createProjectDetails(draft);
  const achievements = getIncludedSections(draft, "achievements").flatMap((section, sectionIndex) =>
    cleanLines(section.content).map((title, index) => ({
      id: `import-achievement-${sectionIndex}-${index}`,
      title,
    }))
  );
  const skills = createImportedEntryDetails(draft, "skills");
  const certifications = createImportedEntryDetails(draft, "certifications");
  const additionalBlocks = [
    ...draft.unrecognized
      .filter((block) => block.include)
      .map((block) => `${block.heading}\n${block.content}`.trim()),
    draft.contact.otherLinks ? `Additional links\n${draft.contact.otherLinks}` : "",
  ].filter(Boolean);

  const basicDetail: BasicDetail = {
    name: draft.contact.fullName,
    title: draft.contact.headline,
    email: draft.contact.email,
    phone: draft.contact.phone,
    linkedin: draft.contact.linkedin,
    github: draft.contact.github,
    website: draft.contact.website,
    location: draft.contact.location,
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
      kind: "entries",
      details: achievements.length ? achievements : [{ id: "import-achievement-empty" }],
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
    [SECTIONS.skills]: {
      id: SECTIONS.skills,
      sectionTitle: SECTION_LABELS.skills,
      visible: skills.length > 0,
      kind: "entries",
      details: skills.length ? skills : [{ id: "import-skills-empty" }],
    },
    [SECTIONS.certifications]: {
      id: SECTIONS.certifications,
      sectionTitle: SECTION_LABELS.certifications,
      visible: certifications.length > 0,
      kind: "entries",
      details: certifications.length ? certifications : [{ id: "import-certifications-empty" }],
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
