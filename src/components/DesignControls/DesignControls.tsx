import React, { FC } from "react";
import { Columns, RefreshCw, Square } from "react-feather";

import { COLORS, DESIGN_LIMITS, FONT_OPTIONS } from "../../constants";
import { useResumeStore } from "../../store";
import { DateFormat, DesignPreset, LayoutMode, PageSize } from "../../types";
import styles from "./DesignControls.module.css";

interface RangeControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const RangeControl: FC<RangeControlProps> = ({
  label, value, min, max, step, suffix = "", onChange, disabled,
}) => (
  <label className={`${styles.rangeControl} ${disabled ? styles.disabled : ""}`}>
    <span><strong>{label}</strong><output>{value}{suffix}</output></span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <small>{min}{suffix}<span>{max}{suffix}</span></small>
  </label>
);

const DesignControls: FC = () => {
  const {
    document, setTemplate, updateTheme, updatePageSettings, setLayoutMode,
    setColumnRatio, applyDesignPreset, resetTemplateDefaults,
  } = useResumeStore();
  const { template, theme, page, layout } = document;

  const templateChoices = [
    { id: "classic" as const, title: "Classic split", note: "One or two columns" },
    { id: "vertical" as const, title: "Clean vertical", note: "Focused single column" },
  ];

  return <div className={styles.controls}>
    <section className={styles.card}>
      <div className={styles.cardHeader}><div><h3>Style preset</h3><p>Start with a safe density, then fine-tune below.</p></div><button type="button" className={styles.reset} onClick={resetTemplateDefaults}><RefreshCw /> Reset template defaults</button></div>
      <div className={styles.segmented} role="group" aria-label="Design density preset">
        {(["compact", "balanced", "spacious"] as DesignPreset[]).map((preset) => <button type="button" key={preset} onClick={() => applyDesignPreset(preset)}>{preset}</button>)}
      </div>
    </section>

    <section className={styles.card}>
      <div><h3>Template and columns</h3><p>Choose a layout that keeps your content easy to scan.</p></div>
      <div className={styles.templateGrid}>
        {templateChoices.map((choice) => <button type="button" key={choice.id} className={template === choice.id ? styles.selected : ""} onClick={() => setTemplate(choice.id)} aria-pressed={template === choice.id}><Columns /><span><strong>{choice.title}</strong><small>{choice.note}</small></span></button>)}
      </div>
      {template === "classic" ? <>
        <div className={styles.segmented} role="group" aria-label="Column layout">
          {(["one", "two"] as LayoutMode[]).map((mode) => <button type="button" key={mode} className={layout.mode === mode ? styles.selectedSegment : ""} onClick={() => setLayoutMode(mode)} aria-pressed={layout.mode === mode}><Square /> {mode === "one" ? "One column" : "Two columns"}</button>)}
        </div>
        <RangeControl label="Left column width" value={layout.columnRatio} {...DESIGN_LIMITS.columnRatio} suffix="%" disabled={layout.mode !== "two"} onChange={setColumnRatio} />
      </> : <p className={styles.inlineNote}>Clean vertical uses a single-column layout.</p>}
    </section>

    <section className={styles.card}>
      <div><h3>Typography</h3><p>Sizes stay inside readable limits for screen and print.</p></div>
      <label className={styles.selectControl}><span>Font family</span><select value={theme.fontFamily} onChange={(event) => updateTheme({ fontFamily: event.target.value })}>{FONT_OPTIONS.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}</select></label>
      <div className={styles.rangeGrid}>
        <RangeControl label="Body text" value={theme.baseFontSize} {...DESIGN_LIMITS.baseFontSize} suffix="px" onChange={(baseFontSize) => updateTheme({ baseFontSize })} />
        <RangeControl label="Name" value={theme.nameFontSize} {...DESIGN_LIMITS.nameFontSize} suffix="px" onChange={(nameFontSize) => updateTheme({ nameFontSize })} />
        <RangeControl label="Section headings" value={theme.headingFontSize} {...DESIGN_LIMITS.headingFontSize} suffix="px" onChange={(headingFontSize) => updateTheme({ headingFontSize })} />
        <RangeControl label="Line height" value={theme.lineHeight} {...DESIGN_LIMITS.lineHeight} onChange={(lineHeight) => updateTheme({ lineHeight })} />
      </div>
      <label className={styles.selectControl}><span>Date format</span><select value={theme.dateFormat} onChange={(event) => updateTheme({ dateFormat: event.target.value as DateFormat })}><option value="MMM YYYY">Jan 2026</option><option value="MM/YYYY">01/2026</option><option value="YYYY">2026</option></select></label>
    </section>

    <section className={styles.card}>
      <div><h3>Color</h3><p>Use restrained contrast that remains legible when printed.</p></div>
      <div className={styles.colorFields}>
        <label><span>Accent</span><input type="color" value={theme.accentColor} onChange={(event) => updateTheme({ accentColor: event.target.value })} /><output>{theme.accentColor.toUpperCase()}</output></label>
        <label><span>Body text</span><input type="color" value={theme.textColor} onChange={(event) => updateTheme({ textColor: event.target.value })} /><output>{theme.textColor.toUpperCase()}</output></label>
      </div>
      <div className={styles.swatches} role="group" aria-label="Suggested accent colors">{COLORS.map((color) => <button key={color} type="button" style={{ backgroundColor: color }} className={theme.accentColor === color ? styles.activeSwatch : ""} onClick={() => updateTheme({ accentColor: color })} aria-label={`Use accent color ${color}`} aria-pressed={theme.accentColor === color} />)}</div>
    </section>

    <section className={styles.card}>
      <div><h3>Page and spacing</h3><p>Adjust whitespace without letting the resume become cramped or wasteful.</p></div>
      <div className={styles.segmented} role="group" aria-label="Page size">{(["A4", "LETTER"] as PageSize[]).map((size) => <button type="button" key={size} className={page.size === size ? styles.selectedSegment : ""} onClick={() => updatePageSettings({ size })} aria-pressed={page.size === size}>{size === "LETTER" ? "US Letter" : "A4"}</button>)}</div>
      <div className={styles.rangeGrid}>
        <RangeControl label="Page margins" value={page.margin} {...DESIGN_LIMITS.pageMargin} suffix="px" onChange={(margin) => updatePageSettings({ margin })} />
        <RangeControl label="Section spacing" value={theme.sectionGap} {...DESIGN_LIMITS.sectionGap} suffix="px" onChange={(sectionGap) => updateTheme({ sectionGap })} />
        <RangeControl label="Entry spacing" value={theme.itemGap} {...DESIGN_LIMITS.itemGap} suffix="px" onChange={(itemGap) => updateTheme({ itemGap })} />
      </div>
    </section>
  </div>;
};

export default DesignControls;
