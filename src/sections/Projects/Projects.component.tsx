import Accordion from "@/components/Accordion/Accordion.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { ExternalLink } from "lucide-react";
import styles from "./Projects.module.scss";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

interface Project {
  id: string;
  date: string;
  tags: string[];
  icon: string;
  link: string;
}

const projects: Project[] = [
  {
    id: "business-gpt",
    date: "2024",
    tags: ["React", "Svelte", "Python"],
    icon: "Layers",
    link: "#",
  },
  {
    id: "ai4test",
    date: "2023 - 2024",
    tags: ["React", "Go"],
    icon: "Cpu",
    link: "#",
  },
  {
    id: "saray-webshop",
    date: "2024",
    tags: ["Angular", "Go"],
    icon: "ExternalLink",
    link: "#",
  },
  {
    id: "mapa-crm",
    date: "Present",
    tags: ["Angular", "Java Spring Boot"],
    icon: "Terminal",
    link: "#",
  },
];

const Projects = () => {
  const { t } = useTranslation();

  const getIcon = (icon: string): ReactNode => {
    return <></>;
  };

  return (
    <section id="projects">
      <SectionTitle
        title={t("projects.sectionTitle")}
        subtitle={t("projects.sectionSubtitle")}
      />

      <div className={styles.projectsList}>
        {projects.map((project: Project) => (
          <Accordion
            key={project.id}
            title={t(`projects.items.${project.id}.title`)}
            subtitle={t(`projects.items.${project.id}.subtitle`)}
            tags={project.tags}
            icon={getIcon(project.icon)}
            sideAction={
              <a href="#" className={styles.projectLink}>
                <ExternalLink size={20} />
              </a>
            }
          >
            <p>{t(`projects.items.${project.id}.description`)}</p>
          </Accordion>
        ))}
      </div>
    </section>
  );
};

export default Projects;
