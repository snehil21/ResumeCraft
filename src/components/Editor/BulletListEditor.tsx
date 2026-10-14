import React, { FC } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "react-feather";
import styles from "./GenericSectionEditor.module.css";

interface BulletListEditorProps { points: string[]; onChange: (points: string[]) => void; label: string; }

const BulletListEditor: FC<BulletListEditorProps> = ({ points, onChange, label }) => {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= points.length) return;
    const next = [...points];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return <div className={styles.listEditor}>
    <div className={styles.listHeading}><span>{label}</span><button type="button" onClick={() => onChange([...points, ""])}><Plus /> Add bullet</button></div>
    {points.map((point, index) => <div className={styles.pointRow} key={index}>
      <input value={point} onChange={(event) => { const next = [...points]; next[index] = event.target.value; onChange(next); }} placeholder={`Bullet ${index + 1}`} />
      <div>
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move bullet ${index + 1} up`}><ArrowUp /></button>
        <button type="button" disabled={index === points.length - 1} onClick={() => move(index, 1)} aria-label={`Move bullet ${index + 1} down`}><ArrowDown /></button>
        <button type="button" onClick={() => { const next = [...points]; next.splice(index + 1, 0, point); onChange(next); }} aria-label={`Duplicate bullet ${index + 1}`}><Copy /></button>
        <button type="button" onClick={() => onChange(points.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Delete bullet ${index + 1}`}><Trash2 /></button>
      </div>
    </div>)}
  </div>;
};

export default BulletListEditor;
