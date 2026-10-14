import React, { FC } from "react";
import InputControl from "../InputControl/InputControl";
import styles from "./Editor.module.css";
import { FormValues } from "../../types";
import BulletListEditor from "./BulletListEditor";

interface ProjectProps {
  values: FormValues;
  setValues: React.Dispatch<React.SetStateAction<FormValues>>;
}

const Project: FC<ProjectProps> = ({ values, setValues }) => {
  return (
    <div className={styles.detail}>
      <div className={styles.row}>
        <InputControl
          label="Project Title"
          value={values.title || ""}
          placeholder="Enter title eg. Chat app"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, title: event.target.value }))
          }
        />
      </div>
      <InputControl
        label="Overview"
        value={values.overview || ""}
        placeholder="Enter basic overview of project"
        onChange={(event) =>
          setValues((prev) => ({ ...prev, overview: event.target.value }))
        }
      />
      <div className={styles.row}>
        <InputControl
          label="Deployed Link"
          value={values.link || ""}
          placeholder="Enter deployed link of project"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, link: event.target.value }))
          }
        />
        <InputControl
          label="Github Link"
          value={values.github || ""}
          placeholder="Enter github link of project"
          onChange={(event) =>
            setValues((prev) => ({ ...prev, github: event.target.value }))
          }
        />
      </div>
      <div className={styles.row}>
        <InputControl label="Start Date" type="date" value={values.startDate || ""} onChange={(event) => setValues((prev) => ({ ...prev, startDate: event.target.value }))} />
        <InputControl label="End Date" type="date" value={values.endDate || ""} onChange={(event) => setValues((prev) => ({ ...prev, endDate: event.target.value }))} />
      </div>
      <BulletListEditor label="Project description" points={values.points || []} onChange={(points) => setValues((prev) => ({ ...prev, points }))} />
    </div>
  );
};

export default Project;
