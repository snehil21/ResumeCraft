import React from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";

function Other({ values, setValues }) {
  return (
    <div className={styles.detail}>
      <InputControl
        label="Other"
        value={values.other}
        placeholder="Enter something"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, other: event.target.value }))
        }
      />
    </div>
  );
}

export default Other;
