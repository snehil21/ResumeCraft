export const SECTION_LABELS = {
  basicInfo: "Basic Info",
  workExp: "Work Experience",
  project: "Projects",
  education: "Education",
  achievement: "Achievements",
  summary: "Summary",
  other: "Other",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteering: "Volunteering",
  publications: "Publications",
  courses: "Courses",
} as const;

export const SECTIONS = {
  basicInfo: "basicInfo",
  workExp: "workExp",
  project: "project",
  education: "education",
  achievement: "achievement",
  summary: "summary",
  other: "other",
  skills: "skills",
  certifications: "certifications",
  languages: "languages",
  awards: "awards",
  volunteering: "volunteering",
  publications: "publications",
  courses: "courses",
} as const;

export type SectionKey = keyof typeof SECTIONS;
