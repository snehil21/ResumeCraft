import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";
import BulletListEditor from "./BulletListEditor";
import MonthYearControl from "./MonthYearControl";

interface WorkExpProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const WorkExp: FC<WorkExpProps> = ({ values, setValues }) => {
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
        <input
          type="checkbox"
          checked={Boolean(values.currentRole)}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              currentRole: event.target.checked,
              endDate: event.target.checked ? "" : prev.endDate,
            }))
          }
        />
        I currently work here
      </label>

      <BulletListEditor
        label="Work description"
        points={values.points || []}
        onChange={(points) => setValues((prev) => ({ ...prev, points }))}
      />
    </div>
  );
};

export default WorkExp;
