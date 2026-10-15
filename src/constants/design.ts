import type { DesignPreset, ResumeTheme, TemplateId } from "../types/index.ts";

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Garamond", value: "Garamond, Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
] as const;

export const DEFAULT_RESUME_THEME: ResumeTheme = {
  accentColor: "#b75024",
  fontFamily: FONT_OPTIONS[0].value,
  baseFontSize: 14,
  lineHeight: 1.4,
  headingScale: 1,
  textColor: "#1f2937",
  sectionGap: 16,
  itemGap: 12,
  nameFontSize: 38,
  headingFontSize: 20,
  dateFormat: "MMM YYYY",
};

export const DESIGN_PRESETS: Record<DesignPreset, Partial<ResumeTheme> & { pageMargin: number }> = {
  compact: {
    baseFontSize: 12,
    nameFontSize: 32,
    headingFontSize: 17,
    lineHeight: 1.25,
    sectionGap: 10,
    itemGap: 7,
    pageMargin: 20,
  },
  balanced: {
    baseFontSize: 14,
    nameFontSize: 38,
    headingFontSize: 20,
    lineHeight: 1.4,
    sectionGap: 16,
    itemGap: 12,
    pageMargin: 24,
  },
  spacious: {
    baseFontSize: 15,
    nameFontSize: 42,
    headingFontSize: 22,
    lineHeight: 1.55,
    sectionGap: 22,
    itemGap: 16,
    pageMargin: 32,
  },
};

export const TEMPLATE_DEFAULTS: Record<TemplateId, {
  theme: ResumeTheme;
  pageMargin: number;
  layoutMode: "one" | "two";
  columnRatio: number;
}> = {
  vertical: {
    theme: {
      ...DEFAULT_RESUME_THEME,
      accentColor: "#4b4038",
      fontFamily: "Arial, Helvetica, sans-serif",
      baseFontSize: 13,
      nameFontSize: 34,
      headingFontSize: 16,
      lineHeight: 1.35,
      sectionGap: 14,
      itemGap: 10,
    },
    pageMargin: 28,
    layoutMode: "one",
    columnRatio: 55,
  },
  classic: {
    theme: { ...DEFAULT_RESUME_THEME },
    pageMargin: 24,
    layoutMode: "two",
    columnRatio: 55,
  },
  compact: {
    theme: {
      ...DEFAULT_RESUME_THEME,
      accentColor: "#2f6b52",
      baseFontSize: 12,
      nameFontSize: 30,
      headingFontSize: 15,
      lineHeight: 1.2,
      sectionGap: 8,
      itemGap: 6,
    },
    pageMargin: 18,
    layoutMode: "two",
    columnRatio: 60,
  },
};

export const DESIGN_LIMITS = {
  baseFontSize: { min: 12, max: 16, step: 1 },
  nameFontSize: { min: 28, max: 46, step: 1 },
  headingFontSize: { min: 15, max: 24, step: 1 },
  lineHeight: { min: 1.2, max: 1.6, step: 0.05 },
  pageMargin: { min: 16, max: 36, step: 1 },
  sectionGap: { min: 8, max: 24, step: 1 },
  itemGap: { min: 6, max: 18, step: 1 },
  columnRatio: { min: 35, max: 65, step: 1 },
} as const;
