import React, { CSSProperties, forwardRef, ReactNode, Ref } from "react";
import { Calendar, GitHub, Linkedin, Mail, MapPin, Paperclip, Phone } from "react-feather";

import { SECTIONS, getTemplateOption } from "../../constants";
import { BasicDetail, ResumeDocument, Section } from "../../types";
import { formatResumeDate } from "../../utils/formatResumeDate";
import { getEmailHref, getExternalHref, getPhoneHref } from "../../utils/resumeExport";
import type { PaginationBreakMap } from "../../utils/resumePagination";
import MultiColumnResume from "./MultiColumnResume";
import styles from "./ResumeRenderer.module.css";
import SingleColumnResume from "./SingleColumnResume";

interface ResumeRendererProps {
  document: ResumeDocument;
  paginationBreaks?: PaginationBreakMap;
  multiColumnPageIndex?: number;
  multiColumnFlowHeight?: number;
}

const hasSectionContent = (section: Section): boolean => {
  if (typeof section.detail === "string") return Boolean(section.detail.trim());
  if (section.detail && typeof section.detail === "object") {
    return Object.values(section.detail).some((value) => String(value ?? "").trim());
  }
  if (section.points?.some((point) => point.trim())) return true;
  return Boolean(section.details?.some((detail) =>
    Object.entries(detail).some(([key, value]) => key !== "id" && String(value ?? "").trim())
  ));
};

