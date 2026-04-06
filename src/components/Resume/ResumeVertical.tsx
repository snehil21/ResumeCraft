import React, {
  FC,
  forwardRef,
  useEffect,
  useRef,
  Ref,
  ReactNode,
} from "react";
import {
  AtSign,
  Calendar,
  GitHub,
  Linkedin,
  MapPin,
  Paperclip,
  Phone,
  Mail,
} from "react-feather";

import styles from "./ResumeVertical.module.css";
import { ResumeInformation } from "../../types";
import { SECTIONS } from "../../constants";

interface ResumeVerticalProps {
  sections: { [key: string]: string };
  information: ResumeInformation;
  activeColor: string;
}

interface SectionInfo {
  [key: string]: ReactNode;
}

const ResumeVertical = forwardRef<HTMLDivElement, ResumeVerticalProps>(
  ({ information, sections, activeColor }, ref: Ref<HTMLDivElement>) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const info = {
      workExp: information[SECTIONS.workExp],
      project: information[SECTIONS.project],
      achievement: information[SECTIONS.achievement],
      education: information[SECTIONS.education],
      basicInfo: information[SECTIONS.basicInfo],
      summary: information[SECTIONS.summary],
      other: information[SECTIONS.other],
    };

    const getFormattedDate = (value: string): string => {
      if (!value) return "";
      const date = new Date(value);
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const sectionDiv: SectionInfo = {
      [SECTIONS.workExp]: (
        <div
          key={"workexp"}
          className={`${styles.section} ${
            info.workExp?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>{info.workExp?.sectionTitle}</h2>
          <div className={styles.content}>
            {(info.workExp?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.title}>
                <div className={styles.itemHeader}>
                  {item.title ? (
                    <p className={styles.title}>{item.title}</p>
                  ) : (
                    <span />
                  )}
                  {item.startDate && item.endDate ? (
                    <span className={styles.date}>
                      {getFormattedDate(item.startDate)} -{" "}
                      {getFormattedDate(item.endDate)}
                    </span>
                  ) : null}
                </div>
                {item.companyName ? (
                  <p className={styles.company}>{item.companyName}</p>
                ) : (
                  <span />
                )}
                {item.location ? (
                  <p className={styles.location}>
                    <MapPin size={14} /> {item.location}
                  </p>
                ) : (
                  <span />
                )}
                {item.points?.length > 0 ? (
                  <ul className={styles.points}>
                    {item.points?.map((elem: string, index: number) => (
                      <li key={elem + index}>{elem}</li>
                    ))}
                  </ul>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
      [SECTIONS.project]: (
        <div
          key={"project"}
          className={`${styles.section} ${
            info.project?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>{info.project?.sectionTitle}</h2>
          <div className={styles.content}>
            {(info.project?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.title}>
                <div className={styles.itemHeader}>
                  {item.title ? (
                    <p className={styles.title}>{item.title}</p>
                  ) : (
                    <span />
                  )}
                </div>
                {item.link ? (
                  <a className={styles.link} href={item.link} target="_blank" rel="noopener noreferrer">
                    <Paperclip size={14} />
                    {item.link}
                  </a>
                ) : (
                  <span />
                )}
                {item.github ? (
                  <a className={styles.link} href={item.github} target="_blank" rel="noopener noreferrer">
                    <GitHub size={14} />
                    {item.github}
                  </a>
                ) : (
                  <span />
                )}
                {item.points?.length > 0 ? (
                  <ul className={styles.points}>
                    {item.points?.map((elem: string, index: number) => (
                      <li key={elem + index}>{elem}</li>
                    ))}
                  </ul>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
      [SECTIONS.education]: (
        <div
          key={"education"}
          className={`${styles.section} ${
            info.education?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>{info.education?.sectionTitle}</h2>
          <div className={styles.content}>
            {(info.education?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.college}>
                <div className={styles.itemHeader}>
                  {item.title ? (
                    <p className={styles.title}>{item.title}</p>
                  ) : (
                    <span />
                  )}
                  {item.startDate && item.endDate ? (
                    <span className={styles.date}>
                      {getFormattedDate(item.startDate)} -{" "}
                      {getFormattedDate(item.endDate)}
                    </span>
                  ) : null}
                </div>
                {item.college ? (
                  <p className={styles.college}>{item.college}</p>
                ) : (
                  <span />
                )}
              </div>
            ))}
          </div>
        </div>
      ),
      [SECTIONS.achievement]: (
        <div
          key={"achievement"}
          className={`${styles.section} ${
            info.achievement?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>
            {info.achievement?.sectionTitle}
          </h2>
          <div className={styles.content}>
            {(info.achievement?.points as any)?.length > 0 ? (
              <ul className={styles.points}>
                {(info.achievement?.points as any)?.map(
                  (elem: string, index: number) => (
                    <li key={elem + index}>{elem}</li>
                  )
                )}
              </ul>
            ) : (
              <span />
            )}
          </div>
        </div>
      ),
      [SECTIONS.summary]: (
        <div
          key={"summary"}
          className={`${styles.section} ${
            (info.summary?.detail as string) ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>{info.summary?.sectionTitle}</h2>
          <p className={styles.summaryText}>{info.summary?.detail as string}</p>
        </div>
      ),
      [SECTIONS.other]: (
        <div
          key={"other"}
          className={`${styles.section} ${
            (info.other?.detail as string) ? "" : styles.hidden
          }`}
        >
          <h2 className={styles.sectionTitle}>{info.other?.sectionTitle}</h2>
          <p className={styles.otherText}>{info.other?.detail as string}</p>
        </div>
      ),
    };

    useEffect(() => {
      const container = containerRef.current;
      if (!activeColor || !container) return;

      container.style.setProperty("--color", activeColor);
    }, [activeColor]);

    // Check if resume has any user data
    const hasUserData = (basicInfo: any) => {
      return basicInfo?.detail?.name && basicInfo.detail.name !== "John Doe";
    };

    return (
      <div ref={ref}>
        <div ref={containerRef} className={styles.container}>
          {!hasUserData(info.basicInfo) && (
            <div className={styles.placeholderMessage}>
              📝 Put Your Details in Resume Builder
            </div>
          )}
          <div className={styles.header}>
            <p className={styles.heading}>
              {(info.basicInfo?.detail as any)?.name}
            </p>
            <p className={styles.subHeading}>
              {(info.basicInfo?.detail as any)?.title}
            </p>

            <div className={styles.links}>
              {(info.basicInfo?.detail as any)?.email ? (
                <a className={styles.link} href={`mailto:${(info.basicInfo?.detail as any)?.email}`}>
                  <Mail size={14} /> {(info.basicInfo?.detail as any)?.email}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.phone ? (
                <a className={styles.link} href={`tel:${(info.basicInfo?.detail as any)?.phone}`}>
                  <Phone size={14} /> {(info.basicInfo?.detail as any)?.phone}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.linkedin ? (
                <a className={styles.link} href={(info.basicInfo?.detail as any)?.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={14} /> {(info.basicInfo?.detail as any)?.linkedin}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.github ? (
                <a className={styles.link} href={(info.basicInfo?.detail as any)?.github} target="_blank" rel="noopener noreferrer">
                  <GitHub size={14} /> {(info.basicInfo?.detail as any)?.github}
                </a>
              ) : (
                <span />
              )}
            </div>
          </div>

          <div className={styles.main}>
            {[SECTIONS.summary, SECTIONS.workExp, SECTIONS.education, SECTIONS.project, SECTIONS.achievement, SECTIONS.other].map(
              (section) => sectionDiv[section]
            )}
          </div>
        </div>
      </div>
    );
  }
);

ResumeVertical.displayName = "ResumeVertical";

export default ResumeVertical;
