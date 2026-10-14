import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  AlertCircle, CheckCircle, CheckSquare, Download, Edit3, Eye, FilePlus,
  Layout, RefreshCw, RotateCcw, RotateCw, Upload,
} from "react-feather";

import Editor from "../Editor/Editor";
import ResumeRenderer from "../Resume/ResumeRenderer";
import ResumeHealth from "../ResumeHealth/ResumeHealth";
import DesignControls from "../DesignControls/DesignControls";
import styles from "./Body.module.css";
import { useResumeStore } from "../../store";
import { SECTION_LABELS, getTemplateOption } from "../../constants";
import { ResumeDocument } from "../../types";
import type { HealthTarget } from "../../utils/resumeHealth";
import {
  isResumeDocument, isResumeDocumentEmpty, readPersistedResumeDocument,
} from "../../utils/resumeDocument";
import {
  calculatePrintedPageCount, createResumePdfTitle, getPrintPageStyle,
  PRINT_PAGE_DIMENSIONS,
} from "../../utils/resumeExport";

type SaveStatus = "saving" | "saved" | "error";
type BuilderMode = "content" | "design" | "review";
type MobilePane = "edit" | "preview";
type PreviewMetrics = { scale: number; pageCount: number; contentHeight: number };

const modes: Array<{ id: BuilderMode; label: string; description: string; icon: typeof Edit3 }> = [
  { id: "content", label: "Content", description: "Write and organize", icon: Edit3 },
  { id: "design", label: "Design", description: "Choose the presentation", icon: Layout },
  { id: "review", label: "Review", description: "Check and export", icon: CheckSquare },
];

const Body: FC = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const [draftNotice, setDraftNotice] = useState("");
  const [mode, setMode] = useState<BuilderMode>("content");
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const [previewMetrics, setPreviewMetrics] = useState<PreviewMetrics>({
    scale: 1, pageCount: 1, contentHeight: PRINT_PAGE_DIMENSIONS.A4.heightPx,
  });

  const {
    document, pastDocuments, futureDocuments, startBlankResume,
    loadSampleResume, resetResume,
    importResumeDocument, ensureDocumentSaved, undo, redo,
    setActiveSectionKey, setActiveDetailIndex,
  } = useResumeStore();
  const { template } = document;
  const pageDimensions = PRINT_PAGE_DIMENSIONS[document.page.size];
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: () => createResumePdfTitle(document),
    pageStyle: getPrintPageStyle(document.page.size),
    onPrintError: () => setDraftNotice("PDF export could not start. Try your browser’s print command."),
  });

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
    const viewport = previewViewportRef.current;
    const sheet = resumeRef.current?.querySelector<HTMLElement>("[data-resume-sheet]");
    if (!viewport || !sheet) return undefined;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const availableWidth = Math.max(0, viewport.clientWidth - 36);
        if (!availableWidth) return;
        const scale = Math.min(1, availableWidth / pageDimensions.widthPx);
        const contentHeight = Math.max(sheet.scrollHeight, sheet.offsetHeight, pageDimensions.heightPx);
        const pageCount = calculatePrintedPageCount(contentHeight, pageDimensions.heightPx);
        setPreviewMetrics((current) => (
          Math.abs(current.scale - scale) < 0.001 &&
          current.pageCount === pageCount &&
          Math.abs(current.contentHeight - contentHeight) < 1
            ? current
            : { scale, pageCount, contentHeight }
        ));
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(sheet);
    measure();
    return () => { observer.disconnect(); window.cancelAnimationFrame(frame); };
  }, [document, pageDimensions.heightPx, pageDimensions.widthPx]);

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

  const navigateToHealthTarget = (target: HealthTarget) => {
    if (target.mode === "content" && target.sectionKey) {
      setActiveSectionKey(target.sectionKey);
      if (target.detailIndex !== undefined) setActiveDetailIndex(target.detailIndex);
    }
    setMode(target.mode);
    setMobilePane("edit");
  };

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

  const preview = <ResumeRenderer ref={resumeRef} document={document} />;
  const templateName = getTemplateOption(template).title;

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
            <button type="button" className={styles.downloadButton} onClick={handlePrint}><Download /> Download PDF</button>
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
            <div className={styles.panelIntro}><p>Review mode</p><h2>Finish with confidence.</h2><span>Use local checks to find specific improvements before creating the PDF.</span></div>
            <ResumeHealth document={document} pageCount={previewMetrics.pageCount} onNavigate={navigateToHealthTarget} />
            <button type="button" className={styles.reviewDownload} onClick={handlePrint}><Download /> Download reviewed PDF</button>
          </div> : null}
        </section>

        <aside className={`${styles.previewPanel} ${mobilePane === "edit" ? styles.mobileHidden : ""}`}>
          <div className={styles.previewHeader}><div><p>Live preview</p><h2>{templateName}</h2></div><span>{document.page.size} · {previewMetrics.pageCount} {previewMetrics.pageCount === 1 ? "page" : "pages"}</span></div>
          <div className={`${styles.paginationStatus} ${previewMetrics.pageCount > 1 ? styles.overflowWarning : styles.pageFit}`} role="status">
            {previewMetrics.pageCount > 1 ? <AlertCircle /> : <CheckCircle />}
            <span><strong>{previewMetrics.pageCount > 1 ? "Page overflow detected" : "Fits on one page"}</strong><small>{previewMetrics.pageCount > 1 ? `The PDF will use ${previewMetrics.pageCount} pages. Dashed lines show page boundaries; entries stay together when possible.` : "The preview and exported PDF use the same physical page size."}</small></span>
          </div>
          <div className={styles.previewViewport} ref={previewViewportRef}>
            <div
              className={styles.previewStage}
              style={{
                width: `${pageDimensions.widthPx * previewMetrics.scale}px`,
                height: `${previewMetrics.contentHeight * previewMetrics.scale}px`,
              }}
            >
              <div className={styles.previewDocument} style={{ width: pageDimensions.width, transform: `scale(${previewMetrics.scale})` }}>{preview}</div>
              {Array.from({ length: previewMetrics.pageCount }, (_, index) => (
                <span key={index} className={styles.pageNumber} style={{ top: `${index * pageDimensions.heightPx * previewMetrics.scale + 8}px` }}>Page {index + 1}</span>
              ))}
              {Array.from({ length: Math.max(0, previewMetrics.pageCount - 1) }, (_, index) => (
                <span key={index} className={styles.pageBoundary} style={{ top: `${(index + 1) * pageDimensions.heightPx * previewMetrics.scale}px` }} />
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Body;
