import React, { FC, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2, X } from "react-feather";

import { SECTIONS } from "../../constants";
import { useResumeStore } from "../../store";
import styles from "./SectionManager.module.css";

interface SectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SectionManager: FC<SectionManagerProps> = ({ isOpen, onClose }) => {
  const [customTitle, setCustomTitle] = useState("");
  const {
    document,
    updateResumeSection,
    setSectionVisibility,
    moveSection,
    duplicateSection,
    deleteSection,
    restoreSection,
    addCustomSection,
  } = useResumeStore();

  const orderedSections = document.layout.sectionOrder
    .map((key) => [key, document.resumeInformation[key]] as const)
    .filter(([, section]) => section && !section.deleted);
  const deletedSections = Object.entries(document.resumeInformation).filter(
    ([key, section]) => key !== SECTIONS.basicInfo && section.deleted
  );

  const addCustom = (kind: "text" | "list") => {
    addCustomSection(kind, customTitle);
    setCustomTitle("");
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.document.addEventListener("keydown", handleEscape);
    return () => window.document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={styles.manager} role="dialog" aria-modal="true" aria-labelledby="section-manager-title">
        <header className={styles.header}>
          <div>
            <p>Resume structure</p>
            <h2 id="section-manager-title">Manage sections</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close section manager"><X /></button>
        </header>
        <div className={styles.body}>
        <p className={styles.help}>Rename, show, reorder, duplicate, or remove sections.</p>
        <div className={styles.rows}>
          {orderedSections.map(([key, section], index) => (
            <div key={key} className={styles.row}>
              <input
                aria-label={`Rename ${section.sectionTitle}`}
                value={section.sectionTitle}
                onChange={(event) => updateResumeSection(key, { sectionTitle: event.target.value })}
              />
              <div className={styles.actions}>
                <button type="button" onClick={() => moveSection(key, -1)} disabled={index === 0} aria-label={`Move ${section.sectionTitle} up`}><ArrowUp /></button>
                <button type="button" onClick={() => moveSection(key, 1)} disabled={index === orderedSections.length - 1} aria-label={`Move ${section.sectionTitle} down`}><ArrowDown /></button>
                <button type="button" onClick={() => setSectionVisibility(key, !section.visible)} aria-label={`${section.visible ? "Hide" : "Show"} ${section.sectionTitle}`}>{section.visible ? <Eye /> : <EyeOff />}</button>
                <button type="button" onClick={() => duplicateSection(key)} aria-label={`Duplicate ${section.sectionTitle}`}><Copy /></button>
                <button type="button" onClick={() => deleteSection(key)} aria-label={`Delete ${section.sectionTitle}`}><Trash2 /></button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.addCustom}>
          <label htmlFor="custom-section-title">Add a custom section</label>
          <div>
            <input id="custom-section-title" value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Section title" />
            <button type="button" onClick={() => addCustom("text")}><Plus /> Text</button>
            <button type="button" onClick={() => addCustom("list")}><Plus /> List</button>
          </div>
        </div>

        {deletedSections.length ? (
          <div className={styles.deleted}>
            <p>Removed sections</p>
            <div>
              {deletedSections.map(([key, section]) => (
                <button type="button" key={key} onClick={() => restoreSection(key)}><Plus /> Restore {section.sectionTitle}</button>
              ))}
            </div>
          </div>
        ) : null}
        </div>
      </section>
    </div>
  );
};

export default SectionManager;
