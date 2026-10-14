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

const extractLinksFromHtml = (html: string): string[] => {
  const links: string[] = [];
  const hrefPattern = /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi;
  let match = hrefPattern.exec(html);
  while (match) {
    links.push(
      (match[1] || match[2] || "")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
    );
    match = hrefPattern.exec(html);
  }
  return uniqueLinks(links);
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
      let pageText = "";

      content.items.forEach((item) => {
        if (!("str" in item)) return;
        pageText += item.str;
        pageText += item.hasEOL ? "\n" : " ";
      });

      annotations.forEach((annotation) => {
        const candidate = "url" in annotation && typeof annotation.url === "string"
          ? annotation.url
          : "unsafeUrl" in annotation && typeof annotation.unsafeUrl === "string"
            ? annotation.unsafeUrl
            : "";
        if (candidate) embeddedLinks.push(candidate);
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
    const extraction = createExtractionResult("docx", result.value, file.name, {
      warnings: [...result.messages, ...htmlResult.messages].map((message) => message.message),
      links: extractLinksFromHtml(htmlResult.value),
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
