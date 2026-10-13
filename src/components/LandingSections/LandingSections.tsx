import React, { FC } from "react";
import {
  ArrowRight,
  Check,
  Columns,
  Download,
  Edit3,
  FilePlus,
  Shield,
  Sliders,
} from "react-feather";
import { Link } from "react-router-dom";

import transparentLogo from "../../assets/transparent-logo.svg";

import styles from "./LandingSections.module.css";

const LandingSections: FC = () => {
  return (
    <>
      <section className={styles.features} id="features">
        <div className={styles.sectionShell}>
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>The useful parts, up front</p>
            <h2>From scattered details to a resume you can stand behind.</h2>
            <p>
              ResumeCraft keeps writing, layout, and preview in one place so
              you can focus on the document instead of fighting the tool.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <span className={styles.featureIcon}><Edit3 aria-hidden="true" /></span>
              <p className={styles.featureNumber}>01</p>
              <h3>Edit with structure</h3>
              <p>
                Work through your profile, experience, projects, education,
                achievements, and supporting details section by section.
              </p>
            </article>

            <article className={styles.featureCard}>
              <span className={styles.featureIcon}><Sliders aria-hidden="true" /></span>
              <p className={styles.featureNumber}>02</p>
              <h3>Shape the presentation</h3>
              <p>
                Choose a layout and accent that suit the role while the live
                preview keeps the whole page visible.
              </p>
            </article>

            <article className={styles.featureCard}>
              <span className={styles.featureIcon}><Download aria-hidden="true" /></span>
              <p className={styles.featureNumber}>03</p>
              <h3>Leave with a real document</h3>
              <p>
                Review the result on the page, then print or save it as a clean
                PDF without a ResumeCraft watermark.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.templates} id="templates">
        <div className={`${styles.sectionShell} ${styles.templateLayout}`}>
          <div className={styles.templateCopy}>
            <p className={styles.kicker}>Layouts with a purpose</p>
            <h2>Start with structure. Make it feel like yours.</h2>
            <p>
              The current builder includes a space-efficient split layout and
              a straightforward single-column layout. Both keep content—not
              decoration—at the center.
            </p>
            <ul>
              <li><Check aria-hidden="true" /> Live preview while editing</li>
              <li><Check aria-hidden="true" /> Reorderable sections</li>
              <li><Check aria-hidden="true" /> Print-ready output</li>
            </ul>
            <Link to="/resumebuilder">
              Explore the builder <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.templateGallery} aria-label="Available resume layouts">
            <article className={styles.templateCard}>
              <div className={`${styles.miniResume} ${styles.splitResume}`} aria-hidden="true">
                <div className={styles.miniHeader}>
                  <strong>Alex Morgan</strong>
                  <span>Product Designer</span>
                </div>
                <div className={styles.splitColumns}>
                  <div>
                    <i />
                    <span />
                    <span />
                    <i />
                    <span />
                  </div>
                  <div>
                    <i />
                    <span />
                    <span />
                    <span />
                    <i />
                    <span />
                  </div>
                </div>
              </div>
              <div className={styles.templateMeta}>
                <div>
                  <p>Classic split</p>
                  <span>Two-column · space efficient</span>
                </div>
                <Columns aria-hidden="true" />
              </div>
            </article>

            <article className={`${styles.templateCard} ${styles.offsetCard}`}>
              <div className={`${styles.miniResume} ${styles.verticalResume}`} aria-hidden="true">
                <div className={styles.verticalHeader}>
                  <strong>Alex Morgan</strong>
                  <span>Product Designer</span>
                </div>
                <div className={styles.verticalBody}>
                  <i />
                  <strong />
                  <span />
                  <span />
                  <i />
                  <strong />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className={styles.templateMeta}>
                <div>
                  <p>Clean vertical</p>
                  <span>Single-column · direct</span>
                </div>
                <Columns aria-hidden="true" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.workflow} id="how-it-works">
        <div className={styles.sectionShell}>
          <div className={styles.workflowHeading}>
            <p className={styles.kicker}>A short path to done</p>
            <h2>Three steps. No setup ceremony.</h2>
          </div>

          <ol className={styles.stepList}>
            <li>
              <span className={styles.stepIcon}><FilePlus aria-hidden="true" /></span>
              <div>
                <p>Step 1</p>
                <h3>Start with your content</h3>
                <span>Create from scratch today. PDF and DOCX import is coming next.</span>
              </div>
            </li>
            <li>
              <span className={styles.stepIcon}><Edit3 aria-hidden="true" /></span>
              <div>
                <p>Step 2</p>
                <h3>Edit and arrange</h3>
                <span>Add the details that matter and watch the resume update beside you.</span>
              </div>
            </li>
            <li>
              <span className={styles.stepIcon}><Download aria-hidden="true" /></span>
              <div>
                <p>Step 3</p>
                <h3>Download your PDF</h3>
                <span>Review the page, choose your layout, and save the finished document.</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.privacy} id="privacy">
        <div className={`${styles.sectionShell} ${styles.privacyCard}`}>
          <span className={styles.privacyIcon}><Shield aria-hidden="true" /></span>
          <div>
            <p className={styles.kicker}>Your career history is personal</p>
            <h2>Your resume stays in your browser.</h2>
            <p>
              ResumeCraft currently works without accounts or a resume-storage
              backend. The information you type into the editor is not sent to
              a ResumeCraft server. You decide when to create the PDF.
            </p>
          </div>
          <div className={styles.privacyFacts}>
            <span><Check aria-hidden="true" /> No account</span>
            <span><Check aria-hidden="true" /> No server upload</span>
            <span><Check aria-hidden="true" /> No watermark</span>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.sectionShell}>
          <p className={styles.kicker}>Your next draft can start here</p>
          <h2>Build the resume. Keep the control.</h2>
          <p>Start with the information you already know. Refine the rest as you go.</p>
          <Link to="/start?mode=create">
            Create my resume <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <a className={styles.footerBrand} href="#top" aria-label="Back to top">
            <img src={transparentLogo} alt="ResumeCraft" />
          </a>
          <p>A local-first resume builder, crafted with care.</p>
          <a
            href="https://github.com/snehil21/ResumeCraft"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
};

export default LandingSections;
