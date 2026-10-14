import React, { FC } from "react";
import { ArrowRight, Check, Lock, UploadCloud } from "react-feather";
import { useNavigate } from "react-router-dom";

import styles from "./Header.module.css";

const Header: FC = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <Lock aria-hidden="true" />
            Private by design · No account required
          </p>

          <h1>
            A better resume,
            <span> crafted by you.</span>
          </h1>

          <p className={styles.description}>
            Start fresh or bring the resume you already have. Shape every
            section, make the design yours, and save a clean PDF without
            giving up control of your data.
          </p>

          <div className={styles.actions} aria-label="Resume creation options">
            <button
              className={styles.primaryAction}
              type="button"
              onClick={() => navigate("/start?mode=create")}
            >
              Choose how to start
              <ArrowRight aria-hidden="true" />
            </button>

            <button
              className={styles.secondaryAction}
              type="button"
              onClick={() => navigate("/import")}
            >
              <UploadCloud aria-hidden="true" />
              Upload existing resume
            </button>
          </div>

          <ul className={styles.assurances} aria-label="Product assurances">
            <li>
              <Check aria-hidden="true" /> Browser-first
            </li>
            <li>
              <Check aria-hidden="true" /> No watermark
            </li>
            <li>
              <Check aria-hidden="true" /> Completely free
            </li>
          </ul>
        </div>

        <div className={styles.productPreview} aria-label="ResumeCraft builder preview">
          <div className={styles.previewTopbar}>
            <div className={styles.windowControls} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>ResumeCraft editor</p>
            <span className={styles.previewFormat}>A4</span>
          </div>

          <div className={styles.previewWorkspace}>
            <div className={styles.editorPanel} aria-hidden="true">
              <div className={styles.editorTabs}>
                <span className={styles.activeTab}>Content</span>
                <span>Design</span>
                <span>Review</span>
              </div>

              <div className={styles.formGroup}>
                <span>Full name</span>
                <strong>Alex Morgan</strong>
              </div>
              <div className={styles.formGroup}>
                <span>Professional title</span>
                <strong>Product Designer</strong>
              </div>
              <div className={styles.sectionCard}>
                <span className={styles.dragHandle}>••</span>
                <strong>Experience</strong>
                <span>2 entries</span>
              </div>
              <div className={styles.sectionCard}>
                <span className={styles.dragHandle}>••</span>
                <strong>Education</strong>
                <span>1 entry</span>
              </div>
              <div className={styles.sectionCard}>
                <span className={styles.dragHandle}>••</span>
                <strong>Skills</strong>
                <span>8 skills</span>
              </div>
            </div>

            <div className={styles.pageArea} aria-hidden="true">
              <article className={styles.resumePage}>
                <header className={styles.resumeHeader}>
                  <div>
                    <h2>Alex Morgan</h2>
                    <p>Product Designer</p>
                  </div>
                  <div className={styles.contactLines}>
                    <span />
                    <span />
                    <span />
                  </div>
                </header>

                <div className={styles.resumeSection}>
                  <h3>Profile</h3>
                  <span className={styles.textLineLong} />
                  <span className={styles.textLineMedium} />
                </div>

                <div className={styles.resumeSection}>
                  <h3>Experience</h3>
                  <div className={styles.resumeEntryHeading}>
                    <strong>Senior Product Designer</strong>
                    <span>2022 — Present</span>
                  </div>
                  <p>Northstar Studio</p>
                  <div className={styles.bulletLine}><i /><span /></div>
                  <div className={styles.bulletLine}><i /><span /></div>
                  <div className={styles.bulletLineShort}><i /><span /></div>
                </div>

                <div className={styles.resumeSection}>
                  <h3>Education</h3>
                  <div className={styles.resumeEntryHeading}>
                    <strong>B.Des, Interaction Design</strong>
                    <span>2018 — 2022</span>
                  </div>
                  <p>School of Visual Arts</p>
                </div>
              </article>

              <div className={styles.previewBadge}>
                <span /> Live preview
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Header;
