import React, { FC } from "react";
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff } from "react-feather";

import {
  ImportReviewContact,
  ImportReviewDraft,
  ImportReviewSection,
  ImportReviewUnrecognized,
} from "../../utils/resumeImport";
import { ResumeSectionType } from "../../utils/resumeParser";

import styles from "./ImportResume.module.css";

interface ImportReviewProps {
  draft: ImportReviewDraft;
  replacesExistingDraft: boolean;
  onChange: (draft: ImportReviewDraft) => void;
  onBack: () => void;
  onConfirm: () => void;
}

const sectionLabels: Record<ResumeSectionType, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
};

const contactFields: Array<{
  key: Exclude<keyof ImportReviewContact, "reviewFields">;
  label: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  { key: "fullName", label: "Full name", placeholder: "Your name" },
  { key: "headline", label: "Professional headline", placeholder: "Backend Engineer" },
  { key: "email", label: "Email", placeholder: "name@example.com" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "location", label: "Location", placeholder: "City, Country" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/username" },
  { key: "github", label: "GitHub", placeholder: "github.com/username" },
  {
    key: "otherLinks",
    label: "Other links",
    placeholder: "One link per line",
    multiline: true,
  },
];

const ImportReview: FC<ImportReviewProps> = ({
  draft,
  replacesExistingDraft,
  onChange,
  onBack,
  onConfirm,
}) => {
  const updateContact = (
    field: Exclude<keyof ImportReviewContact, "reviewFields">,
    value: string
  ) => {
    onChange({
      ...draft,
      contact: { ...draft.contact, [field]: value },
    });
  };

  const updateSection = (id: string, update: Partial<ImportReviewSection>) => {
    onChange({
      ...draft,
      sections: draft.sections.map((section) =>
        section.id === id ? { ...section, ...update } : section
      ),
    });
  };

  const updateUnrecognized = (
    id: string,
    update: Partial<ImportReviewUnrecognized>
  ) => {
    onChange({
      ...draft,
      unrecognized: draft.unrecognized.map((block) =>
        block.id === id ? { ...block, ...update } : block
      ),
    });
  };

  const includedCount =
    draft.sections.filter((section) => section.include).length +
    draft.unrecognized.filter((block) => block.include).length;

  return (
    <main className={styles.reviewMain}>
      <header className={styles.reviewHeader}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back to extracted text
        </button>
        <p className={styles.eyebrow}>Review before importing</p>
        <h1>Check every detected field.</h1>
        <p>
          Correct parser mistakes, exclude anything you do not want, and recover
          unrecognized content. Your active draft stays unchanged until confirmation.
        </p>
      </header>

      <div className={styles.reviewLayout}>
        <div className={styles.reviewContent}>
          <section className={styles.reviewGroup} aria-labelledby="contact-review-heading">
            <div className={styles.reviewGroupHeading}>
              <div>
                <span>01</span>
                <div>
                  <h2 id="contact-review-heading">Contact details</h2>
                  <p>These fields become the resume header.</p>
                </div>
              </div>
              {draft.contact.reviewFields.length ? (
                <span className={styles.needsReviewBadge}>
                  <AlertCircle aria-hidden="true" /> Needs review
                </span>
              ) : (
                <span className={styles.readyBadge}>
                  <CheckCircle aria-hidden="true" /> Detected
                </span>
              )}
            </div>

            <div className={styles.contactGrid}>
              {contactFields.map((field) => {
                const needsReview = draft.contact.reviewFields.includes(field.key);
                return (
                  <label key={field.key} className={field.multiline ? styles.fullField : ""}>
                    <span>
                      {field.label}
                      {needsReview ? <em>Needs review</em> : null}
                    </span>
                    {field.multiline ? (
                      <textarea
                        value={draft.contact[field.key]}
                        placeholder={field.placeholder}
                        onChange={(event) => updateContact(field.key, event.target.value)}
                      />
                    ) : (
                      <input
                        value={draft.contact[field.key]}
                        placeholder={field.placeholder}
                        onChange={(event) => updateContact(field.key, event.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          </section>

          <section className={styles.reviewGroup} aria-labelledby="sections-review-heading">
            <div className={styles.reviewGroupHeading}>
              <div>
                <span>02</span>
                <div>
                  <h2 id="sections-review-heading">Detected sections</h2>
                  <p>Edit the heading, content, and detected date ranges.</p>
                </div>
              </div>
              <span className={styles.countBadge}>{draft.sections.length} found</span>
            </div>

            <div className={styles.reviewCards}>
              {draft.sections.map((section) => (
                <article
                  key={section.id}
                  className={`${styles.reviewCard} ${!section.include ? styles.excludedCard : ""}`}
                >
                  <div className={styles.reviewCardTop}>
                    <div>
                      <p>{sectionLabels[section.type]}</p>
                      {section.needsReview ? (
                        <span className={styles.needsReviewBadge}>
                          <AlertCircle aria-hidden="true" /> Needs review
                        </span>
                      ) : null}
                    </div>
                    <label className={styles.includeToggle}>
                      <input
                        type="checkbox"
                        checked={section.include}
                        onChange={(event) =>
                          updateSection(section.id, { include: event.target.checked })
                        }
                      />
                      {section.include ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                      {section.include ? "Included" : "Excluded"}
                    </label>
                  </div>

                  <label>
                    <span>Section heading</span>
                    <input
                      value={section.heading}
                      disabled={!section.include}
                      onChange={(event) =>
                        updateSection(section.id, { heading: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    <span>Detected content</span>
                    <textarea
                      value={section.content}
                      disabled={!section.include}
                      onChange={(event) =>
                        updateSection(section.id, { content: event.target.value })
                      }
                    />
                  </label>

                  {section.dateRanges.length ? (
                    <div className={styles.dateReview}>
                      <p>Detected date ranges</p>
                      {section.dateRanges.map((range) => (
                        <div key={range.id} className={styles.dateRow}>
                          <label>
                            <span>Start</span>
                            <input
                              value={range.start}
                              disabled={!section.include}
                              onChange={(event) =>
                                updateSection(section.id, {
                                  dateRanges: section.dateRanges.map((item) =>
                                    item.id === range.id
                                      ? { ...item, start: event.target.value }
                                      : item
                                  ),
                                })
                              }
                            />
                          </label>
                          <label>
                            <span>End</span>
                            <input
                              value={range.end}
                              disabled={!section.include || range.isCurrent}
                              onChange={(event) =>
                                updateSection(section.id, {
                                  dateRanges: section.dateRanges.map((item) =>
                                    item.id === range.id
                                      ? { ...item, end: event.target.value }
                                      : item
                                  ),
                                })
                              }
                            />
                          </label>
                          <label className={styles.currentToggle}>
                            <input
                              type="checkbox"
                              checked={range.isCurrent}
                              disabled={!section.include}
                              onChange={(event) =>
                                updateSection(section.id, {
                                  dateRanges: section.dateRanges.map((item) =>
                                    item.id === range.id
                                      ? {
                                          ...item,
                                          isCurrent: event.target.checked,
                                          end: event.target.checked ? "Present" : "",
                                        }
                                      : item
                                  ),
                                })
                              }
                            />
                            Current
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          <section className={styles.reviewGroup} aria-labelledby="unrecognized-review-heading">
            <div className={styles.reviewGroupHeading}>
              <div>
                <span>03</span>
                <div>
                  <h2 id="unrecognized-review-heading">Unrecognized content</h2>
                  <p>Nothing is discarded. Include selected blocks in the Other section.</p>
                </div>
              </div>
              <span className={styles.countBadge}>{draft.unrecognized.length} blocks</span>
            </div>

            {draft.unrecognized.length ? (
              <div className={styles.reviewCards}>
                {draft.unrecognized.map((block) => (
                  <article
                    key={block.id}
                    className={`${styles.reviewCard} ${!block.include ? styles.excludedCard : ""}`}
                  >
                    <div className={styles.reviewCardTop}>
                      <p className={styles.unrecognizedReason}>{block.reason}</p>
                      <label className={styles.includeToggle}>
                        <input
                          type="checkbox"
                          checked={block.include}
                          onChange={(event) =>
                            updateUnrecognized(block.id, { include: event.target.checked })
                          }
                        />
                        {block.include ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                        {block.include ? "Include in Other" : "Keep excluded"}
                      </label>
                    </div>
                    <label>
                      <span>Heading</span>
                      <input
                        value={block.heading}
                        disabled={!block.include}
                        onChange={(event) =>
                          updateUnrecognized(block.id, { heading: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Recovered text</span>
                      <textarea
                        value={block.content}
                        disabled={!block.include}
                        onChange={(event) =>
                          updateUnrecognized(block.id, { content: event.target.value })
                        }
                      />
                    </label>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.allRecognized}>
                <CheckCircle aria-hidden="true" /> All extracted text was recognized.
              </div>
            )}
          </section>

          <details className={styles.originalText}>
            <summary>View original extracted text</summary>
            <textarea readOnly value={draft.originalText} aria-label="Original extracted text" />
          </details>
        </div>

        <aside className={styles.confirmPanel}>
          <p className={styles.eyebrow}>Import summary</p>
          <h2>Ready when you are.</h2>
          <dl>
            <div>
              <dt>Included blocks</dt>
              <dd>{includedCount}</dd>
            </div>
            <div>
              <dt>Excluded blocks</dt>
              <dd>{draft.sections.length + draft.unrecognized.length - includedCount}</dd>
            </div>
            <div>
              <dt>Needs review</dt>
              <dd>
                {draft.sections.filter((section) => section.needsReview).length +
                  draft.contact.reviewFields.length}
              </dd>
            </div>
          </dl>
          {replacesExistingDraft ? (
            <div className={styles.replaceWarning}>
              <AlertCircle aria-hidden="true" />
              <p>Confirmation will replace your current local resume draft.</p>
            </div>
          ) : null}
          <button type="button" className={styles.confirmButton} onClick={onConfirm}>
            {replacesExistingDraft ? "Replace draft and continue" : "Create reviewed resume"}
          </button>
          <p className={styles.confirmNote}>
            No resume data is written to the builder until you use this button.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default ImportReview;
