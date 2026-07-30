import { useTranslation } from "react-i18next";
import styles from "./Terminal.module.scss";
import { PROJECTS, type Project } from "@/content/projects";
import { ProjectCover } from "./graphics";

export function ProjectsGrid() {
  const { t } = useTranslation();
  return (
    <>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 12 }}>
        {PROJECTS.length} projects · <span className={styles.f}>projects &lt;name&gt;</span> for detail
      </div>
      <div className={styles.grid}>
        {PROJECTS.map((project) => (
          <article key={project.id} className={styles.card}>
            <span className={styles.cover}>
              <ProjectCover seed={project.id} />
            </span>
            <h3>{t(`projects.items.${project.id}.title`)}</h3>
            <p>{t(`projects.items.${project.id}.subtitle`)}</p>
            <div className={styles.stack}>
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {project.link !== "#" && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                open ↗
              </a>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const { t } = useTranslation();
  const work = t(`projects.items.${project.id}.work`, { returnObjects: true }) as string[];
  return (
    <div className={styles.case}>
      <h3>{t(`projects.items.${project.id}.title`)}</h3>
      <div className={styles.meta}>
        {t(`projects.items.${project.id}.role`)} · {project.date}
      </div>
      <p className={styles.lead}>{t(`projects.items.${project.id}.problem`)}</p>
      <div className={styles.tier}>what I built</div>
      <ul className={styles.did}>
        {work.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      <div className={styles.tier}>stack</div>
      <div className={styles.stack}>
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {project.link !== "#" && (
        <div style={{ marginTop: 14 }}>
          <a className={styles.f} href={project.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            {project.link} ↗
          </a>
        </div>
      )}
    </div>
  );
}
