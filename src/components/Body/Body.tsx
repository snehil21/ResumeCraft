import React, { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  AlertCircle, CheckCircle, CheckSquare, Download, Edit3, Eye, FilePlus,
  Layout, RefreshCw, RotateCcw, RotateCw, Upload,
} from "react-feather";

import Editor from "../Editor/Editor";
import Resume from "../Resume/Resume";
import ResumeVertical from "../Resume/ResumeVertical";
import DesignControls from "../DesignControls/DesignControls";
import styles from "./Body.module.css";
import { useResumeStore } from "../../store";
import { SECTION_LABELS } from "../../constants";
import { ResumeDocument, Section } from "../../types";
import {
  isResumeDocument, isResumeDocumentEmpty, readPersistedResumeDocument,
} from "../../utils/resumeDocument";

type SaveStatus = "saving" | "saved" | "error";
type BuilderMode = "content" | "design" | "review";
type MobilePane = "edit" | "preview";

const modes: Array<{ id: BuilderMode; label: string; description: string; icon: typeof Edit3 }> = [
  { id: "content", label: "Content", description: "Write and organize", icon: Edit3 },
  { id: "design", label: "Design", description: "Choose the presentation", icon: Layout },
  { id: "review", label: "Review", description: "Check and export", icon: CheckSquare },
];

const hasMeaningfulContent = (section: Section): boolean => {
  if (typeof section.detail === "string") return section.detail.trim().length > 0;
  if (section.detail && typeof section.detail === "object") {
    return Object.values(section.detail).some((value) => String(value ?? "").trim());
  }
  if (section.points?.some((point) => point.trim())) return true;
  return Boolean(section.details?.some((detail) =>
    Object.entries(detail).some(([key, value]) => key !== "id" && String(value ?? "").trim())
  ));
};

