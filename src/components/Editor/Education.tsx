import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";
import MonthYearControl from "./MonthYearControl";
import BulletListEditor from "./BulletListEditor";

interface EducationProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Education: FC<EducationProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Degree"
          value={values.title || ""}
          placeholder="e.g. Bachelor of Engineering"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <InputControl label="Field of study" value={values.fieldOfStudy || ""} placeholder="e.g. Computer Science" onChange={(event) => setValues((prev) => ({ ...prev, fieldOfStudy: event.target.value }))} />
      </div>
      <div className={styles.row}>
        <InputControl label="Grade" value={values.grade || ""} placeholder="CGPA, GPA, or distinction" onChange={(event) => setValues((prev) => ({ ...prev, grade: event.target.value }))} />
        <InputControl label="Location" value={values.location || ""} placeholder="City, Country" onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))} />
      </div>
      <InputControl
        label="College/School Name"
        value={values.college || ""}
        placeholder="Enter name of your college/school"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, college: event.target.value }))
        }
      />
      <InputControl label="Institution URL" type="url" value={values.website || ""} placeholder="https://university.example" onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))} />
      <div className={styles.row}>
        <MonthYearControl
          label="Start Date"
          value={values.startDate || ""}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, startDate: value }))
          }
        />
        <MonthYearControl
          label="End Date"
          disabled={Boolean(values.currentRole)}
          value={values.endDate || ""}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, endDate: value }))
          }
        />
      </div>
      <label className={styles.currentRole}>
        <input type="checkbox" checked={Boolean(values.currentRole)} onChange={(event) => setValues((prev) => ({ ...prev, currentRole: event.target.checked, endDate: event.target.checked ? "" : prev.endDate }))} />
        I currently study here
      </label>
      <BulletListEditor label="Education highlights" points={values.points || []} onChange={(points) => setValues((prev) => ({ ...prev, points }))} />
    </div>
  );
};

export default Education;
