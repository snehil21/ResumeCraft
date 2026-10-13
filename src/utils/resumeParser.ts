export const RESUME_SECTION_TYPES = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
] as const;

export type ResumeSectionType = (typeof RESUME_SECTION_TYPES)[number];
export type ParserConfidence = "high" | "medium" | "low";

export interface DetectedValue {
  value: string;
  confidence: ParserConfidence;
  lineNumber: number;
}

export interface DetectedLink extends DetectedValue {
  type: "linkedin" | "github" | "portfolio" | "other";
}

export interface DetectedDateRange {
  raw: string;
  start: string;
  end: string | null;
  isCurrent: boolean;
  confidence: ParserConfidence;
  lineNumber: number;
}

export interface ParsedResumeSection {
  type: ResumeSectionType;
  heading: string;
  headingLineNumber: number;
  content: string;
  lines: string[];
  dateRanges: DetectedDateRange[];
  confidence: ParserConfidence;
}

export interface UnrecognizedResumeContent {
  heading: string | null;
  content: string;
  startLineNumber: number;
  endLineNumber: number;
  reason: string;
}

export interface ParserReviewItem {
  text: string;
  lineNumber: number;
  reason: string;
  suggestedSection?: ResumeSectionType;
}

export interface ParsedResume {
  originalText: string;
  contact: {
    fullName: DetectedValue | null;
    headline: DetectedValue | null;
    email: DetectedValue | null;
    phone: DetectedValue | null;
    location: DetectedValue | null;
    links: DetectedLink[];
  };
  sections: Record<ResumeSectionType, ParsedResumeSection[]>;
  dateRanges: DetectedDateRange[];
  unrecognized: UnrecognizedResumeContent[];
  needsReview: ParserReviewItem[];
}

const SECTION_ALIASES: Record<ResumeSectionType, readonly string[]> = {
  summary: [
    "summary",
    "professional summary",
    "career summary",
    "profile",
    "professional profile",
    "objective",
    "about me",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "work history",
    "employment history",
    "career history",
  ],
  education: [
    "education",
    "academic background",
    "education and training",
    "qualifications",
  ],
  skills: [
    "skills",
    "technical skills",
    "core competencies",
    "competencies",
    "technologies",
    "areas of expertise",
  ],
  projects: ["projects", "selected projects", "personal projects", "key projects"],
  certifications: [
    "certifications",
    "certificates",
    "licenses and certifications",
    "licenses & certifications",
  ],
  achievements: [
    "achievements",
    "awards",
    "honors",
    "honours",
    "awards and honors",
    "awards and honours",
    "accomplishments",
  ],
};

const ALIAS_TO_SECTION = new Map<string, ResumeSectionType>(
  RESUME_SECTION_TYPES.flatMap((type) =>
    SECTION_ALIASES[type].map((alias) => [alias, type] as const)
  )
);

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /\+?\d[\d\s().-]{5,}\d/;
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s|,;]+|\b(?:linkedin\.com\/in|github\.com)\/[^\s|,;]+/gi;
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_TOKEN = `(?:${MONTH}\\s+)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])[/.](?:19|20)\\d{2}`;
const DATE_RANGE_PATTERN = new RegExp(
  `\\b(${DATE_TOKEN})\\s*(?:-|–|—|to)\\s*(Present|Current|Now|${DATE_TOKEN})\\b`,
  "gi"
);

interface SourceLine {
  text: string;
  lineNumber: number;
}

interface ContentBlock {
  kind: "recognized" | "unrecognized";
  heading: SourceLine;
  sectionType?: ResumeSectionType;
  lines: SourceLine[];
}

const normalizeHeading = (line: string): string =>
  line
    .trim()
    .replace(/[:：]\s*$/, "")
    .replace(/\s+/g, " ")
    .toLowerCase();

const getSectionType = (line: string): ResumeSectionType | undefined =>
  ALIAS_TO_SECTION.get(normalizeHeading(line));

const isUnknownHeading = (line: string): boolean => {
  const trimmed = line.trim().replace(/[:：]\s*$/, "");
  const words = trimmed.split(/\s+/);
  const letters = trimmed.replace(/[^A-Za-z]/g, "");

  if (!letters || words.length > 5 || trimmed.length > 52) return false;
  if (EMAIL_PATTERN.test(trimmed) || trimmed.match(/\d{4}/)) return false;

  return (
    (line.trim().endsWith(":") && words.length <= 4) ||
    (letters.length >= 3 && letters === letters.toUpperCase())
  );
};

