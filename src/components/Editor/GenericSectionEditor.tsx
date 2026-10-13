import React, { FC } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "react-feather";

import { useResumeStore } from "../../store";
import styles from "./GenericSectionEditor.module.css";

interface GenericSectionEditorProps { sectionKey: string; }

const GenericSectionEditor: FC<GenericSectionEditorProps> = ({ sectionKey }) => {
  const {
    document, updateResumeSection, addPoint, updatePoint, movePoint, duplicatePoint, deletePoint,
  } = useResumeStore();
  const section = document.resumeInformation[sectionKey];

  if (section.kind === "text") {
    return <label className={styles.textEditor}><span>Section content</span><textarea value={String(section.detail ?? "")} onChange={(event) => updateResumeSection(sectionKey, { detail: event.target.value })} placeholder="Add section content..." /></label>;
  }

  const points = section.points ?? [];
  return <div className={styles.listEditor}>
    <div className={styles.listHeading}><span>List items</span><button type="button" onClick={() => addPoint(sectionKey)}><Plus /> Add item</button></div>
    {points.length ? points.map((point, index) => <div className={styles.pointRow} key={`${sectionKey}-${index}`}>
      <input aria-label={`${section.sectionTitle} item ${index + 1}`} value={point} onChange={(event) => updatePoint(sectionKey, index, event.target.value)} placeholder={`Item ${index + 1}`} />
      <div>
        <button type="button" disabled={index === 0} onClick={() => movePoint(sectionKey, index, -1)} aria-label={`Move item ${index + 1} up`}><ArrowUp /></button>
        <button type="button" disabled={index === points.length - 1} onClick={() => movePoint(sectionKey, index, 1)} aria-label={`Move item ${index + 1} down`}><ArrowDown /></button>
        <button type="button" onClick={() => duplicatePoint(sectionKey, index)} aria-label={`Duplicate item ${index + 1}`}><Copy /></button>
        <button type="button" onClick={() => deletePoint(sectionKey, index)} aria-label={`Delete item ${index + 1}`}><Trash2 /></button>
      </div>
    </div>) : <p className={styles.empty}>No items yet. Add the first one.</p>}
  </div>;
};

export default GenericSectionEditor;