const ResumeRenderer = forwardRef<HTMLDivElement, ResumeRendererProps>(
  ({
    document,
    paginationBreaks = {},
    multiColumnPageIndex = 0,
    multiColumnFlowHeight,
  }, ref: Ref<HTMLDivElement>) => {
    const { resumeInformation, layout, theme, page, template } = document;
    const basic = (resumeInformation[SECTIONS.basicInfo]?.detail ?? {}) as BasicDetail;
    const templateOption = getTemplateOption(template);
    const useColumns = templateOption.supportsColumns && layout.mode === "two";
    const date = (value?: string) => formatResumeDate(value, theme.dateFormat);

    const dateRange = (item: any, sectionKey?: string): ReactNode => {
      if (!item.startDate && !item.endDate && !item.currentRole) return null;
      const start = date(item.startDate);
      const end = item.currentRole
        ? sectionKey === SECTIONS.certifications ? "No expiration" : "Present"
        : date(item.endDate);
      return <span className={styles.date}><Calendar /> {[start, end].filter(Boolean).join(" – ")}</span>;
    };

    const points = (values?: string[]): ReactNode => {
      const nonEmpty = values?.filter((value) => value.trim()) ?? [];
      return nonEmpty.length ? <ul className={styles.points}>{nonEmpty.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul> : null;
    };

    const renderEntry = (item: any, sectionKey: string, sectionTitle: string): ReactNode => {
      const subtitle = item.companyName || item.college || item.subtitle || item.issuer || item.organization || item.publisher || item.provider;
      const breakId = `entry:${sectionKey}:${item.id}`;
      const paginationBreak = paginationBreaks[breakId];
      return <article
        className={styles.item}
        key={item.id}
        data-entry-id={item.id}
        data-pagination-break-id={breakId}
        style={paginationBreak ? { marginTop: `${paginationBreak.space}px` } : undefined}
      >
        {paginationBreak?.continuationTitle ? (
          <h2 className={`${styles.sectionTitle} ${styles.continuationTitle}`}>
            {paginationBreak.continuationTitle || sectionTitle} <span>continued</span>
          </h2>
        ) : null}
        <div className={styles.itemHeader}>
          <p className={styles.itemTitle}>{item.title}</p>
          {dateRange(item, sectionKey)}
          {subtitle ? <p className={styles.itemSubtitle}>{subtitle}</p> : null}
          {item.location ? <p className={`${styles.meta} ${styles.itemLocation}`}><MapPin /> {item.location}</p> : null}
        </div>
        {item.grade ? <p className={styles.meta}>{item.grade}</p> : null}
        {item.fieldOfStudy ? <p className={styles.meta}>{item.fieldOfStudy}</p> : null}
        {item.employmentType ? <p className={styles.meta}>{item.employmentType}</p> : null}
        {item.proficiency ? <p className={styles.meta}>{item.proficiency}</p> : null}
        {item.credentialId ? <p className={styles.meta}>Credential ID: {item.credentialId}</p> : null}
        {item.overview ? <p className={styles.paragraph}>{item.overview}</p> : null}
        <div className={styles.entryLinks}>
          {item.link ? <a href={getExternalHref(item.link)}><Paperclip /> {item.link}</a> : null}
          {item.github ? <a href={getExternalHref(item.github)}><GitHub /> {item.github}</a> : null}
          {item.certificationLink ? <a href={getExternalHref(item.certificationLink)}><Paperclip /> {item.certificationLink}</a> : null}
          {item.website ? <a href={getExternalHref(item.website)}><Paperclip /> {item.website}</a> : null}
        </div>
        {points(item.points)}
      </article>;
    };

    const renderSection = (sectionKey: string): ReactNode => {
      const section = resumeInformation[sectionKey];
      if (!section || !section.visible || section.deleted || !section.sectionTitle) return null;
      const breakId = `section:${sectionKey}`;
      const paginationBreak = paginationBreaks[breakId];
      return <section
        className={styles.section}
        key={sectionKey}
        data-section-key={sectionKey}
        data-pagination-break-id={breakId}
        style={paginationBreak ? { marginTop: `${paginationBreak.space}px` } : undefined}
      >
        <h2 className={styles.sectionTitle}>{section.sectionTitle}</h2>
        <div className={styles.sectionContent}>
          {typeof section.detail === "string" && section.detail.trim()
            ? <p className={styles.paragraph}>{section.detail}</p>
            : null}
          {section.details?.map((item) => renderEntry(item, sectionKey, section.sectionTitle))}
          {points(section.points)}
        </div>
      </section>;
    };

    const sheetStyle = {
      "--accent": theme.accentColor,
      "--resume-font": theme.fontFamily,
      "--body-size": `${theme.baseFontSize}px`,
      "--line-height": theme.lineHeight,
      "--text-color": theme.textColor,
      "--page-margin": `${page.margin}px`,
      "--name-size": `${theme.nameFontSize}px`,
      "--heading-size": `${theme.headingFontSize}px`,
      "--section-gap": `${theme.sectionGap}px`,
      "--item-gap": `${theme.itemGap}px`,
      "--page-width": page.size === "A4" ? "210mm" : "8.5in",
      "--page-height": page.size === "A4" ? "297mm" : "11in",
      "--left-column": layout.columnRatio,
      "--right-column": 100 - layout.columnRatio,
      "--multi-flow-height": multiColumnFlowHeight ? `${multiColumnFlowHeight}px` : undefined,
    } as CSSProperties;

    const contactItems = [
      basic.email ? <a key="email" href={getEmailHref(basic.email)}><Mail /> {basic.email}</a> : null,
      basic.phone ? <a key="phone" href={getPhoneHref(basic.phone)}><Phone /> {basic.phone}</a> : null,
      basic.location ? <span key="location"><MapPin /> {basic.location}</span> : null,
      basic.linkedin ? <a key="linkedin" href={getExternalHref(basic.linkedin)}><Linkedin /> {basic.linkedin}</a> : null,
      basic.github ? <a key="github" href={getExternalHref(basic.github)}><GitHub /> {basic.github}</a> : null,
      basic.website ? <a key="website" href={getExternalHref(basic.website)}><Paperclip /> {basic.website}</a> : null,
    ].filter(Boolean);

    const hasContent = Object.values(resumeInformation).some(hasSectionContent);
    const templateClass = template === "vertical"
      ? styles.atsClassic
      : template === "compact"
        ? styles.compactTechnical
        : styles.modernSplit;

    return <div ref={ref} data-resume-root>
      <div
        className={`${styles.sheet} ${templateClass} ${useColumns ? styles.multiColumnSheet : ""} ${useColumns && multiColumnPageIndex > 0 ? styles.multiColumnContinuation : ""}`}
        style={sheetStyle}
        data-document-id={document.id}
        data-schema-version={document.schemaVersion}
        data-page-size={page.size}
        data-template={template}
        data-resume-sheet
      >
        {!hasContent ? <div className={styles.placeholder}>Add your details to start building the resume preview.</div> : null}
        {!useColumns || multiColumnPageIndex === 0 ? (
          <header className={styles.header}>
            <div className={styles.identity}>
              <h1>{basic.name}</h1>
              {basic.title ? <p>{basic.title}</p> : null}
            </div>
            {contactItems.length ? <div className={styles.contacts}>{contactItems}</div> : null}
          </header>
        ) : null}

        {useColumns
          ? <MultiColumnResume
            sectionOrder={layout.sectionOrder}
            pageIndex={multiColumnPageIndex}
            renderSection={renderSection}
          />
          : <SingleColumnResume sectionOrder={layout.sectionOrder} renderSection={renderSection} />}
      </div>
    </div>;
  }
);

ResumeRenderer.displayName = "ResumeRenderer";

export default ResumeRenderer;
