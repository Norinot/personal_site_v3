import React from "react";
import styles from "./SectionTitle.module.scss";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => (
  <div className={styles.container}>
    <h2 className={styles.heading}>
      <span className={styles.accentBar}></span>
      {title}
    </h2>
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
  </div>
);

export default SectionTitle;
