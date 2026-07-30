import Accordion from "@/components/Accordion/Accordion.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { ExternalLink } from "lucide-react";
import styles from "./Projects.module.scss";
import { useTranslation } from "react-i18next";
import { getIcon } from "@/utils/getIcon";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";
import { PROJECTS, type Project } from "@/content/projects";

const Projects = () => {
  const { t } = useTranslation();

  return (
    <section id="projects">
      <SectionTitle
        title={t("projects.sectionTitle")}
        subtitle={t("projects.sectionSubtitle")}
      />

      <motion.div
        className={styles.projectsList}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {PROJECTS.map((project: Project) => (
          <motion.div key={project.id} variants={fadeUp}>
            <Accordion
              title={t(`projects.items.${project.id}.title`)}
              subtitle={t(`projects.items.${project.id}.subtitle`)}
              tags={project.tags}
              icon={getIcon(project.icon)}
              sideAction={
                project.link !== "#" && (
                  <a
                    target="_blank"
                    href={project.link}
                    className={styles.projectLink}
                  >
                    <ExternalLink size={20} />
                  </a>
                )
              }
            >
              <p>{t(`projects.items.${project.id}.description`)}</p>
            </Accordion>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Projects;
