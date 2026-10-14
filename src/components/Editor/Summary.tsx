import React, { FC } from "react";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";

interface SummaryProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Summary: FC<SummaryProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <label className={styles.summaryField}>
        <span>Summary</span>
        <textarea
          value={values.summary || ""}
          placeholder="Enter your objective/summary"
          rows={8}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, summary: event.target.value }))
          }
        />
      </label>
    </div>
  );
};

export default Summary;
