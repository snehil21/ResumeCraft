import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  AlertCircle,
  ArrowDown,
  CheckCircle,
  Download,
  FilePlus,
  RefreshCw,
  Upload,
} from "react-feather";

import Editor from "../Editor/Editor";
import Resume from "../Resume/Resume";
import ResumeVertical from "../Resume/ResumeVertical";

import styles from "./Body.module.css";
import { useResumeStore } from "../../store";
import { COLORS, SECTION_LABELS } from "../../constants";
import { ResumeDocument, TemplateId } from "../../types";
import {
  isResumeDocument,
  isResumeDocumentEmpty,
  readPersistedResumeDocument,
} from "../../utils/resumeDocument";

type SaveStatus = "saving" | "saved" | "error";

const Body: FC = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const [draftNotice, setDraftNotice] = useState("");
  const handlePrint = useReactToPrint({
    documentTitle: "Resume",
  });

  // Get state and actions from Zustand store
  const {
    document,
    setAccentColor,
    setTemplate,
    setSectionColumns,
    startBlankResume,
    loadSampleResume,
    resetResume,
    importResumeDocument,
    ensureDocumentSaved,
  } = useResumeStore();
  const { template, theme } = document;

  useEffect(() => {
    ensureDocumentSaved();
  }, [ensureDocumentSaved]);

  useEffect(() => {
    setSaveStatus("saving");

    const statusTimer = window.setTimeout(() => {
      try {
        const savedDocument = readPersistedResumeDocument();
        setSaveStatus(
          savedDocument?.id === document.id &&
            savedDocument.updatedAt === document.updatedAt
            ? "saved"
            : "error"
        );
      } catch {
        setSaveStatus("error");
      }
    }, 350);

    return () => window.clearTimeout(statusTimer);
  }, [document]);

  const confirmDraftReplacement = (replacement: string): boolean =>
    isResumeDocumentEmpty(document) ||
    window.confirm(
      `Replace your current draft with ${replacement}? Export a JSON backup first if you want to keep it.`
    );

  const replaceDraft = (
    replacement: string,
    action: () => void,
    successMessage: string
  ) => {
    if (!confirmDraftReplacement(replacement)) return;
    action();
    setDraftNotice(successMessage);
  };

  const exportProject = () => {
    const projectJson = JSON.stringify(document, null, 2);
    const projectBlob = new Blob([projectJson], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(projectBlob);
    const downloadLink = window.document.createElement("a");
    const safeTitle = document.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resume";

    downloadLink.href = downloadUrl;
    downloadLink.download = `${safeTitle}.resumecraft.json`;
    window.document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    setDraftNotice("JSON backup exported.");
  };

  const importProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedValue: unknown = JSON.parse(await file.text());
      if (!isResumeDocument(importedValue)) {
        throw new Error("unsupported project file");
      }

      if (!confirmDraftReplacement("the imported project")) return;
      importResumeDocument(importedValue as ResumeDocument);
      setDraftNotice(`Imported ${file.name}.`);
    } catch {
      setDraftNotice(
        "Import failed. Choose a valid ResumeCraft JSON project using schema version 1."
      );
    } finally {
      event.target.value = "";
    }
  };

  // Create sections object that maps keys to labels
  const sections = {
    basicInfo: SECTION_LABELS.basicInfo,
    workExp: SECTION_LABELS.workExp,
    project: SECTION_LABELS.project,
    education: SECTION_LABELS.education,
    achievement: SECTION_LABELS.achievement,
    summary: SECTION_LABELS.summary,
    other: SECTION_LABELS.other,
  };

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <div className={styles.titleSection}>
          <h1 className={styles.heading}>Build Your <span>Professional</span> Resume</h1>
        </div>
        <div className={styles.draftBar}>
          <div
            className={`${styles.saveStatus} ${styles[saveStatus]}`}
            role="status"
            aria-live="polite"
          >
            {saveStatus === "saving" ? <RefreshCw aria-hidden="true" /> : null}
            {saveStatus === "saved" ? <CheckCircle aria-hidden="true" /> : null}
            {saveStatus === "error" ? <AlertCircle aria-hidden="true" /> : null}
            {saveStatus === "saving" ? "Saving..." : null}
            {saveStatus === "saved" ? "Saved locally" : null}
            {saveStatus === "error" ? "Couldn’t save locally" : null}
          </div>
          <div className={styles.draftActions}>
            <button
              type="button"
              onClick={() =>
                replaceDraft("a blank resume", startBlankResume, "Started a new blank resume.")
              }
            >
              <FilePlus aria-hidden="true" /> Start blank
            </button>
            <button
              type="button"
              onClick={() =>
                replaceDraft("the sample resume", loadSampleResume, "Loaded sample content.")
              }
            >
              Load sample
            </button>
            <button
              type="button"
              onClick={() =>
                replaceDraft("a reset draft", resetResume, "Draft reset.")
              }
            >
              Reset
            </button>
            <button type="button" onClick={exportProject}>
              <Download aria-hidden="true" /> Export JSON
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload aria-hidden="true" /> Import JSON
            </button>
            <input
              ref={importInputRef}
              className={styles.fileInput}
              type="file"
              accept="application/json,.json"
              onChange={importProject}
            />
          </div>
          {draftNotice ? (
            <p className={styles.draftNotice} role="status">
              {draftNotice}
            </p>
          ) : null}
        </div>
        <div className={styles.toolbar}>
          <div className={styles.controls}>
            <div className={styles.colors}>
              {COLORS.map((item) => (
                <span
                  key={item}
                  style={{ backgroundColor: item }}
                  className={`${styles.color} ${
                    theme.accentColor === item ? styles.active : ""
                  }`}
                  onClick={() => setAccentColor(item)}
                />
              ))}
            </div>
          </div>
          <button className={styles.downloadButton} onClick={() => handlePrint(() => resumeRef.current)}>
            Download PDF <ArrowDown />
          </button>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.editorContainer}>
          <div className={styles.editorControls}>
            <div className={styles.editorHeader}>
              <h2>Edit your details here</h2>
              <p>See your resume update in real-time on the right</p>
            </div>
          </div>
          <Editor sections={sections} />
        </div>
        <div className={styles.resumeContainer}>
          <div className={styles.resumeControls}>
            <div className={styles.templates}>
              <label>Choose Your Layout:</label>
              <select
                value={template}
                onChange={(e) =>
                  setTemplate(e.target.value as TemplateId)
                }
                className={styles.templateSelect}
              >
                <option value="classic">Classic (Two Column)</option>
                <option value="vertical">Vertical (Jake's Style)</option>
              </select>
            </div>
          </div>
          {template === "classic" ? (
            <Resume
              ref={resumeRef}
              document={document}
              onSectionColumnsChange={setSectionColumns}
            />
          ) : (
            <ResumeVertical
              ref={resumeRef}
              document={document}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Body;
