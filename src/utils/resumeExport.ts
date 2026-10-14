import type { BasicDetail, PageSize, ResumeDocument } from "../types/index.ts";

const CSS_PIXELS_PER_MM = 96 / 25.4;

export const PRINT_PAGE_DIMENSIONS: Record<PageSize, {
  cssSize: string;
  width: string;
  height: string;
  widthPx: number;
  heightPx: number;
}> = {
  A4: {
    cssSize: "A4",
    width: "210mm",
    height: "297mm",
    widthPx: 210 * CSS_PIXELS_PER_MM,
    heightPx: 297 * CSS_PIXELS_PER_MM,
  },
  LETTER: {
    cssSize: "letter",
    width: "8.5in",
    height: "11in",
    widthPx: 8.5 * 96,
    heightPx: 11 * 96,
  },
};

const cleanFilenamePart = (value: string): string => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")
  .replace(/-+/g, "-");

export const createResumePdfTitle = (document: ResumeDocument): string => {
  const basic = document.resumeInformation.basicInfo?.detail as BasicDetail | undefined;
  const name = cleanFilenamePart(basic?.name?.trim() ?? "");
  const documentTitle = cleanFilenamePart(document.title.trim());
  const titleIsGeneric = /^(untitled|sample)(-resume)?$/i.test(documentTitle);
  const parts = [name, titleIsGeneric ? "" : documentTitle].filter(Boolean);
  if (!parts.some((part) => /resume/i.test(part))) parts.push("Resume");
  return parts.join("-") || "Resume";
};

export const getPrintPageStyle = (pageSize: PageSize): string => {
  const page = PRINT_PAGE_DIMENSIONS[pageSize];
  return `
    @page { size: ${page.cssSize}; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      [data-resume-root] { width: ${page.width} !important; margin: 0 !important; }
      [data-resume-sheet] {
        width: ${page.width} !important;
        min-height: ${page.height} !important;
        margin: 0 !important;
        overflow: visible !important;
        box-shadow: none !important;
      }
    }
  `;
};

export const calculatePrintedPageCount = (contentHeight: number, pageHeight: number): number =>
  Math.max(1, Math.ceil(Math.max(0, contentHeight - 1) / pageHeight));

export const getExternalHref = (value: string): string => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const getPhoneHref = (value: string): string => {
  const normalized = value.trim().replace(/(?!^\+)\D/g, "");
  return `tel:${normalized}`;
};

export const getEmailHref = (value: string): string => `mailto:${value.trim()}`;
