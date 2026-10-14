import mammoth from "mammoth/mammoth.browser";
import {
  getDocument,
  GlobalWorkerOptions,
  InvalidPDFException,
  PasswordException,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

export type ResumeTextSource = "pdf" | "docx" | "paste";
export type ResumeExtractionErrorCode =
  | "unsupported"
  | "oversized"
  | "empty"
  | "password-protected"
  | "scanned-pdf"
  | "corrupt";

export interface ResumeTextExtraction {
  source: ResumeTextSource;
  fileName: string | null;
  text: string;
  wordCount: number;
  characterCount: number;
  links: string[];
  pageCount?: number;
  warnings: string[];
}

export class ResumeExtractionError extends Error {
  code: ResumeExtractionErrorCode;

  constructor(code: ResumeExtractionErrorCode, message: string) {
    super(message);
    this.name = "ResumeExtractionError";
    this.code = code;
  }
}

const normalizeExtractedText = (text: string): string =>
  text
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const createExtractionResult = (
  source: ResumeTextSource,
  text: string,
  fileName: string | null,
  options: { pageCount?: number; warnings?: string[]; links?: string[] } = {}
): ResumeTextExtraction => {
  const normalizedText = normalizeExtractedText(text);

  return {
    source,
    fileName,
    text: normalizedText,
    wordCount: normalizedText ? normalizedText.split(/\s+/).length : 0,
    characterCount: normalizedText.length,
    links: options.links ?? [],
    pageCount: options.pageCount,
    warnings: options.warnings ?? [],
  };
};

const normalizeEmbeddedLink = (value: string): string | null => {
  const link = value.trim();
  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(link)) return link;
  if (/^(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(link)) return link;
  return null;
};

const uniqueLinks = (links: string[]): string[] =>
  Array.from(new Set(links.map(normalizeEmbeddedLink).filter((link): link is string => Boolean(link))));

interface HtmlLink {
  label: string;
  href: string;
}

const decodeHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

export const extractLinksFromHtml = (html: string): HtmlLink[] => {
  const links: HtmlLink[] = [];
  const hrefPattern = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi;
  let match = hrefPattern.exec(html);
  while (match) {
    const href = decodeHtml(match[1] || match[2] || "");
    const normalized = normalizeEmbeddedLink(href);
    if (normalized) links.push({ label: decodeHtml(match[3]).trim(), href: normalized });
    match = hrefPattern.exec(html);
  }
  return links.filter(
    (link, index) => links.findIndex((candidate) => candidate.href === link.href) === index
  );
};

export const attachHtmlLinksToText = (text: string, links: HtmlLink[]): string => {
  let result = text;
  let searchFrom = 0;
  links.forEach(({ label, href }) => {
    if (!label) return;
    const index = result.indexOf(label, searchFrom);
    if (index === -1) return;
    searchFrom = index + label.length;
    if (canonicalText(label) === canonicalText(href)) return;
    const nearby = result.slice(index, index + label.length + href.length + 3);
    if (!nearby.includes(href)) {
      result = `${result.slice(0, index + label.length)} ${href}${result.slice(index + label.length)}`;
      searchFrom += href.length + 1;
    }
  });
  return result;
};

const canonicalText = (value: string): string =>
  value.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "").toLowerCase();

interface PositionedTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

interface PositionedLink {
  rect?: number[];
  url: string;
}

export const attachPdfLinksToTextItems = (
  items: PositionedTextItem[],
  links: PositionedLink[]
): Map<number, string[]> => {
  const matches = new Map<number, string[]>();
  links.forEach((link) => {
    if (!link.rect || link.rect.length < 4) return;
    const [left, bottom, right, top] = link.rect;
    const linkCenterX = (left + right) / 2;
    const linkCenterY = (bottom + top) / 2;
    let bestIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item, index) => {
      const x = item.transform[4] ?? 0;
      const y = item.transform[5] ?? 0;
      const height = item.height || Math.abs(item.transform[3] ?? 0) || 10;
      const itemLeft = x - 3;
      const itemRight = x + item.width + 3;
      const itemBottom = y - 3;
      const itemTop = y + height + 3;
      if (linkCenterX < itemLeft || linkCenterX > itemRight || linkCenterY < itemBottom || linkCenterY > itemTop) return;
      const distance = Math.abs(linkCenterX - (x + item.width / 2)) + Math.abs(linkCenterY - (y + height / 2));
      if (distance < bestDistance) {
        bestIndex = index;
        bestDistance = distance;
      }
    });
    if (bestIndex >= 0) matches.set(bestIndex, [...(matches.get(bestIndex) ?? []), link.url]);
  });
  return matches;
};

