import React, { FC, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Edit2, Eye, EyeOff, MoreHorizontal, Plus, Settings, Trash2 } from "react-feather";

import InputControl from "../InputControl/InputControl";
import BasicInfo from "./BasicInfo";
import WorkExp from "./WorkExp";
import Project from "./Project";
import Education from "./Education";
import Summary from "./Summary";
import Other from "./Other";
import SectionManager from "./SectionManager";
import GenericSectionEditor from "./GenericSectionEditor";
import StructuredSectionEditor from "./StructuredSectionEditor";

import styles from "./Editor.module.css";
import { useResumeStore } from "../../store";
import {
  ADDITIONAL_SECTION_KEYS,
  CORE_SECTION_KEYS,
  SECTIONS,
  SECTION_LABELS,
  STRUCTURED_SECTION_DEFINITIONS,
} from "../../constants";
import { extractFormValuesFromSection, buildDetailForSection } from "../../utils/formHelpers";
import { FormValues } from "../../types";

interface EditorProps {
  sections: typeof SECTION_LABELS;
}

const Editor: FC<EditorProps> = ({ sections }) => {
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
  const [isRenamingSection, setIsRenamingSection] = useState(false);
  const [entryMenuIndex, setEntryMenuIndex] = useState<number | null>(null);
  const {
    document,
    activeSectionKey,
    setActiveSectionKey,
    activeDetailIndex,
    setActiveDetailIndex,
    currentFormValues,
    setCurrentFormValues,
    updateResumeSection,
    setSectionVisibility,
    addDetail,
    deleteDetail,
    moveDetail,
    duplicateDetail,
  } = useResumeStore();

  const activeSection = document.resumeInformation[activeSectionKey];
  const sectionTitle = activeSection?.sectionTitle || sections[activeSectionKey as keyof typeof sections];

  useEffect(() => {
    // Load form values when section or detail index changes
    const formValues = extractFormValuesFromSection(
      activeSection,
      activeSectionKey,
      activeDetailIndex
    );
    setCurrentFormValues(formValues);
    setIsRenamingSection(false);
    setEntryMenuIndex(null);
  }, [activeSectionKey, activeDetailIndex, activeSection, setCurrentFormValues]);

  useEffect(() => {
    if (entryMenuIndex === null) return undefined;
    const closeEntryMenu = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setEntryMenuIndex(null);
        return;
      }
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-entry-menu]")) {
        setEntryMenuIndex(null);
      }
    };
    window.document.addEventListener("mousedown", closeEntryMenu);
    window.document.addEventListener("keydown", closeEntryMenu);
    return () => {
      window.document.removeEventListener("mousedown", closeEntryMenu);
      window.document.removeEventListener("keydown", closeEntryMenu);
    };
  }, [entryMenuIndex]);

  const persistValues = (values: FormValues) => {
    if (activeSection?.kind === "text" && activeSectionKey !== SECTIONS.other) {
      updateResumeSection(activeSectionKey, { detail: values.other ?? "", sectionTitle });
      return;
    }
    if (activeSectionKey === SECTIONS.basicInfo) {
      updateResumeSection(activeSectionKey, {
        detail: buildDetailForSection(activeSectionKey, values) as any,
        sectionTitle,
      });
      return;
    }

    if (
      activeSectionKey === SECTIONS.workExp ||
      activeSectionKey === SECTIONS.project ||
      activeSectionKey === SECTIONS.education ||
      activeSection?.kind === "entries"
    ) {
      const detail = activeSection?.kind === "entries"
        ? { ...values }
        : buildDetailForSection(activeSectionKey, values);
      const updatedDetails = [...(activeSection?.details || [])];
      const existingId = updatedDetails[activeDetailIndex]?.id;
      updatedDetails[activeDetailIndex] = {
        ...(detail as object),
        id: existingId,
      } as any;

      updateResumeSection(activeSectionKey, {
        details: updatedDetails,
        sectionTitle,
      });
      return;
    }

    updateResumeSection(activeSectionKey, {
      detail: buildDetailForSection(activeSectionKey, values) as any,
      sectionTitle,
    });
  };

  // Every field edit is written to the document immediately, so changing tabs
  // or modes cannot discard unsaved form state.
  const setValues = (updater: FormValues | ((prev: FormValues) => FormValues)) => {
    const nextValues =
      typeof updater === "function" ? updater(currentFormValues) : updater;
    setCurrentFormValues(nextValues);
    persistValues(nextValues);
  };

  const handleGenerateBody = () => {
    switch (activeSectionKey) {
      case SECTIONS.basicInfo:
        return (
          <BasicInfo
            values={currentFormValues}
            setValues={setValues}
          />
        );
      case SECTIONS.workExp:
        return (
          <WorkExp
            values={currentFormValues}
            setValues={setValues}
          />
        );
      case SECTIONS.project:
        return (
          <Project
            values={currentFormValues}
            setValues={setValues}
          />
        );
      case SECTIONS.education:
        return (
          <Education
            values={currentFormValues}
            setValues={setValues}
          />
        );
      case SECTIONS.achievement:
        return <StructuredSectionEditor sectionKey={activeSectionKey} values={currentFormValues} setValues={setValues} />;
      case SECTIONS.summary:
        return (
          <Summary
            values={currentFormValues}
            setValues={setValues}
          />
        );
      case SECTIONS.other:
        return (
          <Other values={currentFormValues} setValues={setValues} />
        );
      default:
        if (activeSection?.kind === "entries") {
          return <StructuredSectionEditor sectionKey={activeSectionKey} values={currentFormValues} setValues={setValues} />;
        }
        return activeSection?.kind === "list" || activeSection?.kind === "text"
          ? <GenericSectionEditor sectionKey={activeSectionKey} />
          : null;
    }
  };

  const handleAddNew = () => {
    addDetail(activeSectionKey);
  };

  const handleDeleteDetail = (index: number) => {
    deleteDetail(activeSectionKey, index);
  };

  const sectionKeys = [
    SECTIONS.basicInfo,
    ...document.layout.sectionOrder.filter(
      (key) => document.resumeInformation[key] && !document.resumeInformation[key].deleted
    ),
  ];

  const entryNoun = STRUCTURED_SECTION_DEFINITIONS[activeSectionKey]?.noun || (activeSectionKey === SECTIONS.workExp
    ? "experience"
    : activeSectionKey === SECTIONS.project
      ? "project"
      : activeSectionKey === SECTIONS.education
        ? "education"
        : "entry");

  const entryPresentation = (item: any, index: number) => {
    const primary = item.title?.trim() || `Untitled ${entryNoun}`;
    const secondary = activeSectionKey === SECTIONS.workExp
      ? item.companyName?.trim()
      : activeSectionKey === SECTIONS.education
        ? item.college?.trim()
        : activeSectionKey === SECTIONS.project
          ? item.overview?.trim()
          : (item.subtitle || item.issuer || item.organization || item.publisher || item.provider || item.proficiency)?.trim();
    return { primary, secondary: secondary || `${sectionTitle} ${index + 1}` };
  };

  const availableKeys = sectionKeys.filter((key) => document.resumeInformation[key]);
  const profileKeys = [SECTIONS.basicInfo, SECTIONS.summary].filter((key) => availableKeys.includes(key));
  const coreKeys = CORE_SECTION_KEYS.filter((key) => availableKeys.includes(key));
  const additionalKeys = ADDITIONAL_SECTION_KEYS.filter((key) => availableKeys.includes(key));
  const knownKeys = new Set([...profileKeys, ...coreKeys, ...additionalKeys]);
  const customKeys = availableKeys.filter((key) => !knownKeys.has(key));
  const optionLabel = (key: string) => {
    const section = document.resumeInformation[key];
    const count = section.details?.filter((item) => Object.entries(item).some(([field, value]) => field !== "id" && String(value ?? "").trim())).length;
    const suffix = section.visible === false ? " (hidden)" : typeof count === "number" && count > 0 ? ` (${count})` : "";
    return `${section.sectionTitle || sections[key as keyof typeof sections] || "Section"}${suffix}`;
  };
  const renderOptions = (keys: string[]) => keys.map((key) => <option key={key} value={key}>{optionLabel(key)}</option>);
  const sectionDefinition = STRUCTURED_SECTION_DEFINITIONS[activeSectionKey];
  const entryCount = activeSection?.details?.filter((item) => Object.entries(item).some(([field, value]) => field !== "id" && String(value ?? "").trim())).length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.editorToolbar}>
        <div className={styles.sectionSelect}>
          <label htmlFor="resume-section-select">Resume section</label>
          <select id="resume-section-select" aria-describedby="resume-section-description" value={activeSectionKey} onChange={(event) => setActiveSectionKey(event.target.value)}>
            <optgroup label="Profile">{renderOptions(profileKeys)}</optgroup>
            <optgroup label="Career">{renderOptions(coreKeys)}</optgroup>
            <optgroup label="Additional">{renderOptions(additionalKeys)}</optgroup>
            {customKeys.length ? <optgroup label="Custom">{renderOptions(customKeys)}</optgroup> : null}
          </select>
          <small id="resume-section-description">{sectionDefinition?.description || (activeSection?.visible === false ? "This section is hidden from the resume." : "Choose a section to edit its content.")}</small>
        </div>
        <div className={styles.toolbarActions}>
          {activeSectionKey !== SECTIONS.basicInfo ? <button type="button" className={styles.visibilityButton} onClick={() => setSectionVisibility(activeSectionKey, !activeSection?.visible)} aria-pressed={activeSection?.visible === false}>
            {activeSection?.visible === false ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {activeSection?.visible === false ? "Hidden" : "Shown"}
          </button> : null}
          <button type="button" className={styles.manageButton} onClick={() => setIsSectionManagerOpen(true)}>
            <Settings aria-hidden="true" /> Manage
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionHeading}>
          <div>
            <p>Editing section</p>
            <h2>{sectionTitle}</h2>
            {activeSection?.details ? <span className={styles.entryCount}>{entryCount} {entryCount === 1 ? entryNoun : `${entryNoun}s`}</span> : null}
          </div>
          <button type="button" className={styles.renameButton} onClick={() => setIsRenamingSection((isOpen) => !isOpen)} aria-expanded={isRenamingSection}>
            <Edit2 aria-hidden="true" /> Rename
          </button>
        </div>

        {isRenamingSection ? (
          <div className={styles.renameControl}>
            <InputControl
              label="Section heading"
              placeholder="Enter section heading"
              value={sectionTitle}
              onChange={(event) => updateResumeSection(activeSectionKey, { sectionTitle: event.target.value })}
            />
          </div>
        ) : null}

        <div className={styles.entries}>
          {activeSection?.details && Array.isArray(activeSection.details)
            ? activeSection.details.map((item: any, index: number) => {
                const presentation = entryPresentation(item, index);
                return (
                <div className={`${styles.entryRow} ${activeDetailIndex === index ? styles.activeEntry : ""}`} key={item.id}>
                  <button type="button" className={styles.entrySelect} onClick={() => setActiveDetailIndex(index)} aria-current={activeDetailIndex === index ? "true" : undefined}>
                    <span>{presentation.primary}</span>
                    <small>{presentation.secondary}</small>
                  </button>
                  <div className={styles.entryMenu} data-entry-menu>
                    <button type="button" className={styles.entryMenuButton} onClick={() => setEntryMenuIndex((current) => current === index ? null : index)} aria-label={`Actions for ${presentation.primary}`} aria-haspopup="menu" aria-expanded={entryMenuIndex === index}><MoreHorizontal /></button>
                    {entryMenuIndex === index ? (
                      <div className={styles.entryMenuPopover} role="menu">
                        <button type="button" role="menuitem" disabled={index === 0} onClick={() => { moveDetail(activeSectionKey, index, -1); setEntryMenuIndex(null); }}><ArrowUp /> Move up</button>
                        <button type="button" role="menuitem" disabled={index === activeSection.details!.length - 1} onClick={() => { moveDetail(activeSectionKey, index, 1); setEntryMenuIndex(null); }}><ArrowDown /> Move down</button>
                        <button type="button" role="menuitem" onClick={() => { duplicateDetail(activeSectionKey, index); setEntryMenuIndex(null); }}><Copy /> Duplicate</button>
                        <button type="button" role="menuitem" className={styles.deleteEntry} onClick={() => { handleDeleteDetail(index); setEntryMenuIndex(null); }}><Trash2 /> Delete</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );})
            : ""}
          {activeSection?.details &&
          Array.isArray(activeSection.details) ? (
            <button type="button" className={styles.addEntry} onClick={handleAddNew}>
              <Plus aria-hidden="true" /> Add {entryNoun}
            </button>
          ) : (
            ""
          )}
        </div>

        {handleGenerateBody()}
      </div>

      <SectionManager isOpen={isSectionManagerOpen} onClose={() => setIsSectionManagerOpen(false)} />
    </div>
  );
};

export default Editor;
