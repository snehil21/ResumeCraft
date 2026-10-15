import type { BasicDetail, ResumeDocument, Section } from "../types/index.ts";
import { isReadableBodyColor } from "./colorContrast.ts";

export type HealthSeverity = "critical" | "recommended" | "optional";
export type HealthTarget = {
  mode: "content" | "design";
  sectionKey?: string;
  detailIndex?: number;
};

export interface ResumeHealthFinding {
  id: string;
  severity: HealthSeverity;
  title: string;
  detail: string;
  target: HealthTarget;
}

export interface ResumeHealthReport {
  findings: ResumeHealthFinding[];
  counts: Record<HealthSeverity, number>;
}

const IMPORTANT_SECTIONS = [
  { key: "summary", label: "Summary", severity: "recommended" as const },
  { key: "workExp", label: "Work Experience", severity: "critical" as const },
  { key: "education", label: "Education", severity: "critical" as const },
  { key: "skills", label: "Skills", severity: "recommended" as const },
];

const WEAK_OPENINGS = /^(responsible for|worked on|helped|assisted|duties included|participated in|tasked with)\b/i;
const FIRST_PERSON = /\b(i|me|my|mine|we|us|our|ours)\b/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const words = (value: string): string[] => value.trim().split(/\s+/).filter(Boolean);
const normalizeBullet = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const hasSectionContent = (section: Section | undefined): boolean => {
  if (!section || section.deleted || !section.visible) return false;
  if (typeof section.detail === "string" && section.detail.trim()) return true;
  if (section.detail && typeof section.detail === "object") {
    if (Object.values(section.detail).some((value) => String(value ?? "").trim())) return true;
  }
  if (section.points?.some((point) => point.trim())) return true;
  return Boolean(section.details?.some((item) =>
    Object.entries(item).some(([key, value]) => key !== "id" && String(value ?? "").trim())
  ));
};

export const isValidResumeLink = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ["http:", "https:"].includes(url.protocol) && (url.hostname.includes(".") || url.hostname === "localhost");
  } catch { return false; }
};

const dateValue = (value: string): number | null => {
  const trimmed = value.trim();
  let match = trimmed.match(/^(\d{4})(?:-(\d{1,2})(?:-\d{1,2})?)?$/);
  if (match) return Number(match[1]) * 12 + Number(match[2] || 1) - 1;
  match = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
  if (match) return Number(match[2]) * 12 + Number(match[1]) - 1;
  const parsed = Date.parse(`1 ${trimmed}`);
  return Number.isNaN(parsed) ? null : new Date(parsed).getFullYear() * 12 + new Date(parsed).getMonth();
};

const datePattern = (value: string): string => {
  const trimmed = value.trim();
  if (/^\d{4}(?:-\d{1,2}(?:-\d{1,2})?)?$/.test(trimmed)) return "iso";
  if (/^\d{1,2}\/\d{4}$/.test(trimmed)) return "slash";
  if (/^[A-Za-z]{3,9}\s+\d{4}$/.test(trimmed)) return "named";
  return "unknown";
};

const addFinding = (
  findings: ResumeHealthFinding[],
  finding: Omit<ResumeHealthFinding, "id">,
  discriminator = ""
) => {
  findings.push({
    ...finding,
    id: `${finding.severity}-${finding.target.mode}-${finding.target.sectionKey || "design"}-${discriminator}-${findings.length}`,
  });
};

