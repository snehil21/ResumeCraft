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
  link?: string;
  title?: string;
  overview?: string;
  github?: string;
  points?: string[];
}

// Education Detail
export interface EducationDetail {
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
  WorkExpDetail &
  ProjectDetail &
  EducationDetail & {
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
  detail?: BasicDetail | string;
  details?: WorkExpDetail[] | ProjectDetail[] | EducationDetail[];
  points?: string[];
}

// Complete Resume Information
export interface ResumeInformation {
  [key: string]: Section;
}
