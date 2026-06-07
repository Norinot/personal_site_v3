import React from "react";
import { motion } from "framer-motion";
import styles from "./SectionTitle.module.scss";
import { fadeUp } from "@/utils/animations";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle }) => (
  <motion.div
    className={styles.container}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
  >
    <h2 className={styles.heading}>
      <span className={styles.accentBar}></span>
      {title}
    </h2>
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
  </motion.div>
);

export default SectionTitle;