const Body: FC = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const [draftNotice, setDraftNotice] = useState("");
  const [mode, setMode] = useState<BuilderMode>("content");
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const handlePrint = useReactToPrint({ documentTitle: "Resume" });

  const {
    document, pastDocuments, futureDocuments, setSectionColumns,
    startBlankResume, loadSampleResume, resetResume,
    importResumeDocument, ensureDocumentSaved, undo, redo,
  } = useResumeStore();
  const { template } = document;

  useEffect(() => { ensureDocumentSaved(); }, [ensureDocumentSaved]);

  useEffect(() => {
    setSaveStatus("saving");
    const statusTimer = window.setTimeout(() => {
      try {
        const savedDocument = readPersistedResumeDocument();
        setSaveStatus(savedDocument?.id === document.id && savedDocument.updatedAt === document.updatedAt ? "saved" : "error");
      } catch { setSaveStatus("error"); }
    }, 350);
    return () => window.clearTimeout(statusTimer);
  }, [document]);

  useEffect(() => {
    const handleKeyboardHistory = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") || !(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault(); undo();
      } else if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") {
        event.preventDefault(); redo();
      }
    };
    window.addEventListener("keydown", handleKeyboardHistory);
    return () => window.removeEventListener("keydown", handleKeyboardHistory);
  }, [redo, undo]);

  const reviewStats = useMemo(() => {
    const allSections = Object.values(document.resumeInformation);
    const visibleSections = allSections.filter((section) => section.visible);
    const incompleteSections = visibleSections.filter((section) => !hasMeaningfulContent(section));
    const basic = document.resumeInformation.basicInfo?.detail as { name?: string; email?: string; title?: string } | undefined;
    const missingBasics = [
      !basic?.name?.trim() ? "Name" : "",
      !basic?.title?.trim() ? "Professional title" : "",
      !basic?.email?.trim() ? "Email" : "",
    ].filter(Boolean);
    return { visibleSections, incompleteSections, missingBasics };
  }, [document]);

  const confirmDraftReplacement = (replacement: string): boolean =>
    isResumeDocumentEmpty(document) || window.confirm(
      `Replace your current draft with ${replacement}? Export a JSON backup first if you want to keep it.`
    );

  const replaceDraft = (replacement: string, action: () => void, successMessage: string) => {
    if (!confirmDraftReplacement(replacement)) return;
    action(); setDraftNotice(successMessage); setMode("content"); setMobilePane("edit");
  };

  const exportProject = () => {
    const projectBlob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(projectBlob);
    const downloadLink = window.document.createElement("a");
    const safeTitle = document.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
    downloadLink.href = downloadUrl;
    downloadLink.download = `${safeTitle}.resumecraft.json`;
    window.document.body.appendChild(downloadLink);
    downloadLink.click(); downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    setDraftNotice("JSON backup exported.");
  };

  const importProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const importedValue: unknown = JSON.parse(await file.text());
      if (!isResumeDocument(importedValue)) throw new Error("unsupported project file");
      if (!confirmDraftReplacement("the imported project")) return;
      importResumeDocument(importedValue as ResumeDocument);
      setDraftNotice(`Imported ${file.name}.`);
    } catch {
      setDraftNotice("Import failed. Choose a valid ResumeCraft JSON project using schema version 1.");
    } finally { event.target.value = ""; }
  };

  const preview = template === "classic" ? (
    <Resume ref={resumeRef} document={document} onSectionColumnsChange={setSectionColumns} />
  ) : <ResumeVertical ref={resumeRef} document={document} />;

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.builderHeader}>
          <div className={styles.titleSection}>
            <p>ResumeCraft studio</p><h1>{document.title}</h1>
          </div>
          <div className={styles.headerActions}>
            <div className={`${styles.saveStatus} ${styles[saveStatus]}`} role="status" aria-live="polite">
              {saveStatus === "saving" ? <RefreshCw aria-hidden="true" /> : null}
              {saveStatus === "saved" ? <CheckCircle aria-hidden="true" /> : null}
              {saveStatus === "error" ? <AlertCircle aria-hidden="true" /> : null}
              {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved locally" : "Couldn’t save"}
            </div>
            <button type="button" className={styles.iconButton} onClick={undo} disabled={!pastDocuments.length} aria-label="Undo last document edit" title="Undo"><RotateCcw /></button>
            <button type="button" className={styles.iconButton} onClick={redo} disabled={!futureDocuments.length} aria-label="Redo last document edit" title="Redo"><RotateCw /></button>
            <button type="button" className={styles.downloadButton} onClick={() => handlePrint(() => resumeRef.current)}><Download /> Download PDF</button>
          </div>
        </div>

        <div className={styles.navigationRow}>
          <nav className={styles.modeTabs} aria-label="Builder modes">
            {modes.map((item) => {
              const Icon = item.icon;
              return <button key={item.id} type="button" className={mode === item.id ? styles.activeMode : ""} onClick={() => setMode(item.id)} aria-current={mode === item.id ? "page" : undefined}>
                <Icon /><span><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>;
            })}
          </nav>
          <div className={styles.draftActions}>
            <button type="button" onClick={() => replaceDraft("a blank resume", startBlankResume, "Started a blank resume.")}><FilePlus /> New</button>
            <button type="button" onClick={() => replaceDraft("the sample resume", loadSampleResume, "Loaded sample content.")}>Sample</button>
            <button type="button" onClick={() => replaceDraft("a reset draft", resetResume, "Draft reset.")}>Reset</button>
            <button type="button" onClick={exportProject}><Download /> JSON</button>
            <button type="button" onClick={() => importInputRef.current?.click()}><Upload /> Import</button>
            <input ref={importInputRef} className={styles.fileInput} type="file" accept="application/json,.json" onChange={importProject} />
          </div>
        </div>
        {draftNotice ? <p className={styles.draftNotice} role="status">{draftNotice}</p> : null}
      </header>

      <div className={styles.mobilePaneTabs} aria-label="Mobile builder view">
        <button type="button" className={mobilePane === "edit" ? styles.activePane : ""} onClick={() => setMobilePane("edit")}><Edit3 /> Edit</button>
        <button type="button" className={mobilePane === "preview" ? styles.activePane : ""} onClick={() => setMobilePane("preview")}><Eye /> Preview</button>
      </div>

      <main className={styles.main}>
        <section className={`${styles.workspacePanel} ${mobilePane === "preview" ? styles.mobileHidden : ""}`}>
          {mode === "content" ? <>
            <div className={styles.panelIntro}><p>Content mode</p><h2>Build the story.</h2><span>Every field updates the document immediately.</span></div>
            <Editor sections={{ ...SECTION_LABELS }} />
          </> : null}

          {mode === "design" ? <div className={styles.modePanel}>
            <div className={styles.panelIntro}><p>Design mode</p><h2>Choose a clear presentation.</h2><span>These controls change appearance without touching your content.</span></div>
            <DesignControls />
          </div> : null}

          {mode === "review" ? <div className={styles.modePanel}>
            <div className={styles.panelIntro}><p>Review mode</p><h2>Finish with confidence.</h2><span>Check the essentials before creating the PDF.</span></div>
            <section className={styles.reviewCard}>
              <div className={styles.reviewScore}><span>{reviewStats.incompleteSections.length + reviewStats.missingBasics.length ? "Review" : "Ready"}</span><strong>{reviewStats.visibleSections.length}</strong><small>visible sections</small></div>
              <div className={styles.reviewChecklist}>
                <div className={!reviewStats.missingBasics.length ? styles.checkPassed : ""}>{!reviewStats.missingBasics.length ? <CheckCircle /> : <AlertCircle />}<span><strong>Header essentials</strong><small>{reviewStats.missingBasics.length ? `Missing: ${reviewStats.missingBasics.join(", ")}` : "Name, title, and email are present"}</small></span></div>
                <div className={!reviewStats.incompleteSections.length ? styles.checkPassed : ""}>{!reviewStats.incompleteSections.length ? <CheckCircle /> : <AlertCircle />}<span><strong>Visible section content</strong><small>{reviewStats.incompleteSections.length ? `${reviewStats.incompleteSections.length} visible section(s) need content` : "Every visible section contains content"}</small></span></div>
                <div className={styles.checkPassed}><CheckCircle /><span><strong>Saved locally</strong><small>Your latest document is stored in this browser</small></span></div>
              </div>
            </section>
            <button type="button" className={styles.reviewDownload} onClick={() => handlePrint(() => resumeRef.current)}><Download /> Download reviewed PDF</button>
          </div> : null}
        </section>

        <aside className={`${styles.previewPanel} ${mobilePane === "edit" ? styles.mobileHidden : ""}`}>
          <div className={styles.previewHeader}><div><p>Live preview</p><h2>{template === "classic" ? "Classic split" : "Clean vertical"}</h2></div><span>{document.page.size}</span></div>
          <div className={styles.previewViewport}>{preview}</div>
        </aside>
      </main>
    </div>
  );
};

export default Body;
