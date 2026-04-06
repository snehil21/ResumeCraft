export const SECTION_LABELS = {
  basicInfo: "Basic Info",
  workExp: "Work Experience",
  project: "Projects",
  education: "Education",
  achievement: "Achievements",
  summary: "Summary",
  other: "Other",
} as const;

export const SECTIONS = {
  basicInfo: "basicInfo",
  workExp: "workExp",
  project: "project",
  education: "education",
  achievement: "achievement",
  summary: "summary",
  other: "other",
} as const;

export type SectionKey = keyof typeof SECTIONS;
