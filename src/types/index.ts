export interface FormValues {
  name?: string;
  title?: string;
  linkedin?: string;
  github?: string;
  phone?: string;
  email?: string;
  overview?: string;
  link?: string;
  certificationLink?: string;
  companyName?: string;
  college?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  points?: string[];
  summary?: string;
  other?: string;
}

export interface BasicDetail {
  name?: string;
  title?: string;
  linkedin?: string;
  github?: string;
  email?: string;
  phone?: string;
}

export interface WorkExpDetail {
  certificationLink?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  location?: string;
  points?: string[];
}

export interface ProjectDetail {
  link?: string;
  title?: string;
  overview?: string;
  github?: string;
  points?: string[];
}

export interface EducationDetail {
  title?: string;
  college?: string;
  startDate?: string;
  endDate?: string;
}

export interface Section {
  id?: string;
  sectionTitle?: string;
  detail?: BasicDetail | string;
  details?: WorkExpDetail[] | ProjectDetail[] | EducationDetail[];
  points?: string[];
}

export interface ResumeInformation {
  [key: string]: Section;
}