export const analyzeResumeHealth = (
  document: ResumeDocument,
  options: { pageCount?: number } = {}
): ResumeHealthReport => {
  const findings: ResumeHealthFinding[] = [];
  const information = document.resumeInformation;
  const basic = (information.basicInfo?.detail ?? {}) as BasicDetail;
  const basicTarget: HealthTarget = { mode: "content", sectionKey: "basicInfo" };

  if (!basic.email?.trim()) {
    addFinding(findings, { severity: "critical", title: "Add an email address", detail: "Recruiters need a reliable way to contact you.", target: basicTarget }, "email-missing");
  } else if (!EMAIL.test(basic.email.trim())) {
    addFinding(findings, { severity: "critical", title: "Fix the email address", detail: "The current email format does not look valid.", target: basicTarget }, "email-invalid");
  }
  if (!basic.phone?.trim()) {
    addFinding(findings, { severity: "recommended", title: "Add a phone number", detail: "A phone number gives recruiters a second contact option.", target: basicTarget }, "phone-missing");
  }

  (["linkedin", "github", "website"] as const).forEach((field) => {
    const value = basic[field];
    if (value?.trim() && !isValidResumeLink(value)) {
      addFinding(findings, { severity: "critical", title: `Fix the ${field} link`, detail: `“${value}” is not a valid web address.`, target: basicTarget }, `${field}-invalid`);
    }
  });

  IMPORTANT_SECTIONS.forEach(({ key, label, severity }) => {
    if (!hasSectionContent(information[key])) {
      addFinding(findings, {
        severity,
        title: `${label} needs content`,
        detail: information[key]?.visible === false ? `The ${label} section is hidden or empty.` : `Add useful ${label.toLowerCase()} details before exporting.`,
        target: { mode: "content", sectionKey: key },
      }, `${key}-empty`);
    }
  });

  const allDatePatterns = new Set<string>();
  Object.entries(information).forEach(([sectionKey, section]) => {
    if (!section || section.deleted) return;
    const seenBullets = new Map<string, number>();
    const sectionBullets: Array<{ value: string; detailIndex?: number; bulletIndex: number }> = [];
    section.points?.forEach((value, bulletIndex) => sectionBullets.push({ value, bulletIndex }));

    section.details?.forEach((item, detailIndex) => {
      item.points?.forEach((value, bulletIndex) => sectionBullets.push({ value, detailIndex, bulletIndex }));
      (["link", "github", "certificationLink", "website"] as const).forEach((field) => {
        const value = (item as Record<string, unknown>)[field];
        if (typeof value === "string" && value.trim() && !isValidResumeLink(value)) {
          addFinding(findings, {
            severity: "critical",
            title: "Fix an entry link",
            detail: `“${value}” is not a valid web address.`,
            target: { mode: "content", sectionKey, detailIndex },
          }, `${detailIndex}-${field}`);
        }
      });

      const start = typeof item.startDate === "string" ? item.startDate.trim() : "";
      const end = typeof item.endDate === "string" ? item.endDate.trim() : "";
      [start, end].filter(Boolean).forEach((value) => allDatePatterns.add(datePattern(value)));
      if ((start && dateValue(start) === null) || (end && dateValue(end) === null)) {
        addFinding(findings, {
          severity: "recommended",
          title: "Use a recognizable date format",
          detail: "Use YYYY-MM, MM/YYYY, or a month and year so dates render consistently.",
          target: { mode: "content", sectionKey, detailIndex },
        }, `${detailIndex}-date-format`);
      } else if (start && end && dateValue(start)! > dateValue(end)!) {
        addFinding(findings, {
          severity: "critical",
          title: "Correct the date order",
          detail: "This entry ends before it starts.",
          target: { mode: "content", sectionKey, detailIndex },
        }, `${detailIndex}-date-order`);
      }

      const prose = [item.overview, (item as Record<string, unknown>).description]
        .filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
      prose.forEach((value) => {
        if (words(value).length > 70) {
          addFinding(findings, { severity: "recommended", title: "Break up a dense paragraph", detail: "This paragraph is longer than 70 words and may be difficult to scan.", target: { mode: "content", sectionKey, detailIndex } }, `${detailIndex}-dense`);
        }
      });
    });

    if (typeof section.detail === "string" && words(section.detail).length > 70) {
      addFinding(findings, { severity: "recommended", title: "Break up a dense paragraph", detail: "This section contains a paragraph longer than 70 words.", target: { mode: "content", sectionKey } }, "dense");
    }

    sectionBullets.forEach(({ value, detailIndex, bulletIndex }) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const target = { mode: "content" as const, sectionKey, detailIndex };
      const wordCount = words(trimmed).length;
      if (wordCount < 4) addFinding(findings, { severity: "optional", title: "Expand a very short bullet", detail: `“${trimmed}” does not yet explain enough context or impact.`, target }, `${detailIndex}-${bulletIndex}-short`);
      if (wordCount > 40) addFinding(findings, { severity: "recommended", title: "Shorten a long bullet", detail: "This bullet is longer than 40 words and may be hard to scan.", target }, `${detailIndex}-${bulletIndex}-long`);
      if (WEAK_OPENINGS.test(trimmed)) addFinding(findings, { severity: "recommended", title: "Strengthen a weak bullet opening", detail: "Start with a specific action verb instead of describing responsibility.", target }, `${detailIndex}-${bulletIndex}-weak`);
      if (FIRST_PERSON.test(trimmed)) addFinding(findings, { severity: "recommended", title: "Remove first-person language", detail: "Resume bullets are usually stronger without I, me, my, we, or our.", target }, `${detailIndex}-${bulletIndex}-first-person`);
      const normalized = normalizeBullet(trimmed);
      seenBullets.set(normalized, (seenBullets.get(normalized) ?? 0) + 1);
    });

    const duplicateCount = [...seenBullets.values()].filter((count) => count > 1).length;
    if (duplicateCount) {
      addFinding(findings, { severity: "recommended", title: "Remove repetitive bullets", detail: `${duplicateCount} bullet ${duplicateCount === 1 ? "statement appears" : "statements appear"} more than once in this section.`, target: { mode: "content", sectionKey } }, "duplicates");
    }
  });

  if (allDatePatterns.has("unknown") || [...allDatePatterns].filter((pattern) => pattern !== "unknown").length > 1) {
    addFinding(findings, { severity: "recommended", title: "Standardize source date formats", detail: "Entries use different date formats. Choose one input style for easier maintenance.", target: { mode: "content", sectionKey: "workExp" } }, "mixed-dates");
  }

  if (document.theme.baseFontSize <= 11) {
    addFinding(findings, { severity: "optional", title: "Check small body text", detail: "The body font is at the minimum supported size. Confirm it is comfortable to read.", target: { mode: "design" } }, "small-text");
  }
  if (!isReadableBodyColor(document.theme.textColor)) {
    addFinding(findings, {
      severity: "critical",
      title: "Increase body text contrast",
      detail: "Body text needs at least 4.5:1 contrast against the white page before export.",
      target: { mode: "design" },
    }, "text-contrast");
  }
  const densitySignals = [
    document.theme.lineHeight <= 1.2,
    document.page.margin <= 16,
    document.theme.sectionGap <= 8,
    document.theme.itemGap <= 5,
  ].filter(Boolean).length;
  if (densitySignals >= 2) {
    addFinding(findings, { severity: "optional", title: "Review the dense layout", detail: "Several spacing controls are near their minimum values. Check readability before exporting.", target: { mode: "design" } }, "density");
  }
  if ((options.pageCount ?? 1) > 1) {
    addFinding(findings, { severity: "recommended", title: "Review page overflow", detail: `The resume currently spans ${options.pageCount} pages. Confirm every page earns its space.`, target: { mode: "design" } }, "overflow");
  }

  const counts = findings.reduce<Record<HealthSeverity, number>>(
    (result, finding) => ({ ...result, [finding.severity]: result[finding.severity] + 1 }),
    { critical: 0, recommended: 0, optional: 0 }
  );
  return { findings, counts };
};
