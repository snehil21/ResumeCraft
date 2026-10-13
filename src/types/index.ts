// Basic Information Detail
export interface BasicDetail {
  name?: string;
  title?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  phone?: string;
}

// Work Experience Detail
export interface WorkExpDetail {
  id: string;
  certificationLink?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  location?: string;
  points?: string[];
}

// Project Detail
export interface ProjectDetail {
  id: string;
  link?: string;
  title?: string;
  overview?: string;
  github?: string;
  points?: string[];
}

// Education Detail
export interface EducationDetail {
  id: string;
  title?: string;
  college?: string;
  startDate?: string;
  endDate?: string;
}

// Achievement/Award Detail
export interface AchievementDetail {
  points?: string[];
}

// Form Values - Union type for all possible form fields
export type FormValues = BasicDetail &
  Omit<WorkExpDetail, "id"> &
  Omit<ProjectDetail, "id"> &
  Omit<EducationDetail, "id"> & {
    summary?: string;
    other?: string;
  };

// Resume Section with discriminated unions for better type safety
export type ResumeSectionDetail =
  | { type: "basicInfo"; detail: BasicDetail }
  | { type: "workExp"; details: WorkExpDetail[]; points?: string[] }
  | { type: "project"; details: ProjectDetail[]; points?: string[] }
  | { type: "education"; details: EducationDetail[]; points?: string[] }
  | { type: "achievement"; points: string[] }
  | { type: "summary"; detail: string }
  | { type: "other"; detail: string };

// Generic Section Structure
export interface Section {
  id: string;
  sectionTitle: string;
  visible: boolean;
  detail?: BasicDetail | string;
  details?: WorkExpDetail[] | ProjectDetail[] | EducationDetail[];
  points?: string[];
}

// Complete Resume Information
export interface ResumeInformation {
  [key: string]: Section;
}

export type TemplateId = "classic" | "vertical";
export type PageSize = "A4" | "LETTER";

export interface ResumeTheme {
  accentColor: string;
  fontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  headingScale: number;
  textColor: string;
  sectionGap: number;
  itemGap: number;
}

export interface PageSettings {
  size: PageSize;
  margin: number;
}

export type ResumeColumns = [string[], string[]];

export interface ResumeLayout {
  sectionOrder: string[];
  columns: ResumeColumns;
}

export interface ResumeDocument {
  schemaVersion: 1;
  id: string;
  title: string;
  resumeInformation: ResumeInformation;
  template: TemplateId;
  theme: ResumeTheme;
  page: PageSettings;
  layout: ResumeLayout;
  createdAt: string;
  updatedAt: string;
}
