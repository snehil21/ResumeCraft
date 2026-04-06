import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";

interface OtherProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Other: FC<OtherProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <InputControl
        label="Other"
        value={values.other || ""}
        placeholder="Enter something"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, other: event.target.value }))
        }
      />
    </div>
  );
};

export default Other;
