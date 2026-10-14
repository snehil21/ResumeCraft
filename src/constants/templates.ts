import type { TemplateId } from "../types/index.ts";

export const TEMPLATE_OPTIONS: Array<{
  id: TemplateId;
  title: string;
  note: string;
  supportsColumns: boolean;
}> = [
  {
    id: "vertical",
    title: "ATS Classic",
    note: "Conservative single-column format",
    supportsColumns: false,
  },
  {
    id: "classic",
    title: "Modern Split",
    note: "Restrained one or two-column layout",
    supportsColumns: true,
  },
  {
    id: "compact",
    title: "Compact Technical",
    note: "Dense layout for experienced candidates",
    supportsColumns: true,
  },
];

export const getTemplateOption = (template: TemplateId) =>
  TEMPLATE_OPTIONS.find((option) => option.id === template) ?? TEMPLATE_OPTIONS[0];
