import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import styles from "./Skills.module.scss";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type SkillLevel = "expert" | "advanced" | "intermediate";
export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
  descriptionKey: string;
}

export const skillsData: Record<string, Skill[]> = {
  expert: [
    {
      id: "react",
      name: "React",
      level: "expert",
      descriptionKey: "react_desc",
    },
    {
      id: "angular",
      name: "Angular",
      level: "expert",
      descriptionKey: "angular_desc",
    },
    {
      id: "ts",
      name: "TypeScript",
      level: "expert",
      descriptionKey: "ts_desc",
    },
    {
      id: "svelte",
      name: "Svelte",
      level: "expert",
      descriptionKey: "svelte_desc",
    },
  ],
  advanced: [
    {
      id: "java",
      name: "Java (Spring)",
      level: "advanced",
      descriptionKey: "java_desc",
    },
    {
      id: "go",
      name: "Go (Golang)",
      level: "advanced",
      descriptionKey: "go_desc",
    },
    {
      id: "git",
      name: "Git",
      level: "advanced",
      descriptionKey: "git_desc",
    },
  ],
  intermediate: [
    {
      id: "csharp",
      name: "C# & Unity",
      level: "intermediate",
      descriptionKey: "csharp_desc",
    },
    {
      id: "docker",
      name: "Docker & Linux",
      level: "intermediate",
      descriptionKey: "docker_desc",
    },
  ],
};

const SkillDot = ({ color }: { color: string }) => (
  <div className={styles.skillDot} style={{ backgroundColor: color }}></div>
);

const Skills = () => {
  const { t } = useTranslation();

  return (
    <section id="skills">
      <SectionTitle title={t("skills.title")} subtitle={t("skills.subtitle")} />

      <div className={styles.skillsGrid}>
        <SkillColumn
          title={t("skills.expert")}
          skills={skillsData.expert}
          headerClass={styles.skillTitleAccent}
          itemClass={styles.skillItemExpert}
          dotColor="var(--accent)"
        />

        <SkillColumn
          title={t("skills.advanced")}
          skills={skillsData.advanced}
          headerClass={styles.skillTitleWhite}
          itemClass={styles.skillItemAdv}
          dotColor="rgba(255,255,255,0.5)"
        />

        <SkillColumn
          title={t("skills.intermediate")}
          skills={skillsData.intermediate}
          headerClass={styles.skillTitleGray}
          itemClass={styles.skillItemInt}
          dotColor="#4b5563"
        />
      </div>
    </section>
  );
};

interface SkillColumnProps {
  title: string;
  skills: Skill[];
  headerClass: string;
  itemClass: string;
  dotColor: string;
}

const SkillColumn = ({
  title,
  skills,
  headerClass,
  itemClass,
  dotColor,
}: SkillColumnProps) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedSkill = skills.find((s) => s.id === selectedId);

  return (
    <div className={styles.skillColumn}>
      <ChamferBox cutSize={15} bg="#1a1d24" className={styles.skillHeader}>
        <h3 className={headerClass}>{title}</h3>
      </ChamferBox>

      <div className={styles.skillListContainer}>
        <div className={styles.skillList}>
          {skills.map((skill) => (
            <motion.div
              key={skill.id}
              layoutId={`card-${skill.id}`}
              className={itemClass}
              onClick={() => setSelectedId(skill.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span layoutId={`title-${skill.id}`}>
                {skill.name}
              </motion.span>
              <motion.div layoutId={`dot-${skill.id}`}>
                <SkillDot color={dotColor} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* The Expanded Overlay */}
        <AnimatePresence>
          {selectedId && selectedSkill && (
            <motion.div
              layoutId={`card-${selectedId}`}
              className={`${itemClass} ${styles.expandedCard}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header of Expanded Card */}
              <div
                className={styles.expandedHeader}
                onClick={() => setSelectedId(null)}
              >
                <motion.span
                  layoutId={`title-${selectedId}`}
                  className={styles.expandedTitle}
                >
                  {selectedSkill.name}
                </motion.span>
                <motion.div layoutId={`dot-${selectedId}`}>
                  <SkillDot color={dotColor} />
                </motion.div>
              </div>

              {/* Description Body */}
              <motion.div
                className={styles.expandedContent}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              >
                <p>
                  {t(`skills.descriptions.${selectedSkill.descriptionKey}`)}
                </p>
                <button
                  className={styles.closeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(null);
                  }}
                >
                  {t("common.close")}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Skills;
