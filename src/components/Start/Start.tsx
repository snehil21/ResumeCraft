import React, { FC } from "react";
import {
  ArrowLeft,
  ArrowRight,
  File,
  FileText,
  Lock,
  UploadCloud,
} from "react-feather";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useResumeStore } from "../../store";
import { isResumeDocumentEmpty } from "../../utils/resumeDocument";
import Navbar from "../Navbar/Navbar";

import styles from "./Start.module.css";

const Start: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { document, startBlankResume, loadSampleResume } = useResumeStore();
  const selectedMode = searchParams.get("mode");

  const canReplaceDraft = (nextDraft: string) =>
    isResumeDocumentEmpty(document) ||
    window.confirm(
      `Replace your current draft with ${nextDraft}? Export a JSON backup first if you want to keep it.`
    );

  const beginBlankResume = () => {
    if (!canReplaceDraft("a blank resume")) return;
    startBlankResume();
    navigate("/resumebuilder");
  };

  const beginWithSample = () => {
    if (!canReplaceDraft("the sample resume")) return;
    loadSampleResume();
    navigate("/resumebuilder");
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.intro}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft aria-hidden="true" /> Back to home
          </Link>
          <p className={styles.eyebrow}>Choose your starting point</p>
          <h1>How would you like to begin?</h1>
          <p className={styles.description}>
            Start with an empty document, explore a complete example, or bring
            your existing resume when local import becomes available.
          </p>
          <p className={styles.privacyNote}>
            <Lock aria-hidden="true" /> No account required. Your resume stays in your browser.
          </p>
        </div>

        <section className={styles.options} aria-label="Resume starting options">
          <article className={`${styles.optionCard} ${selectedMode === "create" ? styles.selectedCard : ""}`}>
            <span className={styles.optionIcon}><File aria-hidden="true" /></span>
            <div>
              <p className={styles.optionLabel}>Clean slate</p>
              <h2>Start with a blank resume</h2>
              <p>
                Open empty sections and add only the information that belongs
                in your resume.
              </p>
            </div>
            <button type="button" onClick={beginBlankResume}>
              Start blank <ArrowRight aria-hidden="true" />
            </button>
          </article>

          <article className={styles.optionCard}>
            <span className={styles.optionIcon}><FileText aria-hidden="true" /></span>
            <div>
              <p className={styles.optionLabel}>Guided example</p>
              <h2>Use sample content</h2>
              <p>
                Explore the builder with a complete example, then replace each
                section with your own details.
              </p>
            </div>
            <button type="button" onClick={beginWithSample}>
              Use sample <ArrowRight aria-hidden="true" />
            </button>
          </article>

          <article className={`${styles.optionCard} ${styles.uploadCard} ${selectedMode === "upload" ? styles.selectedCard : ""}`}>
            <div className={styles.cardTopline}>
              <span className={styles.optionIcon}><UploadCloud aria-hidden="true" /></span>
              <span className={styles.soonBadge}>Available locally</span>
            </div>
            <div>
              <p className={styles.optionLabel}>Bring what you have</p>
              <h2>Upload an existing resume</h2>
              <p>
                Extract text from a PDF or DOCX locally. Parsing and field-by-field
                review will be added in the next steps.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/import")}
            >
              Import PDF or DOCX <ArrowRight aria-hidden="true" />
            </button>
            <p className={styles.uploadExplanation} id="upload-explanation">
              Files are processed in your browser and are not sent to a server.
            </p>
          </article>
        </section>

        <div className={styles.modeLinks} aria-label="Select onboarding option">
          <button type="button" onClick={() => setSearchParams({ mode: "create" })}>
            Create options
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => setSearchParams({ mode: "upload" })}>
            Upload information
          </button>
        </div>
      </main>
    </div>
  );
};

export default Start;
