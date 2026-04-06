import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";

interface WorkExpProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
  handlePointUpdate: (value: string, index: number) => void;
}

const WorkExp: FC<WorkExpProps> = ({
  values,
  setValues,
  handlePointUpdate,
}) => {
  return (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Job Title"
          placeholder="Enter Job title eg. Frontend developer"
          value={values.title || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <InputControl
          label="Company Name"
          placeholder="Enter company name eg. Microsoft"
          value={values.companyName || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, companyName: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Location"
          placeholder="Enter location eg. Remote"
          value={values.location || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, location: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Start Date"
          type="date"
          value={values.startDate || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, startDate: event.target.value }))
          }
        />
        <InputControl
          label="End Date"
          type="date"
          value={values.endDate || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, endDate: event.target.value }))
          }
        />
      </div>

      <div className={styles.column}>
        <label>Enter work description</label>
        <InputControl
          placeholder="Line 1"
          value={values.points ? values.points[0] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 0)}
        />
        <InputControl
          placeholder="Line 2"
          value={values.points ? values.points[1] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 1)}
        />
        <InputControl
          placeholder="Line 3"
          value={values.points ? values.points[2] : ""}
          onChange={(event) => handlePointUpdate(event.target.value, 2)}
        />
      </div>
    </div>
  );
};

export default WorkExp;
