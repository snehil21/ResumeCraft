import React, { FC, ReactNode } from "react";

import styles from "./ResumeRenderer.module.css";

interface SingleColumnResumeProps {
  sectionOrder: string[];
  renderSection: (sectionKey: string) => ReactNode;
}

const SingleColumnResume: FC<SingleColumnResumeProps> = ({ sectionOrder, renderSection }) => (
  <main className={styles.sections} data-resume-flow data-layout-mode="single">
    {sectionOrder.map(renderSection)}
  </main>
);

export default SingleColumnResume;
