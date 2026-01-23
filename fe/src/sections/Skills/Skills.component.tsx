import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import styles from "./Skills.module.scss";
import { useTranslation } from "react-i18next";

const Skills = () => {
  const { t } = useTranslation();

  return (
    <section id="skills">
      <SectionTitle title={t("skills.title")} subtitle={t("skills.subtitle")} />

      <div className={styles.skillsGrid}>
        {/* Expert */}
        <div className={styles.skillColumn}>
          <ChamferBox cutSize={15} bg="#1a1d24" className={styles.skillHeader}>
            <h3 className={styles.skillTitleAccent}>{t("skills.expert")}</h3>
          </ChamferBox>

          <div className={styles.skillList}>
            {["React", "TypeScript", "SCSS/CSS", "HTML5"].map((skill) => (
              <div key={skill} className={styles.skillItemExpert}>
                <span>{skill}</span>
                <div
                  className={styles.skillDot}
                  style={{ backgroundColor: "var(--accent)" }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced */}
        <div className={styles.skillColumn}>
          <ChamferBox cutSize={15} bg="#1a1d24" className={styles.skillHeader}>
            <h3 className={styles.skillTitleWhite}>{t("skills.advanced")}</h3>
          </ChamferBox>
          <div className={styles.skillList}>
            {["Angular", "Node.js", "Git", "Java"].map((skill) => (
              <div key={skill} className={styles.skillItemAdv}>
                <span>{skill}</span>
                <div
                  className={styles.skillDot}
                  style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Intermediate */}
        <div className={styles.skillColumn}>
          <ChamferBox cutSize={15} bg="#1a1d24" className={styles.skillHeader}>
            <h3 className={styles.skillTitleGray}>
              {t("skills.intermediate")}
            </h3>
          </ChamferBox>
          <div className={styles.skillList}>
            {["Go (Golang)", "Unity 3D", "C#", "AWS"].map((skill) => (
              <div key={skill} className={styles.skillItemInt}>
                <span>{skill}</span>
                <div
                  className={styles.skillDot}
                  style={{ backgroundColor: "#4b5563" }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