const extractPdfText = async (file: File): Promise<ResumeTextExtraction> => {
  const loadingTask = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    stopAtErrors: true,
  });

  const passwordRequest = new Promise<never>((_, reject) => {
    loadingTask.onPassword = () => {
      reject(
        new ResumeExtractionError(
          "password-protected",
          "This PDF is password-protected. Remove the password and try again."
        )
      );
      void loadingTask.destroy();
    };
  });

  try {
    const pdf = await Promise.race([loadingTask.promise, passwordRequest]);
    const pages: string[] = [];
    const embeddedLinks: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const [content, annotations] = await Promise.all([
        page.getTextContent(),
        page.getAnnotations({ intent: "display" }),
      ]);
      const positionedLinks: PositionedLink[] = [];
      annotations.forEach((annotation) => {
        const candidate = "url" in annotation && typeof annotation.url === "string"
          ? annotation.url
          : "unsafeUrl" in annotation && typeof annotation.unsafeUrl === "string"
            ? annotation.unsafeUrl
            : "";
        if (candidate) {
          embeddedLinks.push(candidate);
          positionedLinks.push({ rect: "rect" in annotation ? annotation.rect : undefined, url: candidate });
        }
      });

      const textItems = content.items.filter((item): item is typeof item & PositionedTextItem => "str" in item);
      const itemLinks = attachPdfLinksToTextItems(textItems, positionedLinks);
      let pageText = "";
      textItems.forEach((item, index) => {
        pageText += item.str;
        (itemLinks.get(index) ?? []).forEach((link) => {
          if (!item.str.includes(link)) pageText += ` ${link}`;
        });
        pageText += item.hasEOL ? "\n" : " ";
      });

      pages.push(pageText.trim());
      page.cleanup();
    }

    const result = createExtractionResult("pdf", pages.join("\n\n"), file.name, {
      pageCount: pdf.numPages,
      links: uniqueLinks(embeddedLinks),
    });
    await loadingTask.destroy();

    if (result.characterCount < 20) {
      throw new ResumeExtractionError(
        "scanned-pdf",
        "No selectable text was found. This PDF appears to be scanned or image-only, which is not supported yet."
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ResumeExtractionError) throw error;

    if (
      error instanceof PasswordException ||
      (error instanceof Error && error.name === "PasswordException")
    ) {
      throw new ResumeExtractionError(
        "password-protected",
        "This PDF is password-protected. Remove the password and try again."
      );
    }

    if (
      error instanceof InvalidPDFException ||
      (error instanceof Error && error.name === "InvalidPDFException")
    ) {
      throw new ResumeExtractionError(
        "corrupt",
        "This PDF is invalid or corrupted and could not be read."
      );
    }

    throw new ResumeExtractionError(
      "corrupt",
      "The PDF could not be read. It may be corrupted or use an unsupported format."
    );
  }
};

const extractDocxText = async (file: File): Promise<ResumeTextExtraction> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const [result, htmlResult] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) }),
      mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) }),
    ]);
    const htmlLinks = extractLinksFromHtml(htmlResult.value);
    const extraction = createExtractionResult("docx", attachHtmlLinksToText(result.value, htmlLinks), file.name, {
      warnings: [...result.messages, ...htmlResult.messages].map((message) => message.message),
      links: uniqueLinks(htmlLinks.map((link) => link.href)),
    });

    if (!extraction.text) {
      throw new ResumeExtractionError(
        "empty",
        "No readable text was found in this DOCX file."
      );
    }

    return extraction;
  } catch (error) {
    if (error instanceof ResumeExtractionError) throw error;

    throw new ResumeExtractionError(
      "corrupt",
      "This DOCX file is invalid, corrupted, or could not be read."
    );
  }
};

export const extractResumeTextFromFile = async (
  file: File
): Promise<ResumeTextExtraction> => {
  if (!file.size) {
    throw new ResumeExtractionError("empty", "The selected file is empty.");
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new ResumeExtractionError(
      "oversized",
      "This file is larger than 10 MB. Choose a smaller PDF or DOCX file."
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return extractPdfText(file);
  if (extension === "docx") return extractDocxText(file);

  throw new ResumeExtractionError(
    "unsupported",
    "Unsupported file type. Choose a PDF or DOCX file, or paste the resume text."
  );
};

export const extractResumeTextFromPaste = (
  pastedText: string
): ResumeTextExtraction => {
  const extraction = createExtractionResult("paste", pastedText, null);

  if (!extraction.text) {
    throw new ResumeExtractionError(
      "empty",
      "Paste your resume text before continuing."
    );
  }

  return extraction;
};
