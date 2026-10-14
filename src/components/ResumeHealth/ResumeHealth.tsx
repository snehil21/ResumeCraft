import React, { FC, useMemo } from "react";
import { AlertCircle, ArrowRight, CheckCircle, Info } from "react-feather";

import type { ResumeDocument } from "../../types";
import { analyzeResumeHealth, HealthSeverity, HealthTarget } from "../../utils/resumeHealth";
import styles from "./ResumeHealth.module.css";

interface ResumeHealthProps {
  document: ResumeDocument;
  pageCount: number;
  onNavigate: (target: HealthTarget) => void;
}

const groups: Array<{ severity: HealthSeverity; label: string; icon: typeof AlertCircle }> = [
  { severity: "critical", label: "Critical", icon: AlertCircle },
  { severity: "recommended", label: "Recommended", icon: CheckCircle },
  { severity: "optional", label: "Optional", icon: Info },
];

const ResumeHealth: FC<ResumeHealthProps> = ({ document, pageCount, onNavigate }) => {
  const report = useMemo(() => analyzeResumeHealth(document, { pageCount }), [document, pageCount]);
  const total = report.findings.length;

  return <div className={styles.health}>
    <section className={styles.summary} aria-labelledby="resume-health-heading">
      <div>
        <p>Local document review</p>
        <h3 id="resume-health-heading">Resume Health</h3>
        <span>Deterministic checks in your browser—not an ATS score.</span>
      </div>
      <div className={report.counts.critical ? styles.needsAttention : styles.goodFoundation}>
        <strong>{report.counts.critical ? "Needs attention" : "Good foundation"}</strong>
        <small>{total ? `${total} ${total === 1 ? "finding" : "findings"}` : "No issues detected"}</small>
      </div>
    </section>

    {!total ? <div className={styles.emptyState}><CheckCircle /><div><strong>No health findings right now</strong><span>Keep reviewing the final wording and exported pages before sending.</span></div></div> : null}

    {groups.map(({ severity, label, icon: Icon }) => {
      const findings = report.findings.filter((finding) => finding.severity === severity);
      return <section className={`${styles.group} ${styles[severity]}`} key={severity} aria-labelledby={`health-${severity}`}>
        <header><div><Icon /><h4 id={`health-${severity}`}>{label}</h4></div><span>{findings.length}</span></header>
        {findings.length ? <div className={styles.findings}>
          {findings.map((finding) => <button type="button" key={finding.id} onClick={() => onNavigate(finding.target)}>
            <span><strong>{finding.title}</strong><small>{finding.detail}</small></span><ArrowRight aria-hidden="true" />
          </button>)}
        </div> : <p className={styles.clear}>Nothing to address in this group.</p>}
      </section>;
    })}
  </div>;
};

export default ResumeHealth;
