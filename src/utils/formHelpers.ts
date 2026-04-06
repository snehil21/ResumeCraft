import { FormValues, Section } from "../types";
import { SECTIONS } from "../constants";

/**
 * Extract form values from a section
 */
export const extractFormValuesFromSection = (
  section: Section | undefined,
  sectionKey: string,
  detailIndex: number = 0
): FormValues => {
  if (!section) return {};

  // If section has details array (workExp, project, education)
  if (section.details && Array.isArray(section.details)) {
    const detail = section.details[detailIndex] || {};
    return {
      ...detail,
      points: (detail as any)?.points ? [...(detail as any).points] : [],
    };
  }

  // If section has detail object (basicInfo) or string (summary, other)
  if (typeof section.detail === "object" && section.detail) {
    return {
      ...section.detail,
    };
  }

  // If section has string detail (summary, other)
  if (typeof section.detail === "string") {
    const isAchievement = sectionKey === SECTIONS.achievement;
    const isSummary = sectionKey === SECTIONS.summary;
    const isOther = sectionKey === SECTIONS.other;

    return {
      ...(isAchievement && { points: section.points || [] }),
      ...(isSummary && { summary: section.detail }),
      ...(isOther && { other: section.detail }),
    };
  }

  // For achievement section
  if (section.points) {
    return { points: [...section.points] };
  }

  return {};
};

/**
 * Build detail object for submission based on section type
 */
export const buildDetailForSection = (
  sectionKey: string,
  formValues: FormValues
) => {
  switch (sectionKey) {
    case SECTIONS.basicInfo:
      return {
        name: formValues.name,
        title: formValues.title,
        linkedin: formValues.linkedin,
        github: formValues.github,
        email: formValues.email,
        phone: formValues.phone,
      };

    case SECTIONS.workExp:
      return {
        certificationLink: formValues.certificationLink,
        title: formValues.title,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        companyName: formValues.companyName,
        location: formValues.location,
        points: formValues.points,
      };

    case SECTIONS.project:
      return {
        link: formValues.link,
        title: formValues.title,
        overview: formValues.overview,
        github: formValues.github,
        points: formValues.points,
      };

    case SECTIONS.education:
      return {
        title: formValues.title,
        college: formValues.college,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
      };

    case SECTIONS.achievement:
      return { points: formValues.points };

    case SECTIONS.summary:
      return formValues.summary;

    case SECTIONS.other:
      return formValues.other;

    default:
      return {};
  }
};
