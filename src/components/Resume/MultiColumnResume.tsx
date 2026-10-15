import React, { FC, ReactNode } from "react";

import styles from "./ResumeRenderer.module.css";

interface MultiColumnResumeProps {
  sectionOrder: string[];
  pageIndex?: number;
  renderSection: (sectionKey: string) => ReactNode;
}

const MultiColumnResume: FC<MultiColumnResumeProps> = ({ sectionOrder, pageIndex = 0, renderSection }) => (
  <div className={styles.multiColumnViewport}>
    <main
      className={styles.columns}
      data-resume-flow
      data-layout-mode="multi"
      style={{ "--multi-page-index": pageIndex } as React.CSSProperties}
    >
      {sectionOrder.map(renderSection)}
    </main>
  </div>
);

export default MultiColumnResume;
