// Basic Information Detail
export interface BasicDetail {
  name?: string;
  title?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

// Work Experience Detail
export interface WorkExpDetail {
  id: string;
  certificationLink?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  employmentType?: string;
  location?: string;
  website?: string;
  points?: string[];
  currentRole?: boolean;
}

// Project Detail
export interface ProjectDetail {
  id: string;
  link?: string;
  title?: string;
  subtitle?: string;
  overview?: string;
  github?: string;
  points?: string[];
  startDate?: string;
  endDate?: string;
}

// Education Detail
export interface EducationDetail {
  id: string;
  title?: string;
  fieldOfStudy?: string;
  college?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  location?: string;
  website?: string;
  points?: string[];
  currentRole?: boolean;
}

export interface GenericDetail {
  id: string;
  title?: string;
  subtitle?: string;
  issuer?: string;
  credentialId?: string;
  proficiency?: string;
  organization?: string;
  publisher?: string;
  provider?: string;
  location?: string;
  website?: string;
  startDate?: string;
  endDate?: string;
  currentRole?: boolean;
  overview?: string;
  points?: string[];
}

export type SectionKind =
  | "basicInfo"
  | "workExp"
  | "project"
  | "education"
  | "summary"
  | "list"
  | "text"
  | "entries";

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
    location?: string;
    website?: string;
    grade?: string;
    currentRole?: boolean;
    subtitle?: string;
    issuer?: string;
    credentialId?: string;
    proficiency?: string;
    organization?: string;
    publisher?: string;
    provider?: string;
    employmentType?: string;
    fieldOfStudy?: string;
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
  kind?: SectionKind;
  custom?: boolean;
  deleted?: boolean;
  detail?: BasicDetail | string;
  details?: WorkExpDetail[] | ProjectDetail[] | EducationDetail[] | GenericDetail[];
  points?: string[];
}

// Complete Resume Information
export interface ResumeInformation {
  [key: string]: Section;
}

export type TemplateId = "classic" | "vertical" | "compact";
export type PageSize = "A4" | "LETTER";
export type DateFormat = "MMM YYYY" | "MM/YYYY" | "YYYY";
export type LayoutMode = "one" | "two";
export type DesignPreset = "compact" | "balanced" | "spacious";

export interface ResumeTheme {
  accentColor: string;
  fontFamily: string;
  baseFontSize: number;
  lineHeight: number;
  headingScale: number;
  textColor: string;
  sectionGap: number;
  itemGap: number;
  nameFontSize: number;
  headingFontSize: number;
  dateFormat: DateFormat;
}

export interface PageSettings {
  size: PageSize;
  margin: number;
}

export type ResumeColumns = [string[], string[]];

export interface ResumeLayout {
  sectionOrder: string[];
  columns: ResumeColumns;
  mode: LayoutMode;
  columnRatio: number;
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
