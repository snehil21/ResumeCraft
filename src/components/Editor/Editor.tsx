import React, { FC, useEffect } from "react";
import { ArrowDown, ArrowUp, Copy, X } from "react-feather";

import InputControl from "../InputControl/InputControl";
import BasicInfo from "./BasicInfo";
import WorkExp from "./WorkExp";
import Project from "./Project";
import Education from "./Education";
import Summary from "./Summary";
import Other from "./Other";
import SectionManager from "./SectionManager";
import GenericSectionEditor from "./GenericSectionEditor";

import styles from "./Editor.module.css";
import { useResumeStore } from "../../store";
import { SECTIONS, SECTION_LABELS } from "../../constants";
import { extractFormValuesFromSection, buildDetailForSection } from "../../utils/formHelpers";
import { FormValues } from "../../types";

interface EditorProps {
  sections: typeof SECTION_LABELS;
}

const Editor: FC<EditorProps> = ({ sections }) => {
  const {
    document,
    activeSectionKey,
    setActiveSectionKey,
    activeDetailIndex,
    setActiveDetailIndex,
    currentFormValues,
    setCurrentFormValues,
    updateResumeSection,
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
  }, [activeSectionKey, activeDetailIndex, activeSection, setCurrentFormValues]);

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
      activeSectionKey === SECTIONS.education
    ) {
      const detail = buildDetailForSection(activeSectionKey, values);
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

    if (activeSectionKey === SECTIONS.achievement) {
      updateResumeSection(activeSectionKey, {
        points: values.points,
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
        return <GenericSectionEditor sectionKey={activeSectionKey} />;
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

  return (
    <div className={styles.container}>
      <div className={styles.header} role="tablist" aria-label="Resume sections">
        {sectionKeys?.map((key) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeSectionKey === key}
            className={`${styles.section} ${
              activeSectionKey === key ? styles.active : ""
            }`}
            key={key}
            onClick={() => setActiveSectionKey(key)}
          >
            {document.resumeInformation[key]?.sectionTitle || sections[key as keyof typeof sections] || "Section"}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <SectionManager />
        <InputControl
          label="Title"
          placeholder="Enter section title"
          value={sectionTitle}
          onChange={(event) => {
            updateResumeSection(activeSectionKey, {
              sectionTitle: event.target.value,
            });
          }}
        />

        <div className={styles.chips}>
          {activeSection?.details && Array.isArray(activeSection.details)
            ? activeSection.details.map((item: any, index: number) => (
                <div
                  className={`${styles.chip} ${
                    activeDetailIndex === index ? styles.active : ""
                  }`}
                  key={item.id}
                  onClick={() => setActiveDetailIndex(index)}
                >
                  <p>
                    {activeSection.sectionTitle} {index + 1}
                  </p>
                  <div className={styles.entryActions}>
                    <button type="button" disabled={index === 0} onClick={(event) => { event.stopPropagation(); moveDetail(activeSectionKey, index, -1); }} aria-label={`Move entry ${index + 1} up`}><ArrowUp /></button>
                    <button type="button" disabled={index === activeSection.details!.length - 1} onClick={(event) => { event.stopPropagation(); moveDetail(activeSectionKey, index, 1); }} aria-label={`Move entry ${index + 1} down`}><ArrowDown /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); duplicateDetail(activeSectionKey, index); }} aria-label={`Duplicate entry ${index + 1}`}><Copy /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); handleDeleteDetail(index); }} aria-label={`Delete entry ${index + 1}`}><X /></button>
                  </div>
                </div>
              ))
            : ""}
          {activeSection?.details &&
          Array.isArray(activeSection.details) ? (
            <div className={styles.new} onClick={handleAddNew}>
              +New
            </div>
          ) : (
            ""
          )}
        </div>

        {handleGenerateBody()}

        <p className={styles.autosaveHint}>Changes update the preview and save locally as you type.</p>
      </div>
    </div>
  );
};

export default Editor;
