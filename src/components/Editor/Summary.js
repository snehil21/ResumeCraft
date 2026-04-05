import React from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";

function Summary({ values, setValues }) {
  return (
    <div className={styles.detail}>
      <InputControl
        label="Summary"
        value={values.summary}
        placeholder="Enter your objective/summary"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, summary: event.target.value }))
        }
      />
    </div>
  );
}

export default Summary;
