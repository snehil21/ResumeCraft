import React, { FC, useState, useEffect } from "react";
import { X } from "react-feather";

import InputControl from "../InputControl/InputControl";
import BasicInfo from "./BasicInfo";
import WorkExp from "./WorkExp";
import Project from "./Project";
import Education from "./Education";
import Achievements from "./Achievements";
import Summary from "./Summary";
import Other from "./Other";

import styles from "./Editor.module.css";
import { FormValues, ResumeInformation } from "../../types";

interface EditorProps {
  sections: { [key: string]: string };
  information: ResumeInformation;
  setInformation: React.Dispatch<React.SetStateAction<ResumeInformation>>;
}

const Editor: FC<EditorProps> = ({
  sections,
  information,
  setInformation,
}) => {
  const [activeSectionKey, setActiveSectionKey] = useState(
    Object.keys(sections)[0]
  );
  const [activeInformation, setActiveInformation] = useState(
    information[sections[Object.keys(sections)[0]]]
  );
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);
  const [sectionTitle, setSectionTitle] = useState(
    sections[Object.keys(sections)[0]]
  );
  const [values, setValues] = useState<FormValues>({
    name: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.name || "" : "",
    title: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.title || "" : "",
    linkedin: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.linkedin || "" : "",
    github: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.github || "" : "",
    phone: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.phone || "" : "",
    email: typeof activeInformation?.detail === "object" ? activeInformation?.detail?.email || "" : "",
  });

  const handlePointUpdate = (value: string, index: number) => {
    const tempValues = { ...values };
    if (!Array.isArray(tempValues.points)) tempValues.points = [];
    tempValues.points[index] = value;
    setValues(tempValues);
  };

  const generateBody = () => {
    switch (sections[activeSectionKey]) {
      case sections.basicInfo:
        return <BasicInfo values={values} setValues={setValues} />;
      case sections.workExp:
        return (
          <WorkExp
            values={values}
            setValues={setValues}
            handlePointUpdate={handlePointUpdate}
          />
        );
      case sections.project:
        return (
          <Project
            values={values}
            setValues={setValues}
            handlePointUpdate={handlePointUpdate}
          />
        );
      case sections.education:
        return <Education values={values} setValues={setValues} />;
      case sections.achievement:
        return (
          <Achievements values={values} handlePointUpdate={handlePointUpdate} />
        );
      case sections.summary:
        return <Summary values={values} setValues={setValues} />;
      case sections.other:
        return <Other values={values} setValues={setValues} />;
      default:
        return null;
    }
  };

  const handleSubmission = () => {
    switch (sections[activeSectionKey]) {
      case sections.basicInfo: {
        const tempDetail = {
          name: values.name,
          title: values.title,
          linkedin: values.linkedin,
          github: values.github,
          email: values.email,
          phone: values.phone,
        };

        setInformation((prev) => ({
          ...prev,
          [sections.basicInfo]: {
            ...prev[sections.basicInfo],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.workExp: {
        const tempDetail = {
          certificationLink: values.certificationLink,
          title: values.title,
          startDate: values.startDate,
          endDate: values.endDate,
          companyName: values.companyName,
          location: values.location,
          points: values.points,
        };
        const tempDetails = [...(information[sections.workExp]?.details || [])];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.workExp]: {
            ...prev[sections.workExp],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.project: {
        const tempDetail = {
          link: values.link,
          title: values.title,
          overview: values.overview,
          github: values.github,
          points: values.points,
        };
        const tempDetails = [...(information[sections.project]?.details || [])];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.project]: {
            ...prev[sections.project],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.education: {
        const tempDetail = {
          title: values.title,
          college: values.college,
          startDate: values.startDate,
          endDate: values.endDate,
        };
        const tempDetails = [...(information[sections.education]?.details || [])];
        tempDetails[activeDetailIndex] = tempDetail;

        setInformation((prev) => ({
          ...prev,
          [sections.education]: {
            ...prev[sections.education],
            details: tempDetails,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.achievement: {
        const tempPoints = values.points;

        setInformation((prev) => ({
          ...prev,
          [sections.achievement]: {
            ...prev[sections.achievement],
            points: tempPoints,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.summary: {
        const tempDetail = values.summary;

        setInformation((prev) => ({
          ...prev,
          [sections.summary]: {
            ...prev[sections.summary],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
      case sections.other: {
        const tempDetail = values.other;

        setInformation((prev) => ({
          ...prev,
          [sections.other]: {
            ...prev[sections.other],
            detail: tempDetail,
            sectionTitle,
          },
        }));
        break;
      }
    }
  };

  const handleAddNew = () => {
    const details = activeInformation?.details;
    if (!details) return;
    const lastDetail = details.slice(-1)[0];
    if (!Object.keys(lastDetail || {}).length) return;
    details?.push({});

    setInformation((prev) => ({
      ...prev,
      [sections[activeSectionKey]]: {
        ...information[sections[activeSectionKey]],
        details: details,
      },
    }));
    setActiveDetailIndex(details?.length - 1);
  };

  const handleDeleteDetail = (index: number) => {
    const details = activeInformation?.details
      ? [...activeInformation?.details]
      : [];
    if (!details) return;
    details.splice(index, 1);
    setInformation((prev) => ({
      ...prev,
      [sections[activeSectionKey]]: {
        ...information[sections[activeSectionKey]],
        details: details,
      },
    }));

    setActiveDetailIndex((prev) => (prev === index ? 0 : prev - 1));
  };

  useEffect(() => {
    const activeInfo = information[sections[activeSectionKey]];
    setActiveInformation(activeInfo);
    setSectionTitle(sections[activeSectionKey]);
    setActiveDetailIndex(0);
    setValues({
      name: typeof activeInfo?.detail === "object" ? activeInfo?.detail?.name || "" : "",
      overview: activeInfo?.details
        ? (activeInfo.details[0] as any)?.overview || ""
        : "",
      link: activeInfo?.details
        ? (activeInfo.details[0] as any)?.link || ""
        : "",
      certificationLink: activeInfo?.details
        ? (activeInfo.details[0] as any)?.certificationLink || ""
        : "",
      companyName: activeInfo?.details
        ? (activeInfo.details[0] as any)?.companyName || ""
        : "",
      college: activeInfo?.details
        ? (activeInfo.details[0] as any)?.college || ""
        : "",
      location: activeInfo?.details
        ? (activeInfo.details[0] as any)?.location || ""
        : "",
      startDate: activeInfo?.details
        ? (activeInfo.details[0] as any)?.startDate || ""
        : "",
      endDate: activeInfo?.details
        ? (activeInfo.details[0] as any)?.endDate || ""
        : "",
      points: activeInfo?.details
        ? (activeInfo.details[0] as any)?.points
          ? [...(activeInfo.details[0] as any)?.points]
          : []
        : activeInfo?.points
        ? [...(activeInfo.points as any)]
        : [],
      title: activeInfo?.details
        ? (activeInfo.details[0] as any)?.title || ""
        : (activeInfo?.detail as any)?.title || "",
      linkedin: (activeInfo?.detail as any)?.linkedin || "",
      github: activeInfo?.details
        ? (activeInfo.details[0] as any)?.github || ""
        : (activeInfo?.detail as any)?.github || "",
      phone: (activeInfo?.detail as any)?.phone || "",
      email: (activeInfo?.detail as any)?.email || "",
      summary: typeof activeInfo?.detail !== "object" ? activeInfo.detail : "",
      other: typeof activeInfo?.detail !== "object" ? activeInfo.detail : "",
    });
  }, [activeSectionKey, information, sections]);

  useEffect(() => {
    const details = activeInformation?.details;
    if (!details) return;

    const activeInfo = information[sections[activeSectionKey]];
    setValues({
      overview: (activeInfo.details as any)?.[activeDetailIndex]?.overview || "",
      link: (activeInfo.details as any)?.[activeDetailIndex]?.link || "",
      certificationLink:
        (activeInfo.details as any)?.[activeDetailIndex]?.certificationLink || "",
      companyName:
        (activeInfo.details as any)?.[activeDetailIndex]?.companyName || "",
      location:
        (activeInfo.details as any)?.[activeDetailIndex]?.location || "",
      startDate:
        (activeInfo.details as any)?.[activeDetailIndex]?.startDate || "",
      endDate:
        (activeInfo.details as any)?.[activeDetailIndex]?.endDate || "",
      points:
        (activeInfo.details as any)?.[activeDetailIndex]?.points || "",
      title: (activeInfo.details as any)?.[activeDetailIndex]?.title || "",
      linkedin:
        (activeInfo.details as any)?.[activeDetailIndex]?.linkedin || "",
      github:
        (activeInfo.details as any)?.[activeDetailIndex]?.github || "",
      college:
        (activeInfo.details as any)?.[activeDetailIndex]?.college || "",
    });
  }, [activeDetailIndex, information, activeSectionKey, sections]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {Object.keys(sections)?.map((key) => (
          <div
            className={`${styles.section} ${
              activeSectionKey === key ? styles.active : ""
            }`}
            key={key}
            onClick={() => setActiveSectionKey(key)}
          >
            {sections[key]}
          </div>
        ))}
      </div>

      <div className={styles.body}>
        <InputControl
          label="Title"
          placeholder="Enter section title"
          value={sectionTitle}
          onChange={(event) => setSectionTitle(event.target.value)}
        />

        <div className={styles.chips}>
          {activeInformation?.details
            ? activeInformation?.details?.map((item: any, index: number) => (
                <div
                  className={`${styles.chip} ${
                    activeDetailIndex === index ? styles.active : ""
                  }`}
                  key={item.title + index}
                  onClick={() => setActiveDetailIndex(index)}
                >
                  <p>
                    {sections[activeSectionKey]} {index + 1}
                  </p>
                  <X
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteDetail(index);
                    }}
                  />
                </div>
              ))
            : ""}
          {activeInformation?.details &&
          activeInformation?.details?.length > 0 ? (
            <div className={styles.new} onClick={handleAddNew}>
              +New
            </div>
          ) : (
            ""
          )}
        </div>

        {generateBody()}

        <button onClick={handleSubmission}>Save</button>
      </div>
    </div>
  );
};

export default Editor;
