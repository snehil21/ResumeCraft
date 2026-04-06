import React, { FC, useEffect } from "react";
import { X } from "react-feather";

import InputControl from "../InputControl/InputControl";
import BasicInfo from "./BasicInfo";
import WorkExp from "./WorkExp";
import Project from "./Project";
import Education from "./Education";
import Achievements from "./Achievements";
import Summary from "./Summary";
import Other from "./Other";

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
    resumeInformation,
    activeSectionKey,
    setActiveSectionKey,
    activeDetailIndex,
    setActiveDetailIndex,
    currentFormValues,
    setCurrentFormValues,
    updateResumeSection,
    addDetail,
    deleteDetail,
  } = useResumeStore();

  const activeSection = resumeInformation[activeSectionKey];
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

  // Wrapper setter function that works like React's setState
  const setValues = (updater: FormValues | ((prev: FormValues) => FormValues)) => {
    if (typeof updater === 'function') {
      setCurrentFormValues(updater(currentFormValues));
    } else {
      setCurrentFormValues(updater);
    }
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
            handlePointUpdate={(value, index) => {
              const points = currentFormValues.points || [];
              points[index] = value;
              setValues({ ...currentFormValues, points });
            }}
          />
        );
      case SECTIONS.project:
        return (
          <Project
            values={currentFormValues}
            setValues={setValues}
            handlePointUpdate={(value, index) => {
              const points = currentFormValues.points || [];
              points[index] = value;
              setValues({ ...currentFormValues, points });
            }}
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
        return (
          <Achievements
            values={currentFormValues}
            handlePointUpdate={(value, index) => {
              const points = currentFormValues.points || [];
              points[index] = value;
              setValues({ ...currentFormValues, points });
            }}
          />
        );
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
        return null;
    }
  };

  const handleSubmission = () => {
    if (activeSectionKey === SECTIONS.basicInfo) {
      const detail = buildDetailForSection(activeSectionKey, currentFormValues);
      updateResumeSection(activeSectionKey, {
        detail: detail as any,
        sectionTitle,
      });
    } else if (
      activeSectionKey === SECTIONS.workExp ||
      activeSectionKey === SECTIONS.project ||
      activeSectionKey === SECTIONS.education
    ) {
      const detail = buildDetailForSection(activeSectionKey, currentFormValues);
      const updatedDetails = [...(activeSection?.details || [])];
      updatedDetails[activeDetailIndex] = detail as any;

      updateResumeSection(activeSectionKey, {
        details: updatedDetails,
        sectionTitle,
      });
    } else if (activeSectionKey === SECTIONS.achievement) {
      updateResumeSection(activeSectionKey, {
        points: currentFormValues.points,
        sectionTitle,
      });
    } else {
      // Summary or Other
      const detail = buildDetailForSection(activeSectionKey, currentFormValues);
      updateResumeSection(activeSectionKey, {
        detail: detail as any,
        sectionTitle,
      });
    }
  };

  const handleAddNew = () => {
    addDetail(activeSectionKey);
  };

  const handleDeleteDetail = (index: number) => {
    deleteDetail(activeSectionKey, index);
  };

  const sectionKeys = Object.keys(SECTIONS) as Array<keyof typeof SECTIONS>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {sectionKeys?.map((key) => (
          <div
            className={`${styles.section} ${
              activeSectionKey === key ? styles.active : ""
            }`}
            key={key}
            onClick={() => setActiveSectionKey(key)}
          >
            {sections[key]}
          </div>
        ))}
      </div>

      <div className={styles.body}>
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
                  key={item.title + index}
                  onClick={() => setActiveDetailIndex(index)}
                >
                  <p>
                    {sections[activeSectionKey as keyof typeof sections]} {index + 1}
                  </p>
                  <X
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteDetail(index);
                    }}
                  />
                </div>
              ))
            : ""}
          {activeSection?.details &&
          Array.isArray(activeSection.details) &&
          activeSection.details.length > 0 ? (
            <div className={styles.new} onClick={handleAddNew}>
              +New
            </div>
          ) : (
            ""
          )}
        </div>

        {handleGenerateBody()}

        <button onClick={handleSubmission}>Save</button>
      </div>
    </div>
  );
};

export default Editor;
