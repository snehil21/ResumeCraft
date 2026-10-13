import type { ResumeDocument } from "../types";

export const RESUME_STORAGE_KEY = "resumecraft-active-document";

const REQUIRED_SECTION_KEYS = [
  "basicInfo",
  "workExp",
  "project",
  "education",
  "achievement",
  "summary",
  "other",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const isResumeDocument = (value: unknown): value is ResumeDocument => {
  if (!isRecord(value)) return false;

  const theme = value.theme;
  const page = value.page;
  const layout = value.layout;
  const resumeInformation = value.resumeInformation;

  if (
    value.schemaVersion !== 1 ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    (value.template !== "classic" && value.template !== "vertical") ||
    !isRecord(theme) ||
    !isRecord(page) ||
    !isRecord(layout) ||
    !isRecord(resumeInformation)
  ) {
    return false;
  }

  const hasValidTheme =
    typeof theme.accentColor === "string" &&
    typeof theme.fontFamily === "string" &&
    typeof theme.baseFontSize === "number" &&
    typeof theme.lineHeight === "number" &&
    typeof theme.headingScale === "number" &&
    typeof theme.textColor === "string" &&
    typeof theme.sectionGap === "number" &&
    typeof theme.itemGap === "number";

  const hasValidPage =
    (page.size === "A4" || page.size === "LETTER") &&
    typeof page.margin === "number";

  const hasValidLayout =
    isStringArray(layout.sectionOrder) &&
    Array.isArray(layout.columns) &&
    layout.columns.length === 2 &&
    layout.columns.every(isStringArray);

  const hasValidSections =
    REQUIRED_SECTION_KEYS.every((sectionKey) => sectionKey in resumeInformation) &&
    Object.values(resumeInformation).every(
      (section) =>
        isRecord(section) &&
        typeof section.id === "string" &&
        typeof section.sectionTitle === "string" &&
        typeof section.visible === "boolean" &&
        (!section.details ||
          (Array.isArray(section.details) &&
            section.details.every(
              (detail) => isRecord(detail) && typeof detail.id === "string"
            )))
    );

  return hasValidTheme && hasValidPage && hasValidLayout && hasValidSections;
};

const hasMeaningfulValue = (value: unknown, ignoredKeys: string[] = []): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item, ignoredKeys));
  if (!isRecord(value)) return value !== undefined && value !== null;

  return Object.entries(value).some(
    ([key, item]) => !ignoredKeys.includes(key) && hasMeaningfulValue(item, ignoredKeys)
  );
};

export const isResumeDocumentEmpty = (document: ResumeDocument): boolean =>
  !Object.values(document.resumeInformation).some((section) =>
    hasMeaningfulValue(
      {
        detail: section.detail,
        details: section.details,
        points: section.points,
      },
      ["id"]
    )
  );

export const readPersistedResumeDocument = (): ResumeDocument | null => {
  const persistedValue = window.localStorage.getItem(RESUME_STORAGE_KEY);
  if (!persistedValue) return null;

  const persistedStore = JSON.parse(persistedValue);
  const document = persistedStore?.state?.document;
  return isResumeDocument(document) ? document : null;
};
