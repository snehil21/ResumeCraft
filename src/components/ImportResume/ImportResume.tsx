import React, { ChangeEvent, DragEvent, FC, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clipboard,
  FileText,
  Lock,
  RefreshCw,
  UploadCloud,
  X,
} from "react-feather";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../Navbar/Navbar";
import ImportReview from "./ImportReview";
import { useResumeStore } from "../../store";
import {
  extractResumeTextFromFile,
  extractResumeTextFromPaste,
  MAX_RESUME_FILE_SIZE,
  ResumeExtractionError,
  ResumeTextExtraction,
} from "../../utils/resumeTextExtraction";
import {
  parseResumeText,
  RESUME_SECTION_TYPES,
  ResumeSectionType,
} from "../../utils/resumeParser";
import {
  buildImportedResumeDocument,
  createImportReviewDraft,
  ImportReviewDraft,
} from "../../utils/resumeImport";
import { isResumeDocumentEmpty } from "../../utils/resumeDocument";

import styles from "./ImportResume.module.css";

type ExtractionStatus = "idle" | "extracting" | "success" | "error";

const sectionLabels: Record<ResumeSectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
};

const ImportResume: FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { document, importResumeDocument } = useResumeStore();
  const [status, setStatus] = useState<ExtractionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [extraction, setExtraction] = useState<ResumeTextExtraction | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reviewDraft, setReviewDraft] = useState<ImportReviewDraft | null>(null);
  const parsedResume = useMemo(
    () => (extraction ? parseResumeText(extraction.text) : null),
    [extraction]
  );

  const resetResult = () => {
    setStatus("idle");
    setErrorMessage("");
    setExtraction(null);
    setReviewDraft(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showError = (error: unknown) => {
    setExtraction(null);
    setStatus("error");
    setErrorMessage(
      error instanceof ResumeExtractionError
        ? error.message
        : "The resume could not be read. Try another file or paste the text instead."
    );
  };

  const processFile = async (file: File) => {
    setStatus("extracting");
    setErrorMessage("");
    setExtraction(null);

    try {
      const result = await extractResumeTextFromFile(file);
      setExtraction(result);
      setStatus("success");
    } catch (error) {
      showError(error);
    }
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const processPastedText = () => {
    try {
      const result = extractResumeTextFromPaste(pastedText);
      setExtraction(result);
      setStatus("success");
      setErrorMessage("");
    } catch (error) {
      showError(error);
    }
  };

  const beginReview = () => {
    if (!parsedResume) return;
    setReviewDraft(createImportReviewDraft(parsedResume));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmImport = () => {
    if (!reviewDraft || !extraction) return;

    if (
      !isResumeDocumentEmpty(document) &&
      !window.confirm(
        "Replace your current local resume draft with this reviewed import? Export a JSON backup first if you want to keep it."
      )
    ) {
      return;
    }

    const importedDocument = buildImportedResumeDocument(
      reviewDraft,
      document,
      extraction.fileName
    );
    importResumeDocument(importedDocument);
    navigate("/resumebuilder");
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {reviewDraft ? (
        <ImportReview
          draft={reviewDraft}
          replacesExistingDraft={!isResumeDocumentEmpty(document)}
          onChange={setReviewDraft}
          onBack={() => setReviewDraft(null)}
          onConfirm={confirmImport}
        />
      ) : (
      <main className={styles.main}>
        <header className={styles.intro}>
          <Link to="/start?mode=upload" className={styles.backLink}>
            <ArrowLeft aria-hidden="true" /> Back to start options
          </Link>
          <p className={styles.eyebrow}>Local resume import</p>
          <h1>Bring your existing resume.</h1>
          <p className={styles.description}>
            Extract selectable text from a PDF or DOCX, or paste the content
            yourself. Nothing is uploaded to a server.
          </p>
          <p className={styles.privacyNote}>
            <Lock aria-hidden="true" /> Processing happens in this browser tab
          </p>
        </header>

        <section className={styles.workspace} aria-label="Resume text extraction">
          <div className={styles.inputPanel}>
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <span className={styles.uploadIcon}>
                <UploadCloud aria-hidden="true" />
              </span>
              <h2>Choose a resume file</h2>
              <p>Drop it here or browse from your device.</p>
              <label className={styles.fileButton}>
                Select PDF or DOCX
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelection}
                />
              </label>
              <span className={styles.fileHint}>
                PDF or DOCX · maximum {MAX_RESUME_FILE_SIZE / 1024 / 1024} MB
              </span>
            </div>

            <div className={styles.divider}><span>or</span></div>

            <div className={styles.pastePanel}>
              <div className={styles.panelHeading}>
                <span><Clipboard aria-hidden="true" /></span>
                <div>
                  <h2>Paste resume text</h2>
                  <p>Useful for scanned files or formats we do not support yet.</p>
                </div>
              </div>
              <label htmlFor="resume-text">Resume text</label>
              <textarea
                id="resume-text"
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                placeholder="Paste your resume content here..."
              />
              <button type="button" onClick={processPastedText}>
                Extract pasted text
              </button>
            </div>
          </div>

          <div className={styles.resultPanel} aria-live="polite">
            {status === "idle" ? (
              <div className={styles.emptyState}>
                <FileText aria-hidden="true" />
                <h2>Extracted text will appear here</h2>
                <p>
                  We will show the exact text found before any parsing or resume
                  fields are created.
                </p>
              </div>
            ) : null}

            {status === "extracting" ? (
              <div className={styles.emptyState}>
                <RefreshCw className={styles.spinner} aria-hidden="true" />
                <h2>Reading your resume locally...</h2>
                <p>Keep this tab open while the browser extracts the text.</p>
              </div>
            ) : null}

            {status === "error" ? (
              <div className={styles.errorState} role="alert">
                <AlertCircle aria-hidden="true" />
                <div>
                  <h2>We could not extract this resume</h2>
                  <p>{errorMessage}</p>
                  <button type="button" onClick={resetResult}>Try another file</button>
                </div>
              </div>
            ) : null}

            {status === "success" && extraction ? (
              <div className={styles.successState}>
                <div className={styles.successHeading}>
                  <span><CheckCircle aria-hidden="true" /></span>
                  <div>
                    <p>Extraction complete</p>
                    <h2>{extraction.fileName ?? "Pasted resume text"}</h2>
                  </div>
                  <button type="button" onClick={resetResult} aria-label="Clear extracted text">
                    <X aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.metrics} aria-label="Extraction summary">
                  <span><strong>{extraction.wordCount}</strong> words</span>
                  <span><strong>{extraction.characterCount}</strong> characters</span>
                  {extraction.pageCount ? (
                    <span><strong>{extraction.pageCount}</strong> pages</span>
                  ) : null}
                  <span><strong>{extraction.source.toUpperCase()}</strong> source</span>
                </div>

                {extraction.warnings.length ? (
                  <div className={styles.warning}>
                    <AlertCircle aria-hidden="true" />
                    <p>{extraction.warnings.join(" ")}</p>
                  </div>
                ) : null}

                <label htmlFor="extracted-resume-text">Extracted text</label>
                <textarea
                  id="extracted-resume-text"
                  readOnly
                  value={extraction.text}
                />

                {parsedResume ? (
                  <section className={styles.parserSummary} aria-labelledby="parser-summary-title">
                    <div className={styles.parserHeading}>
                      <div>
                        <p>Deterministic analysis</p>
                        <h3 id="parser-summary-title">What ResumeCraft detected</h3>
                      </div>
                      <span>{parsedResume.dateRanges.length} date ranges</span>
                    </div>

                    <div className={styles.sectionChips} aria-label="Detected resume sections">
                      {RESUME_SECTION_TYPES.map((type) => {
                        const count = parsedResume.sections[type].length;
                        return (
                          <span key={type} className={count ? styles.detectedChip : styles.missingChip}>
                            {sectionLabels[type]} {count ? `· ${count}` : "· not found"}
                          </span>
                        );
                      })}
                    </div>

                    <dl className={styles.parserMetrics}>
                      <div>
                        <dt>Contact details</dt>
                        <dd>
                          {[
                            parsedResume.contact.email,
                            parsedResume.contact.phone,
                            ...parsedResume.contact.links,
                          ].filter(Boolean).length}
                        </dd>
                      </div>
                      <div>
                        <dt>Needs review</dt>
                        <dd>{parsedResume.needsReview.length}</dd>
                      </div>
                      <div>
                        <dt>Unrecognized blocks</dt>
                        <dd>{parsedResume.unrecognized.length}</dd>
                      </div>
                    </dl>

                    {parsedResume.unrecognized.length ? (
                      <div className={styles.recoveryNote}>
                        <AlertCircle aria-hidden="true" />
                        <p>
                          Nothing was discarded. {parsedResume.unrecognized.length} unrecognized
                          {parsedResume.unrecognized.length === 1 ? " block is" : " blocks are"} preserved
                          with the original text for review.
                        </p>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <div className={styles.nextStep}>
                  <p>
                    Next, you will be able to correct every detected field before
                    anything changes in your active draft.
                  </p>
                  <button type="button" onClick={beginReview}>Review detected content</button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className={styles.supportNote}>
          <h2>What works today</h2>
          <ul>
            <li>Text-based PDFs with selectable text</li>
            <li>Modern Word documents in DOCX format</li>
            <li>Pasted plain text as a reliable fallback</li>
          </ul>
          <p>
            Password-protected, corrupt, oversized, scanned, and image-only
            files are rejected with an explanation. Legacy DOC files are not supported.
          </p>
        </section>
      </main>
      )}
    </div>
  );
};

export default ImportResume;
