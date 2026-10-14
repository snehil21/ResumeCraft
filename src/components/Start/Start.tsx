import React, { FC, useEffect, useState } from "react";
import {
  ArrowRight,
  Download,
  File,
  FileText,
  Lock,
  UploadCloud,
  X,
} from "react-feather";
import { Link, useNavigate } from "react-router-dom";

import { useResumeStore } from "../../store";
import { isResumeDocumentEmpty } from "../../utils/resumeDocument";
import Navbar from "../Navbar/Navbar";

import styles from "./Start.module.css";

interface PendingReplacement {
  description: string;
  actionLabel: string;
  action: () => void;
}

const Start: FC = () => {
  const navigate = useNavigate();
  const { document, startBlankResume, loadSampleResume } = useResumeStore();
  const [pendingReplacement, setPendingReplacement] = useState<PendingReplacement | null>(null);
  const hasCurrentDraft = !isResumeDocumentEmpty(document);

  useEffect(() => {
    if (!pendingReplacement) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPendingReplacement(null);
    };
    window.document.addEventListener("keydown", handleEscape);
    return () => window.document.removeEventListener("keydown", handleEscape);
  }, [pendingReplacement]);

  const completeStartingAction = (action: () => void) => {
    action();
    setPendingReplacement(null);
    navigate("/resumebuilder");
  };

  const requestReplacement = (replacement: PendingReplacement) => {
    if (!hasCurrentDraft) {
      completeStartingAction(replacement.action);
      return;
    }
    setPendingReplacement(replacement);
  };

  const beginBlankResume = () => {
    requestReplacement({
      description: "a blank resume",
      actionLabel: "Replace with blank resume",
      action: startBlankResume,
    });
  };

  const beginWithSample = () => {
    requestReplacement({
      description: "the sample resume",
      actionLabel: "Replace with sample",
      action: loadSampleResume,
    });
  };

  const exportCurrentDraft = () => {
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    const safeTitle = document.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resume";
    link.href = downloadUrl;
    link.download = `${safeTitle}.resumecraft.json`;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Choose your starting point</p>
          <h1>How would you like to begin?</h1>
          <p className={styles.description}>
            Start with an empty document, explore a complete example, or bring
            your existing resume into the local editor.
          </p>
          <p className={styles.privacyNote}>
            <Lock aria-hidden="true" /> No account required. Your resume stays in your browser.
          </p>
        </div>

        {hasCurrentDraft ? (
          <section className={styles.currentDraft} aria-labelledby="current-draft-title">
            <div>
              <p>Saved locally</p>
              <h2 id="current-draft-title">Continue “{document.title}”</h2>
              <span>Open your existing draft without changing any content.</span>
            </div>
            <Link to="/resumebuilder">
              Continue editing <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <section className={styles.options} aria-label="Resume starting options">
          <article className={styles.optionCard}>
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

          <article className={`${styles.optionCard} ${styles.uploadCard}`}>
            <div className={styles.cardTopline}>
              <span className={styles.optionIcon}><UploadCloud aria-hidden="true" /></span>
              <span className={styles.soonBadge}>PDF · DOCX · Paste</span>
            </div>
            <div>
              <p className={styles.optionLabel}>Bring what you have</p>
              <h2>Import or paste your resume</h2>
              <p>
                Upload a PDF or DOCX, or paste existing text. Review every
                detected field before it enters your draft.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/import")}
            >
              Import existing resume <ArrowRight aria-hidden="true" />
            </button>
            <p className={styles.uploadExplanation} id="upload-explanation">
              Files are processed in your browser and are not sent to a server.
            </p>
          </article>
        </section>

      </main>

      {pendingReplacement ? (
        <div
          className={styles.dialogBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingReplacement(null);
          }}
        >
          <section
            className={styles.replacementDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-draft-title"
            aria-describedby="replace-draft-description"
          >
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setPendingReplacement(null)}
              aria-label="Cancel replacing the current draft"
            >
              <X aria-hidden="true" />
            </button>
            <p className={styles.dialogEyebrow}>Current draft protected</p>
            <h2 id="replace-draft-title">Replace “{document.title}”?</h2>
            <p id="replace-draft-description">
              Starting with {pendingReplacement.description} will replace the resume saved in this browser.
              Export a backup first if you may want it later.
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.backupButton} onClick={exportCurrentDraft}>
                <Download aria-hidden="true" /> Export backup
              </button>
              <button
                type="button"
                className={styles.replaceButton}
                onClick={() => completeStartingAction(pendingReplacement.action)}
              >
                {pendingReplacement.actionLabel}
              </button>
            </div>
            <button type="button" className={styles.cancelButton} onClick={() => setPendingReplacement(null)}>
              Keep current draft
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default Start;
