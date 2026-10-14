import React, { CSSProperties, forwardRef, ReactNode, Ref } from "react";
import { Calendar, GitHub, Linkedin, Mail, MapPin, Paperclip, Phone } from "react-feather";

import { SECTIONS, getTemplateOption } from "../../constants";
import { BasicDetail, ResumeDocument, Section } from "../../types";
import { formatResumeDate } from "../../utils/formatResumeDate";
import styles from "./ResumeRenderer.module.css";

interface ResumeRendererProps { document: ResumeDocument; }

const externalHref = (value: string): string =>
  /^(https?:\/\/|mailto:|tel:)/i.test(value) ? value : `https://${value}`;

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
  ({ document }, ref: Ref<HTMLDivElement>) => {
    const { resumeInformation, layout, theme, page, template } = document;
    const basic = (resumeInformation[SECTIONS.basicInfo]?.detail ?? {}) as BasicDetail;
    const templateOption = getTemplateOption(template);
    const useColumns = templateOption.supportsColumns && layout.mode === "two";
    const date = (value?: string) => formatResumeDate(value, theme.dateFormat);

    const dateRange = (item: any): ReactNode => {
      if (!item.startDate && !item.endDate && !item.currentRole) return null;
      const start = date(item.startDate);
      const end = item.currentRole ? "Present" : date(item.endDate);
      return <span className={styles.date}><Calendar /> {[start, end].filter(Boolean).join(" – ")}</span>;
    };

    const points = (values?: string[]): ReactNode => {
      const nonEmpty = values?.filter((value) => value.trim()) ?? [];
      return nonEmpty.length ? <ul className={styles.points}>{nonEmpty.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul> : null;
    };

    const renderEntry = (item: any): ReactNode => {
      const subtitle = item.companyName || item.college || item.subtitle;
      return <article className={styles.item} key={item.id}>
        <div className={styles.itemHeader}>
          <p className={styles.itemTitle}>{item.title}</p>
          {dateRange(item)}
        </div>
        {subtitle ? <p className={styles.itemSubtitle}>{subtitle}</p> : null}
        {item.grade ? <p className={styles.meta}>{item.grade}</p> : null}
        {item.location ? <p className={styles.meta}><MapPin /> {item.location}</p> : null}
        {item.overview ? <p className={styles.paragraph}>{item.overview}</p> : null}
        <div className={styles.entryLinks}>
          {item.link ? <a href={externalHref(item.link)}><Paperclip /> {item.link}</a> : null}
          {item.github ? <a href={externalHref(item.github)}><GitHub /> {item.github}</a> : null}
          {item.certificationLink ? <a href={externalHref(item.certificationLink)}><Paperclip /> {item.certificationLink}</a> : null}
          {item.website ? <a href={externalHref(item.website)}><Paperclip /> {item.website}</a> : null}
        </div>
        {points(item.points)}
      </article>;
    };

    const renderSection = (sectionKey: string): ReactNode => {
      const section = resumeInformation[sectionKey];
      if (!section || !section.visible || section.deleted || !section.sectionTitle) return null;
      return <section className={styles.section} key={sectionKey} data-section-key={sectionKey}>
        <h2 className={styles.sectionTitle}>{section.sectionTitle}</h2>
        <div className={styles.sectionContent}>
          {typeof section.detail === "string" && section.detail.trim()
            ? <p className={styles.paragraph}>{section.detail}</p>
            : null}
          {section.details?.map((item) => renderEntry(item))}
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
    } as CSSProperties;

    const contactItems = [
      basic.email ? <a key="email" href={`mailto:${basic.email}`}><Mail /> {basic.email}</a> : null,
      basic.phone ? <a key="phone" href={`tel:${basic.phone}`}><Phone /> {basic.phone}</a> : null,
      basic.location ? <span key="location"><MapPin /> {basic.location}</span> : null,
      basic.linkedin ? <a key="linkedin" href={externalHref(basic.linkedin)}><Linkedin /> {basic.linkedin}</a> : null,
      basic.github ? <a key="github" href={externalHref(basic.github)}><GitHub /> {basic.github}</a> : null,
      basic.website ? <a key="website" href={externalHref(basic.website)}><Paperclip /> {basic.website}</a> : null,
    ].filter(Boolean);

    const hasContent = Object.values(resumeInformation).some(hasSectionContent);
    const templateClass = template === "vertical"
      ? styles.atsClassic
      : template === "compact"
        ? styles.compactTechnical
        : styles.modernSplit;

    return <div ref={ref}>
      <div
        className={`${styles.sheet} ${templateClass}`}
        style={sheetStyle}
        data-document-id={document.id}
        data-schema-version={document.schemaVersion}
        data-page-size={page.size}
        data-template={template}
      >
        {!hasContent ? <div className={styles.placeholder}>Add your details to start building the resume preview.</div> : null}
        <header className={styles.header}>
          <div className={styles.identity}>
            <h1>{basic.name}</h1>
            {basic.title ? <p>{basic.title}</p> : null}
          </div>
          {contactItems.length ? <div className={styles.contacts}>{contactItems}</div> : null}
        </header>

        {useColumns ? <main className={styles.columns}>
          <div className={styles.column}>{layout.columns[0].map(renderSection)}</div>
          <div className={styles.column}>{layout.columns[1].map(renderSection)}</div>
        </main> : <main className={styles.sections}>{layout.sectionOrder.map(renderSection)}</main>}
      </div>
    </div>;
  }
);

ResumeRenderer.displayName = "ResumeRenderer";

export default ResumeRenderer;