const detectDateRanges = (lines: SourceLine[]): DetectedDateRange[] => {
  const ranges: DetectedDateRange[] = [];

  lines.forEach((line) => {
    DATE_RANGE_PATTERN.lastIndex = 0;
    let match = DATE_RANGE_PATTERN.exec(line.text);

    while (match) {
      const end = match[2];
      const isCurrent = /^(present|current|now)$/i.test(end);
      ranges.push({
        raw: match[0],
        start: match[1],
        end: isCurrent ? null : end,
        isCurrent,
        confidence: "high",
        lineNumber: line.lineNumber,
      });
      match = DATE_RANGE_PATTERN.exec(line.text);
    }
  });

  return ranges;
};

const detectLinkType = (value: string): DetectedLink["type"] => {
  if (/linkedin\.com\/in/i.test(value)) return "linkedin";
  if (/github\.com/i.test(value)) return "github";
  if (/portfolio|behance|dribbble/i.test(value)) return "portfolio";
  return "other";
};

const createSectionRecord = (): Record<ResumeSectionType, ParsedResumeSection[]> => ({
  summary: [],
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
});

const parseContact = (lines: SourceLine[]) => {
  const consumed = new Set<number>();
  const links: DetectedLink[] = [];
  let email: DetectedValue | null = null;
  let phone: DetectedValue | null = null;

  lines.forEach((line) => {
    const emailMatch = !email ? line.text.match(EMAIL_PATTERN) : null;
    if (emailMatch) {
      email = { value: emailMatch[0], confidence: "high", lineNumber: line.lineNumber };
      consumed.add(line.lineNumber);
    }

    const phoneMatch = !phone ? line.text.match(PHONE_PATTERN) : null;
    const phoneDigitCount = phoneMatch?.[0].replace(/\D/g, "").length ?? 0;
    if (phoneMatch && phoneDigitCount >= 7 && phoneDigitCount <= 15) {
      phone = { value: phoneMatch[0].trim(), confidence: "high", lineNumber: line.lineNumber };
      consumed.add(line.lineNumber);
    }

    const matches = Array.from(line.text.matchAll(URL_PATTERN), (match) => match[0]);
    matches.forEach((match) => {
      links.push({
        value: match.replace(/[.)]+$/, ""),
        type: detectLinkType(match),
        confidence: "high",
        lineNumber: line.lineNumber,
      });
      consumed.add(line.lineNumber);
    });
  });

  const textOnlyLines = lines.filter(
    (line) => !consumed.has(line.lineNumber) && !/[|•]/.test(line.text)
  );
  const nameLine = textOnlyLines.find((line) => {
    const words = line.text.trim().split(/\s+/);
    return words.length >= 2 && words.length <= 5 && !/\d/.test(line.text);
  });
  const fullName = nameLine
    ? { value: nameLine.text.trim(), confidence: "medium" as const, lineNumber: nameLine.lineNumber }
    : null;
  if (nameLine) consumed.add(nameLine.lineNumber);

  const locationLine = lines.find((line) => {
    if (consumed.has(line.lineNumber)) return false;
    const words = line.text.trim().split(/\s+/);
    return words.length <= 7 && /,/.test(line.text) && !/\d{4}/.test(line.text);
  });
  const location = locationLine
    ? { value: locationLine.text.trim(), confidence: "low" as const, lineNumber: locationLine.lineNumber }
    : null;
  if (locationLine) consumed.add(locationLine.lineNumber);

  const headlineLine = lines.find((line) => {
    if (consumed.has(line.lineNumber)) return false;
    const words = line.text.trim().split(/\s+/);
    return words.length <= 10 && !/\d/.test(line.text) && !/[.!?]$/.test(line.text);
  });
  const headline = headlineLine
    ? { value: headlineLine.text.trim(), confidence: "low" as const, lineNumber: headlineLine.lineNumber }
    : null;
  if (headlineLine) consumed.add(headlineLine.lineNumber);

  return { fullName, headline, email, phone, location, links, consumed };
};

