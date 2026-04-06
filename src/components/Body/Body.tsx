import React, { FC, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ArrowDown } from "react-feather";

import Editor from "../Editor/Editor";
import Resume from "../Resume/Resume";

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
      <p className={styles.heading}>Resume Builder</p>
      <div className={styles.toolbar}>
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
        <button onClick={() => handlePrint(() => resumeRef.current)}>
          Download <ArrowDown />
        </button>
      </div>
      <div className={styles.main}>
        <Editor sections={sections} />
        <Resume
          ref={resumeRef}
          sections={sections}
          information={resumeInformation}
          activeColor={activeColor}
        />
      </div>
    </div>
  );
};

export default Body;
