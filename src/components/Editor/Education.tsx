import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";
import MonthYearControl from "./MonthYearControl";

interface EducationProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Education: FC<EducationProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Field of Study/Degree"
          value={values.title || ""}
          placeholder="Enter title eg.B-Tech"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
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
          value={values.endDate || ""}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, endDate: value }))
          }
        />
      </div>
    </div>
  );
};

export default Education;
