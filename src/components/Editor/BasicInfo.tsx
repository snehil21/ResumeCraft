import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";

interface BasicInfoProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const BasicInfo: FC<BasicInfoProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Full name"
          placeholder="Enter your full name"
          value={values.name || ""}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, name: event.target.value }))
          }
        />
        <InputControl
          label="Professional title"
          value={values.title || ""}
          placeholder="e.g. Software Engineer"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl label="Location" value={values.location || ""} placeholder="City, Country" onChange={(event) => setValues((prev) => ({ ...prev, location: event.target.value }))} />
        <InputControl label="Website" value={values.website || ""} placeholder="yourportfolio.com" onChange={(event) => setValues((prev) => ({ ...prev, website: event.target.value }))} />
      </div>
      <div className={styles.row}>
        <InputControl
          label="LinkedIn"
          value={values.linkedin || ""}
          placeholder="linkedin.com/in/your-name"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, linkedin: event.target.value }))
          }
        />
        <InputControl
          label="GitHub"
          value={values.github || ""}
          placeholder="github.com/your-name"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, github: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl
          label="Email"
          value={values.email || ""}
          placeholder="Enter your email"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, email: event.target.value }))
          }
        />
        <InputControl
          label="Phone"
          value={values.phone || ""}
          placeholder="Enter your phone number"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, phone: event.target.value }))
          }
        />
      </div>
    </div>
  );
};

export default BasicInfo;
