import React, { ChangeEvent, FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  AlertCircle, CheckCircle, CheckSquare, Download, Edit3, Eye, FilePlus,
  Layout, MoreHorizontal, RefreshCw, RotateCcw, RotateCw, Upload,
} from "react-feather";
import { Link } from "react-router-dom";

import rcMark from "../../assets/rc-mark.png";
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
  createResumePdfTitle, getPrintPageStyle,
  PRINT_PAGE_DIMENSIONS,
} from "../../utils/resumeExport";
import {
  calculatePaginationLayout,
  PaginationBreakMap,
  PaginationCandidate,
  shouldKeepSectionTogether,
} from "../../utils/resumePagination";

type SaveStatus = "saving" | "saved" | "error";
type BuilderMode = "content" | "design" | "review";
type MobilePane = "edit" | "preview";
type PreviewMetrics = { scale: number; pageCount: number; contentHeight: number };

const modes: Array<{ id: BuilderMode; label: string; accessibleLabel: string; icon: typeof Edit3 }> = [
  { id: "content", label: "Edit content", accessibleLabel: "Edit resume content", icon: Edit3 },
  { id: "design", label: "Customize design", accessibleLabel: "Customize resume design", icon: Layout },
  { id: "review", label: "Review & export", accessibleLabel: "Review and export resume", icon: CheckSquare },
];

