import React, { FC, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ArrowDown } from "react-feather";

import Editor from "../Editor/Editor";
import Resume from "../Resume/Resume";
import ResumeVertical from "../Resume/ResumeVertical";

import styles from "./Body.module.css";
import { useResumeStore } from "../../store";
import { COLORS, SECTIONS, SECTION_LABELS } from "../../constants";

const Body: FC = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Resume",
  });

  // Get state and actions from Zustand store
  const {
    activeColor,
    setActiveColor,
    resumeInformation,
    activeTemplate,
    setActiveTemplate,
  } = useResumeStore();

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
        <div className={styles.toolbar}>
          <div className={styles.controls}>
            <div className={styles.colors}>
              {COLORS.map((item) => (
                <span
                  key={item}
                  style={{ backgroundColor: item }}
                  className={`${styles.color} ${
                    activeColor === item ? styles.active : ""
                  }`}
                  onClick={() => setActiveColor(item)}
                />
              ))}
            </div>
          </div>
          <button onClick={() => handlePrint(() => resumeRef.current)}>
            Download <ArrowDown />
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
                value={activeTemplate}
                onChange={(e) =>
                  setActiveTemplate(e.target.value as "classic" | "vertical")
                }
                className={styles.templateSelect}
              >
                <option value="classic">Classic (Two Column)</option>
                <option value="vertical">Vertical (Jake's Style)</option>
              </select>
            </div>
          </div>
          {activeTemplate === "classic" ? (
            <Resume
              ref={resumeRef}
              sections={sections}
              information={resumeInformation}
              activeColor={activeColor}
            />
          ) : (
            <ResumeVertical
              ref={resumeRef}
              sections={sections}
              information={resumeInformation}
              activeColor={activeColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Body;
