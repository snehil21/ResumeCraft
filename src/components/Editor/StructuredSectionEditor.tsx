import React, { FC } from "react";

import { SECTIONS } from "../../constants";
import { FormValues } from "../../types";
import InputControl from "../InputControl/InputControl";
import BulletListEditor from "./BulletListEditor";
import MonthYearControl from "./MonthYearControl";
import styles from "./Editor.module.css";

interface StructuredSectionEditorProps {
  sectionKey: string;
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const StructuredSectionEditor: FC<StructuredSectionEditorProps> = ({ sectionKey, values, setValues }) => {
  const update = (field: keyof FormValues, value: string | boolean | string[]) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  const datePair = (
    startLabel: string,
    endLabel?: string,
    currentLabel?: string
  ) => (
    <>
      <div className={styles.row}>
        <MonthYearControl label={startLabel} value={values.startDate || ""} onChange={(value) => update("startDate", value)} />
        {endLabel ? <MonthYearControl label={endLabel} disabled={Boolean(values.currentRole)} value={values.endDate || ""} onChange={(value) => update("endDate", value)} /> : null}
      </div>
      {currentLabel ? <label className={styles.currentRole}>
        <input type="checkbox" checked={Boolean(values.currentRole)} onChange={(event) => {
          setValues((previous) => ({
            ...previous,
            currentRole: event.target.checked,
            endDate: event.target.checked ? "" : previous.endDate,
          }));
        }} />
        {currentLabel}
      </label> : null}
    </>
  );

  const description = (label = "Description") => (
    <BulletListEditor label={label} points={values.points || []} onChange={(points) => update("points", points)} />
  );

  if (sectionKey === SECTIONS.skills) {
    return <div className={styles.detail}>
      <InputControl label="Skill category" value={values.title || ""} placeholder="e.g. Backend, Cloud, Developer tools" onChange={(event) => update("title", event.target.value)} />
      <InputControl label="Skills" value={values.subtitle || ""} placeholder="e.g. Java, Spring Boot, PostgreSQL" onChange={(event) => update("subtitle", event.target.value)} />
    </div>;
  }

  if (sectionKey === SECTIONS.certifications) {
    return <div className={styles.detail}>
      <InputControl label="Certification name" value={values.title || ""} placeholder="e.g. AWS Certified Solutions Architect" onChange={(event) => update("title", event.target.value)} />
      <div className={styles.row}>
        <InputControl label="Issuing organization" value={values.issuer || ""} placeholder="e.g. Amazon Web Services" onChange={(event) => update("issuer", event.target.value)} />
        <InputControl label="Credential ID" value={values.credentialId || ""} placeholder="Optional credential ID" onChange={(event) => update("credentialId", event.target.value)} />
      </div>
      <InputControl label="Certificate URL" type="url" value={values.website || ""} placeholder="https://..." onChange={(event) => update("website", event.target.value)} />
      {datePair("Valid from", "Valid until", "This certification does not expire")}
      {description("Credential highlights")}
    </div>;
  }

  if (sectionKey === SECTIONS.languages) {
    return <div className={styles.detail}>
      <InputControl label="Language" value={values.title || ""} placeholder="e.g. English" onChange={(event) => update("title", event.target.value)} />
      <label className={styles.selectControl}>
        <span>Proficiency</span>
        <select value={values.proficiency || ""} onChange={(event) => update("proficiency", event.target.value)}>
          <option value="">Select proficiency</option>
          <option>Native or bilingual</option>
          <option>Full professional</option>
          <option>Professional working</option>
          <option>Limited working</option>
          <option>Elementary</option>
        </select>
      </label>
    </div>;
  }

  if (sectionKey === SECTIONS.volunteering) {
    return <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl label="Role" value={values.title || ""} placeholder="e.g. Volunteer mentor" onChange={(event) => update("title", event.target.value)} />
        <InputControl label="Organization" value={values.organization || ""} placeholder="Organization name" onChange={(event) => update("organization", event.target.value)} />
      </div>
      <div className={styles.row}>
        <InputControl label="Location" value={values.location || ""} placeholder="City, Country or Remote" onChange={(event) => update("location", event.target.value)} />
        <InputControl label="Organization URL" type="url" value={values.website || ""} placeholder="https://..." onChange={(event) => update("website", event.target.value)} />
      </div>
      {datePair("Start date", "End date", "I currently volunteer here")}
      {description("Responsibilities and impact")}
    </div>;
  }

  const isPublication = sectionKey === SECTIONS.publications;
  const isCourse = sectionKey === SECTIONS.courses;
  const isAward = sectionKey === SECTIONS.awards;
  const titleLabel = isPublication ? "Publication title" : isCourse ? "Course name" : isAward ? "Award name" : "Achievement title";
  const secondaryLabel = isPublication ? "Publisher" : isCourse ? "Course provider" : "Issuer or organization";
  const secondaryField: keyof FormValues = isPublication ? "publisher" : isCourse ? "provider" : "issuer";
  const dateLabel = isPublication ? "Publication date" : isCourse ? "Completion date" : isAward ? "Awarded date" : "Date";
  const linkLabel = isCourse ? "Certificate URL" : isPublication ? "Publication URL" : "Supporting URL";

  return <div className={styles.detail}>
    <InputControl label={titleLabel} value={values.title || ""} placeholder={`Enter ${titleLabel.toLowerCase()}`} onChange={(event) => update("title", event.target.value)} />
    <InputControl label={secondaryLabel} value={String(values[secondaryField] || "")} placeholder={`Enter ${secondaryLabel.toLowerCase()}`} onChange={(event) => update(secondaryField, event.target.value)} />
    <div className={styles.row}>
      <MonthYearControl label={dateLabel} value={values.startDate || ""} onChange={(value) => update("startDate", value)} />
      <InputControl label={linkLabel} type="url" value={values.website || ""} placeholder="https://..." onChange={(event) => update("website", event.target.value)} />
    </div>
    {description(isPublication ? "Summary" : isCourse ? "Learning outcomes" : "Description and impact")}
  </div>;
};

export default StructuredSectionEditor;
