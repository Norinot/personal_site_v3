import { useTranslation, Trans } from "react-i18next";
import styles from "./Terminal.module.scss";
import { PROFILE } from "@/content/profile";
import { EXPERIENCE } from "@/content/experience";
import { SKILLS } from "@/content/skills";
import { PROJECTS } from "@/content/projects";
import { BioText } from "./commands";

export function Cv() {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.cvsheet}>
        <div className={styles.ln} style={{ fontFamily: "var(--display)", fontSize: 19, color: "var(--hi)" }}>
          {PROFILE.name}
        </div>
        <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 4 }}>
          {t("terminal.about.role")} · {t("terminal.about.location")} · {PROFILE.email}
        </div>
        <hr className={styles.rule} />
        <div className={styles.ln}>
          <BioText />
        </div>

        <div className={styles.tier}>{t("terminal.cv.experience")}</div>
        {EXPERIENCE.map((job) => {
          const bullets = t(`work.items.${job.id}.bullets`, { returnObjects: true }) as string[];
          return (
            <div key={job.id} className={styles.commit} style={{ paddingBottom: 14 }}>
              <div className={styles.h}>
                {t(`work.items.${job.id}.role`)} <span className={styles.c}>—</span>{" "}
                <span className={styles.s}>{t(`work.items.${job.id}.company`)}</span>
              </div>
              <div className={styles.meta}>
                {job.date} · {job.location}
              </div>
              <ul>
                {bullets.map((_, i) => (
                  <li key={i}>
                    <Trans i18nKey={`work.items.${job.id}.bullets.${i}`} components={[<span key="0" />]} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <div className={styles.tier}>{t("terminal.cv.skills")}</div>
        <dl>
          {(["expert", "advanced", "intermediate"] as const).map((tier) => (
            <div key={tier} className={styles.row}>
              <dt style={{ flexBasis: 110 }}>{t(`skills.${tier}`)}</dt>
              <dd>{(SKILLS[tier] ?? []).map((s) => s.name).join(" · ")}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.tier}>{t("terminal.cv.projects")}</div>
        <dl>
          {PROJECTS.map((project) => (
            <div key={project.id} className={styles.row}>
              <dt className={styles.n} style={{ flexBasis: 110 }}>
                {t(`projects.items.${project.id}.title`)}
              </dt>
              <dd>{t(`projects.items.${project.id}.subtitle`)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 14 }}>
        {t("terminal.cv.printHint")}
      </div>
    </>
  );
}
