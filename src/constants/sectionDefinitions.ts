import { SECTIONS } from "./sections";

export interface StructuredSectionDefinition {
  group: "Career" | "Additional";
  noun: string;
  description: string;
}

export const STRUCTURED_SECTION_DEFINITIONS: Record<string, StructuredSectionDefinition> = {
  [SECTIONS.achievement]: {
    group: "Career",
    noun: "achievement",
    description: "Add recognition, impact, a date, and an optional proof link.",
  },
  [SECTIONS.skills]: {
    group: "Career",
    noun: "skill group",
    description: "Group related skills so recruiters can scan them quickly.",
  },
  [SECTIONS.certifications]: {
    group: "Additional",
    noun: "certification",
    description: "Include the issuer, credential details, validity, and verification URL.",
  },
  [SECTIONS.languages]: {
    group: "Additional",
    noun: "language",
    description: "List each language with an honest proficiency level.",
  },
  [SECTIONS.awards]: {
    group: "Additional",
    noun: "award",
    description: "Capture the award, issuer, date, supporting link, and context.",
  },
  [SECTIONS.volunteering]: {
    group: "Additional",
    noun: "volunteer role",
    description: "Describe the role, organization, dates, location, and contribution.",
  },
  [SECTIONS.publications]: {
    group: "Additional",
    noun: "publication",
    description: "Add the title, publisher, publication date, link, and summary.",
  },
  [SECTIONS.courses]: {
    group: "Additional",
    noun: "course",
    description: "Record the course provider, completion date, certificate, and learning outcomes.",
  },
};

export const CORE_SECTION_KEYS: string[] = [
  SECTIONS.workExp,
  SECTIONS.education,
  SECTIONS.project,
  SECTIONS.achievement,
  SECTIONS.skills,
];

export const ADDITIONAL_SECTION_KEYS: string[] = [
  SECTIONS.certifications,
  SECTIONS.languages,
  SECTIONS.awards,
  SECTIONS.volunteering,
  SECTIONS.publications,
  SECTIONS.courses,
  SECTIONS.other,
];