const Body: FC = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const [draftNotice, setDraftNotice] = useState("");
  const [mode, setMode] = useState<BuilderMode>("content");
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [paginationBreaks, setPaginationBreaks] = useState<PaginationBreakMap>({});
  const [multiColumnFlowHeight, setMultiColumnFlowHeight] = useState<number>();
  const [previewMetrics, setPreviewMetrics] = useState<PreviewMetrics>({
    scale: 1, pageCount: 1, contentHeight: PRINT_PAGE_DIMENSIONS.A4.heightPx,
  });

  const {
    document, pastDocuments, futureDocuments, startBlankResume,
    loadSampleResume,
    importResumeDocument, ensureDocumentSaved, undo, redo,
    setActiveSectionKey, setActiveDetailIndex,
  } = useResumeStore();
  const { template } = document;
  const usesMultiColumnFlow = getTemplateOption(template).supportsColumns && document.layout.mode === "two";
  const pageDimensions = PRINT_PAGE_DIMENSIONS[document.page.size];
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: () => createResumePdfTitle(document),
    pageStyle: getPrintPageStyle(document.page.size),
    onPrintError: () => setDraftNotice("PDF export could not start. Try your browser’s print command."),
  });

  useEffect(() => { ensureDocumentSaved(); }, [ensureDocumentSaved]);

  useEffect(() => {
    if (!isFileMenuOpen) return undefined;
    const closeFileMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setIsFileMenuOpen(false);
        return;
      }
      if (!fileMenuRef.current?.contains(event.target as Node)) setIsFileMenuOpen(false);
    };
    window.document.addEventListener("mousedown", closeFileMenu);
    window.document.addEventListener("keydown", closeFileMenu);
    return () => {
      window.document.removeEventListener("mousedown", closeFileMenu);
      window.document.removeEventListener("keydown", closeFileMenu);
    };
  }, [isFileMenuOpen]);

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

  useLayoutEffect(() => {
    const viewport = previewViewportRef.current;
    const sheet = measurementRef.current?.querySelector<HTMLElement>("[data-resume-sheet]");
    if (!viewport || !sheet) return undefined;

    let frame = 0;
    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const availableWidth = Math.max(0, viewport.clientWidth - 36);
        if (!availableWidth) return;
        const scale = Math.min(1, availableWidth / pageDimensions.widthPx);
        const sheetRect = sheet.getBoundingClientRect();
        const sheetStyles = window.getComputedStyle(sheet);
        const paddingTop = Number.parseFloat(sheetStyles.paddingTop) || document.page.margin;
        const paddingBottom = Number.parseFloat(sheetStyles.paddingBottom) || document.page.margin;
        const itemGap = Number.parseFloat(sheetStyles.getPropertyValue("--item-gap")) || document.theme.itemGap;

        if (usesMultiColumnFlow) {
          const flow = sheet.querySelector<HTMLElement>("[data-layout-mode='multi']");
          if (!flow) return;
          const pageCount = Math.max(1, Math.ceil((flow.scrollWidth - 1) / Math.max(1, flow.clientWidth)));
          setPaginationBreaks({});
          setMultiColumnFlowHeight((current) => (
            current !== undefined && Math.abs(current - flow.clientHeight) < 1 ? current : flow.clientHeight
          ));
          setPreviewMetrics((current) => (
            Math.abs(current.scale - scale) < 0.001 && current.pageCount === pageCount
              ? current
              : { scale, pageCount, contentHeight: pageCount * pageDimensions.heightPx }
          ));
          return;
        }

        const flows = Array.from(sheet.querySelectorAll<HTMLElement>("[data-resume-flow]")).map((flow) => {
          const candidates: PaginationCandidate[] = [];
          const sections = Array.from(flow.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute("data-section-key")
          );

          sections.forEach((section) => {
            const sectionKey = section.dataset.sectionKey;
            if (!sectionKey) return;
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top - sheetRect.top;
            const sectionTitle = section.querySelector<HTMLElement>("h2")?.textContent?.trim() ?? "";
            const entries = Array.from(section.querySelectorAll<HTMLElement>("article[data-entry-id]"));
            const usableHeight = pageDimensions.heightPx - paddingTop - paddingBottom;
            const pageIndex = Math.max(0, Math.floor(sectionTop / pageDimensions.heightPx));
            const pageBottom = (pageIndex + 1) * pageDimensions.heightPx - paddingBottom;
            const remainingHeight = Math.max(0, pageBottom - sectionTop);
            if (shouldKeepSectionTogether(sectionRect.height, remainingHeight, usableHeight)) {
              candidates.push({ id: `section:${sectionKey}`, top: sectionTop, height: sectionRect.height });
              return;
            }

            if (entries.length === 0) return;

            const firstEntryRect = entries[0].getBoundingClientRect();
            candidates.push({
              id: `section:${sectionKey}`,
              top: sectionTop,
              height: firstEntryRect.bottom - sectionRect.top,
            });

            entries.slice(1).forEach((entry) => {
              const entryId = entry.dataset.entryId;
              if (!entryId) return;
              const entryRect = entry.getBoundingClientRect();
              const title = section.querySelector<HTMLElement>("h2");
              const titleStyles = title ? window.getComputedStyle(title) : null;
              const continuationHeight = title
                ? title.getBoundingClientRect().height + (Number.parseFloat(titleStyles?.marginBottom ?? "0") || 0) + itemGap * .34
                : 0;
              candidates.push({
                id: `entry:${sectionKey}:${entryId}`,
                top: entryRect.top - sheetRect.top,
                height: entryRect.height,
                continuationHeight,
                continuationTitle: sectionTitle,
              });
            });
          });

          return candidates;
        });

        const pagination = calculatePaginationLayout(
          flows,
          pageDimensions.heightPx,
          paddingTop,
          paddingBottom
        );
        setMultiColumnFlowHeight(undefined);
        setPaginationBreaks((current) => (
          JSON.stringify(current) === JSON.stringify(pagination.breaks) ? current : pagination.breaks
        ));
        setPreviewMetrics((current) => (
          Math.abs(current.scale - scale) < 0.001 &&
          current.pageCount === pagination.pageCount &&
          Math.abs(current.contentHeight - pagination.contentHeight) < 1
            ? current
            : { scale, pageCount: pagination.pageCount, contentHeight: pagination.contentHeight }
        ));
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(sheet);
    measure();
    return () => { observer.disconnect(); window.cancelAnimationFrame(frame); };
  }, [document, pageDimensions.heightPx, pageDimensions.widthPx, usesMultiColumnFlow]);

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

  const templateName = getTemplateOption(template).title;
  const previewPageHeight = pageDimensions.heightPx * previewMetrics.scale;
  const previewPageWidth = pageDimensions.widthPx * previewMetrics.scale;
  const previewPageGap = 18;

  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.builderIdentity}>
          <Link className={styles.brandMark} to="/" aria-label="ResumeCraft home">
            <img src={rcMark} alt="" />
          </Link>
          <div className={styles.titleSection}>
            <h1>{document.title}</h1>
            <div className={`${styles.saveStatus} ${styles[saveStatus]}`} role="status" aria-live="polite">
              {saveStatus === "saving" ? <RefreshCw aria-hidden="true" /> : null}
              {saveStatus === "saved" ? <CheckCircle aria-hidden="true" /> : null}
              {saveStatus === "error" ? <AlertCircle aria-hidden="true" /> : null}
              {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved locally" : "Couldn’t save"}
            </div>
          </div>
        </div>

        <nav className={styles.modeTabs} aria-label="Builder workspace">
          {modes.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;
            return <button key={item.id} type="button" className={isActive ? styles.activeMode : ""} onClick={() => setMode(item.id)} aria-current={isActive ? "page" : undefined} aria-label={item.accessibleLabel}>
              <Icon aria-hidden="true" /><span>{item.label}</span>
            </button>;
          })}
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.historyActions} aria-label="Edit history">
            <button type="button" className={styles.iconButton} onClick={undo} disabled={!pastDocuments.length} aria-label="Undo last document edit" title="Undo"><RotateCcw /></button>
            <button type="button" className={styles.iconButton} onClick={redo} disabled={!futureDocuments.length} aria-label="Redo last document edit" title="Redo"><RotateCw /></button>
          </div>
          <button type="button" className={styles.downloadButton} onClick={handlePrint} aria-label="Print or save resume as PDF"><Download aria-hidden="true" /> Print / PDF</button>
          <div className={styles.fileMenu} ref={fileMenuRef}>
            <button
              type="button"
              className={styles.moreButton}
              aria-label="Open resume actions"
              aria-haspopup="menu"
              aria-expanded={isFileMenuOpen}
              onClick={() => setIsFileMenuOpen((isOpen) => !isOpen)}
            >
              <MoreHorizontal aria-hidden="true" />
            </button>
            {isFileMenuOpen ? (
              <div className={styles.fileMenuPopover} role="menu" aria-label="Resume actions">
                <button type="button" role="menuitem" onClick={() => { setIsFileMenuOpen(false); replaceDraft("a blank resume", startBlankResume, "Started a blank resume."); }}><FilePlus aria-hidden="true" /><span><strong>Start a new resume</strong><small>Replace this draft with a blank one</small></span></button>
                <button type="button" role="menuitem" onClick={() => { setIsFileMenuOpen(false); replaceDraft("the sample resume", loadSampleResume, "Loaded sample content."); }}><Edit3 aria-hidden="true" /><span><strong>Load sample resume</strong><small>Explore the builder with example content</small></span></button>
                <span className={styles.menuDivider} aria-hidden="true" />
                <button type="button" role="menuitem" onClick={() => { setIsFileMenuOpen(false); exportProject(); }}><Download aria-hidden="true" /><span><strong>Export backup</strong><small>Download a ResumeCraft project file</small></span></button>
                <button type="button" role="menuitem" onClick={() => { setIsFileMenuOpen(false); importInputRef.current?.click(); }}><Upload aria-hidden="true" /><span><strong>Restore backup</strong><small>Open a ResumeCraft project file</small></span></button>
              </div>
            ) : null}
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
            <Editor sections={{ ...SECTION_LABELS }} />
          </> : null}

          {mode === "design" ? <div className={styles.modePanel}>
            <div className={styles.panelIntro}><p>Design mode</p><h2>Choose a clear presentation.</h2><span>These controls change appearance without touching your content.</span></div>
            <DesignControls />
          </div> : null}

          {mode === "review" ? <div className={styles.modePanel}>
            <div className={styles.panelIntro}><p>Review mode</p><h2>Finish with confidence.</h2><span>Use local checks to find specific improvements before creating the PDF.</span></div>
            <ResumeHealth document={document} pageCount={previewMetrics.pageCount} onNavigate={navigateToHealthTarget} />
            <button type="button" className={styles.reviewDownload} onClick={handlePrint}><Download /> Print / save PDF</button>
          </div> : null}
        </section>

        <aside className={`${styles.previewPanel} ${mobilePane === "edit" ? styles.mobileHidden : ""}`}>
          <div className={styles.previewHeader}>
            <div><p>Live preview</p><h2>{templateName}</h2></div>
            <span
              className={`${styles.previewPageStatus} ${previewMetrics.pageCount > 1 ? styles.previewPageOverflow : styles.previewPageFit}`}
              role="status"
              aria-label={`${document.page.size}, ${previewMetrics.pageCount} ${previewMetrics.pageCount === 1 ? "page" : "pages"}`}
            >
              {document.page.size} · {previewMetrics.pageCount} {previewMetrics.pageCount === 1 ? "page" : "pages"}
            </span>
          </div>
          <div className={styles.previewViewport} ref={previewViewportRef}>
            <div className={styles.measurementSource} style={{ width: pageDimensions.width }} aria-hidden="true">
              <ResumeRenderer ref={measurementRef} document={document} />
            </div>
            <div className={styles.printSource} style={{ width: pageDimensions.width }} aria-hidden="true">
              <div ref={resumeRef} data-resume-print-root>
                {Array.from({ length: previewMetrics.pageCount }, (_, index) => (
                  <div
                    key={index}
                    className={styles.printPage}
                    data-resume-print-page
                    style={{ width: pageDimensions.width, height: pageDimensions.height }}
                  >
                    <div
                      className={styles.printPageDocument}
                      style={{
                        width: pageDimensions.width,
                        top: usesMultiColumnFlow ? "0" : `${-index * pageDimensions.heightPx}px`,
                      }}
                    >
                      <ResumeRenderer
                        document={document}
                        paginationBreaks={paginationBreaks}
                        multiColumnPageIndex={usesMultiColumnFlow ? index : 0}
                        multiColumnFlowHeight={usesMultiColumnFlow ? multiColumnFlowHeight : undefined}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={styles.previewStage}
              style={{
                width: `${previewPageWidth}px`,
                height: `${previewMetrics.pageCount * previewPageHeight + Math.max(0, previewMetrics.pageCount - 1) * previewPageGap}px`,
              }}
              role="img"
              aria-label={`Resume preview showing ${previewMetrics.pageCount} ${previewMetrics.pageCount === 1 ? "page" : "pages"}`}
            >
              {Array.from({ length: previewMetrics.pageCount }, (_, index) => (
                <div
                  key={index}
                  className={styles.previewPage}
                  style={{ width: `${previewPageWidth}px`, height: `${previewPageHeight}px` }}
                  aria-hidden="true"
                >
                  <div
                    className={styles.previewPageDocument}
                    style={{
                      width: pageDimensions.width,
                      top: usesMultiColumnFlow ? "0" : `${-index * previewPageHeight}px`,
                      transform: `scale(${previewMetrics.scale})`,
                    }}
                  >
                    <ResumeRenderer
                      document={document}
                      paginationBreaks={paginationBreaks}
                      multiColumnPageIndex={usesMultiColumnFlow ? index : 0}
                      multiColumnFlowHeight={usesMultiColumnFlow ? multiColumnFlowHeight : undefined}
                    />
                  </div>
                  <span className={styles.pageNumber}>Page {index + 1} of {previewMetrics.pageCount}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Body;
