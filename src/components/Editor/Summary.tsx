import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";

interface SummaryProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Summary: FC<SummaryProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <InputControl
        label="Summary"
        value={values.summary || ""}
        placeholder="Enter your objective/summary"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, summary: event.target.value }))
        }
      />
    </div>
  );
};

export default Summary;