export const parseResumeText = (originalText: string): ParsedResume => {
  const sourceLines: SourceLine[] = originalText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((text, index) => ({ text: text.trim(), lineNumber: index + 1 }))
    .filter((line) => line.text.length > 0);

  const firstHeadingIndex = sourceLines.findIndex((line) => Boolean(getSectionType(line.text)));
  const headerLines = firstHeadingIndex === -1 ? sourceLines : sourceLines.slice(0, firstHeadingIndex);
  const contact = parseContact(headerLines);
  const sections = createSectionRecord();
  const unrecognized: UnrecognizedResumeContent[] = [];
  const needsReview: ParserReviewItem[] = [];
  const blocks: ContentBlock[] = [];
  let activeBlock: ContentBlock | null = null;

  const sectionLines = firstHeadingIndex === -1 ? [] : sourceLines.slice(firstHeadingIndex);
  sectionLines.forEach((line) => {
    const sectionType = getSectionType(line.text);
    if (sectionType) {
      activeBlock = { kind: "recognized", heading: line, sectionType, lines: [] };
      blocks.push(activeBlock);
      return;
    }

    if (isUnknownHeading(line.text)) {
      activeBlock = { kind: "unrecognized", heading: line, lines: [] };
      blocks.push(activeBlock);
      return;
    }

    activeBlock?.lines.push(line);
  });

  blocks.forEach((block) => {
    const content = block.lines.map((line) => line.text).join("\n").trim();
    if (block.kind === "recognized" && block.sectionType) {
      if (!content) {
        needsReview.push({
          text: block.heading.text,
          lineNumber: block.heading.lineNumber,
          reason: "This recognized section has no content.",
          suggestedSection: block.sectionType,
        });
      }

      sections[block.sectionType].push({
        type: block.sectionType,
        heading: block.heading.text,
        headingLineNumber: block.heading.lineNumber,
        content,
        lines: block.lines.map((line) => line.text),
        dateRanges: detectDateRanges(block.lines),
        confidence: "high",
      });
      return;
    }

    const endLine = block.lines[block.lines.length - 1]?.lineNumber ?? block.heading.lineNumber;
    unrecognized.push({
      heading: block.heading.text,
      content,
      startLineNumber: block.heading.lineNumber,
      endLineNumber: endLine,
      reason: "This heading is not mapped to a supported resume section.",
    });
  });

  const unconsumedHeader = headerLines.filter((line) => !contact.consumed.has(line.lineNumber));
  if (unconsumedHeader.length) {
    unrecognized.unshift({
      heading: null,
      content: unconsumedHeader.map((line) => line.text).join("\n"),
      startLineNumber: unconsumedHeader[0].lineNumber,
      endLineNumber:
        unconsumedHeader[unconsumedHeader.length - 1]?.lineNumber ?? unconsumedHeader[0].lineNumber,
      reason: "This text appeared before the first recognized section and was not identified as contact information.",
    });
  }

  if (firstHeadingIndex === -1 && sourceLines.length) {
    const remaining = sourceLines.filter((line) => !contact.consumed.has(line.lineNumber));
    if (remaining.length && !unrecognized.length) {
      unrecognized.push({
        heading: null,
        content: remaining.map((line) => line.text).join("\n"),
        startLineNumber: remaining[0].lineNumber,
        endLineNumber: remaining[remaining.length - 1]?.lineNumber ?? remaining[0].lineNumber,
        reason: "No supported section headings were found.",
      });
    }
  }

  [contact.fullName, contact.headline, contact.location].forEach((value) => {
    if (value) {
      needsReview.push({
        text: value.value,
        lineNumber: value.lineNumber,
        reason: `Detected as ${
          value === contact.fullName ? "name" : value === contact.headline ? "headline" : "location"
        } with ${value.confidence} confidence.`,
      });
    }
  });

  const allSectionLines = blocks.flatMap((block) => block.lines);

  return {
    originalText,
    contact: {
      fullName: contact.fullName,
      headline: contact.headline,
      email: contact.email,
      phone: contact.phone,
      location: contact.location,
      links: contact.links,
    },
    sections,
    dateRanges: detectDateRanges(allSectionLines),
    unrecognized,
    needsReview,
  };
};
