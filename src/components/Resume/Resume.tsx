import React, {
  FC,
  forwardRef,
  useEffect,
  useRef,
  useState,
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

import styles from "./Resume.module.css";
import { ResumeInformation } from "../../types";
import { SECTIONS } from "../../constants";

interface ResumeProps {
  sections: { [key: string]: string };
  information: ResumeInformation;
  activeColor: string;
}

interface ColumnInfo {
  [key: string]: ReactNode;
}

const Resume = forwardRef<HTMLDivElement, ResumeProps>(
  ({ information, sections, activeColor }, ref: Ref<HTMLDivElement>) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [columns, setColumns] = useState<string[][]>([[], []]);
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");

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

      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const sectionDiv: ColumnInfo = {
      [SECTIONS.workExp]: (
        <div
          key={"workexp"}
          draggable
          onDragOver={() => setTarget(info.workExp?.id || "")}
          onDragEnd={() => setSource(info.workExp?.id || "")}
          className={`${styles.section} ${
            info.workExp?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>{info.workExp?.sectionTitle}</div>
          <div className={styles.content}>
            {(info.workExp?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.title}>
                {item.title ? (
                  <p className={styles.title}>{item.title}</p>
                ) : (
                  <span />
                )}
                {item.companyName ? (
                  <p className={styles.subTitle}>{item.companyName}</p>
                ) : (
                  <span />
                )}
                {item.certificationLink ? (
                  <a className={styles.link} href={item.certificationLink}>
                    <Paperclip />
                    {item.certificationLink}
                  </a>
                ) : (
                  <span />
                )}
                {item.startDate && item.endDate ? (
                  <div className={styles.date}>
                    <Calendar /> {getFormattedDate(item.startDate)}-
                    {getFormattedDate(item.endDate)}
                  </div>
                ) : (
                  <div />
                )}
                {item.location ? (
                  <p className={styles.date}>
                    <MapPin /> Remote
                  </p>
                ) : (
                  <span />
                )}
                {item.points?.length > 0 ? (
                  <ul className={styles.points}>
                    {item.points?.map((elem: string, index: number) => (
                      <li className={styles.point} key={elem + index}>
                        {elem}
                      </li>
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
          draggable
          onDragOver={() => setTarget(info.project?.id || "")}
          onDragEnd={() => setSource(info.project?.id || "")}
          className={`${styles.section} ${
            info.project?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>{info.project?.sectionTitle}</div>
          <div className={styles.content}>
            {(info.project?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.title}>
                {item.title ? (
                  <p className={styles.title}>{item.title}</p>
                ) : (
                  <span />
                )}
                {item.link ? (
                  <a className={styles.link} href={item.link}>
                    <Paperclip />
                    {item.link}
                  </a>
                ) : (
                  <span />
                )}
                {item.github ? (
                  <a className={styles.link} href={item.github}>
                    <GitHub />
                    {item.github}
                  </a>
                ) : (
                  <span />
                )}
                {item.overview ? (
                  <p className={styles.overview}>{item.overview} </p>
                ) : (
                  <span />
                )}
                {item.points?.length > 0 ? (
                  <ul className={styles.points}>
                    {item.points?.map((elem: string, index: number) => (
                      <li className={styles.point} key={elem + index}>
                        {elem}
                      </li>
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
          draggable
          onDragOver={() => setTarget(info.education?.id || "")}
          onDragEnd={() => setSource(info.education?.id || "")}
          className={`${styles.section} ${
            info.education?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>
            {info.education?.sectionTitle}
          </div>
          <div className={styles.content}>
            {(info.education?.details as any)?.map((item: any) => (
              <div className={styles.item} key={item.title}>
                {item.title ? (
                  <p className={styles.title}>{item.title}</p>
                ) : (
                  <span />
                )}
                {item.college ? (
                  <p className={styles.subTitle}>{item.college}</p>
                ) : (
                  <span />
                )}
                {item.startDate && item.endDate ? (
                  <div className={styles.date}>
                    <Calendar /> {getFormattedDate(item.startDate)} -
                    {getFormattedDate(item.endDate)}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
        </div>
      ),
      [SECTIONS.achievement]: (
        <div
          key={"achievement"}
          draggable
          onDragOver={() => setTarget(info.achievement?.id || "")}
          onDragEnd={() => setSource(info.achievement?.id || "")}
          className={`${styles.section} ${
            info.achievement?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>
            {info.achievement?.sectionTitle}
          </div>
          <div className={styles.content}>
            {(info.achievement?.points as any)?.length > 0 ? (
              <ul className={styles.numbered}>
                {(info.achievement?.points as any)?.map(
                  (elem: string, index: number) => (
                    <li className={styles.point} key={elem + index}>
                      {elem}
                    </li>
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
          draggable
          onDragOver={() => setTarget(info.summary?.id || "")}
          onDragEnd={() => setSource(info.summary?.id || "")}
          className={`${styles.section} ${
            info.summary?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>{info.summary?.sectionTitle}</div>
          <div className={styles.content}>
            <p className={styles.overview}>{info.summary?.detail as any}</p>
          </div>
        </div>
      ),
      [SECTIONS.other]: (
        <div
          key={"other"}
          draggable
          onDragOver={() => setTarget(info.other?.id || "")}
          onDragEnd={() => setSource(info.other?.id || "")}
          className={`${styles.section} ${
            info.other?.sectionTitle ? "" : styles.hidden
          }`}
        >
          <div className={styles.sectionTitle}>{info.other?.sectionTitle}</div>
          <div className={styles.content}>
            <p className={styles.overview}>{(info?.other as any)?.detail}</p>
          </div>
        </div>
      ),
    };

    const swapSourceTarget = (source: string, target: string) => {
      if (!source || !target) return;
      const tempColumns = [[...columns[0]], [...columns[1]]];

      let sourceRowIndex = tempColumns[0].findIndex((item) => item === source);
      let sourceColumnIndex = 0;
      if (sourceRowIndex < 0) {
        sourceColumnIndex = 1;
        sourceRowIndex = tempColumns[1].findIndex((item) => item === source);
      }

      let targetRowIndex = tempColumns[0].findIndex((item) => item === target);
      let targetColumnIndex = 0;
      if (targetRowIndex < 0) {
        targetColumnIndex = 1;
        targetRowIndex = tempColumns[1].findIndex((item) => item === target);
      }

      const tempSource = tempColumns[sourceColumnIndex][sourceRowIndex];
      tempColumns[sourceColumnIndex][sourceRowIndex] =
        tempColumns[targetColumnIndex][targetRowIndex];

      tempColumns[targetColumnIndex][targetRowIndex] = tempSource;

      setColumns(tempColumns);
    };

    useEffect(() => {
      setColumns([
        [SECTIONS.project, SECTIONS.education, SECTIONS.summary],
        [SECTIONS.workExp, SECTIONS.achievement, SECTIONS.other],
      ]);
    }, []);

    useEffect(() => {
      swapSourceTarget(source, target);
    }, [source]);

    useEffect(() => {
      const container = containerRef.current;
      if (!activeColor || !container) return;

      container.style.setProperty("--color", activeColor);
    }, [activeColor]);

    return (
      <div ref={ref}>
        <div ref={containerRef} className={styles.container}>
          <div className={styles.header}>
            <p className={styles.heading}>
              {(info.basicInfo?.detail as any)?.name}
            </p>
            <p className={styles.subHeading}>
              {(info.basicInfo?.detail as any)?.title}
            </p>

            <div className={styles.links}>
              {(info.basicInfo?.detail as any)?.email ? (
                <a className={styles.link} type="email">
                  <Mail /> {(info.basicInfo?.detail as any)?.email}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.phone ? (
                <a className={styles.link}>
                  <Phone /> {(info.basicInfo?.detail as any)?.phone}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.linkedin ? (
                <a className={styles.link}>
                  <Linkedin /> {(info.basicInfo?.detail as any)?.linkedin}
                </a>
              ) : (
                <span />
              )}
              {(info.basicInfo?.detail as any)?.github ? (
                <a className={styles.link}>
                  <GitHub /> {(info.basicInfo?.detail as any)?.github}
                </a>
              ) : (
                <span />
              )}
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.col1}>
              {columns[0].map((item) => {
                if (item === SECTIONS.workExp) return sectionDiv[SECTIONS.workExp];
                if (item === SECTIONS.project) return sectionDiv[SECTIONS.project];
                if (item === SECTIONS.education) return sectionDiv[SECTIONS.education];
                if (item === SECTIONS.achievement) return sectionDiv[SECTIONS.achievement];
                if (item === SECTIONS.summary) return sectionDiv[SECTIONS.summary];
                if (item === SECTIONS.other) return sectionDiv[SECTIONS.other];
                return null;
              })}
            </div>
            <div className={styles.col2}>
              {columns[1].map((item) => {
                if (item === SECTIONS.workExp) return sectionDiv[SECTIONS.workExp];
                if (item === SECTIONS.project) return sectionDiv[SECTIONS.project];
                if (item === SECTIONS.education) return sectionDiv[SECTIONS.education];
                if (item === SECTIONS.achievement) return sectionDiv[SECTIONS.achievement];
                if (item === SECTIONS.summary) return sectionDiv[SECTIONS.summary];
                if (item === SECTIONS.other) return sectionDiv[SECTIONS.other];
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Resume.displayName = "Resume";

export default Resume;
