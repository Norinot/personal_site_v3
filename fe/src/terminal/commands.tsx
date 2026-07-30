import { Trans, useTranslation } from "react-i18next";
import styles from "./Terminal.module.scss";
import { PROFILE } from "@/content/profile";
import { SKILLS } from "@/content/skills";
import { APPS } from "@/content/apps";
import { SERVICES } from "@/content/services";
import { EXPERIENCE } from "@/content/experience";
import { DecodingPortrait, SkillsRadar } from "./graphics";

const BANNER = "█▄ █ █▀█ █▀█ █ █▄ █ █▀█ ▀█▀\n█ ▀█ █▄█ █▀▄ █ █ ▀█ █▄█  █ ";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function BioText() {
  return (
    <Trans
      i18nKey="hero.description"
      components={[
        <span key="0" className={styles.hi} />,
        <span key="1" className={styles.f} />,
        <span key="2" className={styles.f} />,
        <span key="3" className={styles.f} />,
        <span key="4" className={styles.f} />,
        <span key="5" className={styles.f} />,
      ]}
    />
  );
}

export function Banner() {
  const { t } = useTranslation();
  return (
    <>
      <pre className={styles.banner}>{BANNER}</pre>
      <div className={styles.tag}>
        {t("terminal.about.role")} — {t("terminal.about.location")}
      </div>
    </>
  );
}

export function About() {
  const { t } = useTranslation();
  return (
    <div className={styles.fetch}>
      <DecodingPortrait caption={t("terminal.about.decodedCaption")} />
      <div className={styles.rows}>
        <div className={styles.ln}>
          <span className={styles.f}>{PROFILE.handle}</span>
          <span className={styles.c}>@</span>
          <span className={styles.f}>norinot.hu</span>
        </div>
        <div className={`${styles.ln} ${styles.c}`}>{"─".repeat(26)}</div>
        <dl>
          <Row label={t("terminal.about.rowName")} value={PROFILE.name} />
          <Row label={t("terminal.about.rowRole")} value={t("terminal.about.role")} />
          <Row label={t("terminal.about.rowShell")} value="norsh 2.0" />
          <Row label={t("terminal.about.rowLocated")} value={t("terminal.about.location")} />
          <Row label={t("terminal.about.rowSpeaks")} value={t("terminal.about.langs")} />
          <Row label={t("terminal.about.rowStack")} value={t("terminal.about.stack")} />
          <Row label={t("terminal.about.rowContact")} value={PROFILE.email} />
        </dl>
        <hr className={styles.rule} />
        <div className={styles.ln}>
          <BioText />
        </div>
      </div>
    </div>
  );
}

const TIER_FILL: Record<string, number> = { expert: 20, advanced: 15, intermediate: 10 };
const TIER_CLASS: Record<string, string> = { expert: "n", advanced: "f", intermediate: "c" };

export function SkillsSection() {
  const { t } = useTranslation();
  const tiers = ["expert", "advanced", "intermediate"] as const;
  return (
    <div className={styles.split2}>
      <figure className={styles.fig}>
        <div className={styles.chart}>
          <SkillsRadar />
        </div>
        <figcaption>coverage map</figcaption>
      </figure>
      <div>
        {tiers.map((tier) => (
          <div key={tier}>
            <div className={styles.tier}>{t(`skills.${tier}`)}</div>
            {(SKILLS[tier] ?? []).map((skill) => (
              <div key={skill.id} className={styles.meter}>
                <span className={styles.nm}>{skill.name}</span>
                <span className={`${styles.bar} ${styles[TIER_CLASS[tier]]}`}>
                  [{"|".repeat(TIER_FILL[tier])}
                  <span className={styles.c}>{" ".repeat(24 - TIER_FILL[tier])}</span>]
                </span>
                <span className={styles.lv}>{t(`skills.${tier}`)}</span>
              </div>
            ))}
          </div>
        ))}
        <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 14 }}>
          Levels are self-assessed against production work, not certifications.
        </div>
      </div>
    </div>
  );
}

export function ExperienceLog() {
  const { t } = useTranslation();
  return (
    <div className={styles.log}>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 16 }}>
        git log --graph --author={PROFILE.handle}
      </div>
      {EXPERIENCE.map((job) => {
        const bullets = t(`work.items.${job.id}.bullets`, { returnObjects: true }) as string[];
        return (
          <div key={job.id} className={styles.commit}>
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
                  <Trans i18nKey={`work.items.${job.id}.bullets.${i}`} components={[<span key="0" className={styles.hi} />]} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function AppsListing() {
  const { t } = useTranslation();
  return (
    <>
      <div className={`${styles.ln} ${styles.c}`}>
        Reading package lists… <span className={styles.s}>Done</span>
      </div>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 14 }}>
        {t("apps.sectionSubtitle")}
      </div>
      {APPS.map((app) => (
        <div key={app.id} className={styles.pkg}>
          <div className={styles.top}>
            <span className={styles.s}>{t(`apps.items.${app.id}.title`)}</span>{" "}
            <em>[{app.tags.join(", ")}]</em>
          </div>
          <div className={styles.desc}>{t(`apps.items.${app.id}.subtitle`)}</div>
          <div className={styles.desc}>{t(`apps.items.${app.id}.description`)}</div>
          <div className={styles.desc}>
            <a className={styles.f} href={app.link} target="_blank" rel="noopener noreferrer">
              {app.link} ↗
            </a>
          </div>
        </div>
      ))}
    </>
  );
}

export function ServicesGrid() {
  const { t } = useTranslation();
  return (
    <div className={styles.grid}>
      {SERVICES.map((service) => (
        <article key={service.id} className={styles.card}>
          <h3>{t(`services.${service.id}.title`)}</h3>
          <p style={{ marginBottom: 0 }}>{t(`services.${service.id}.description`)}</p>
        </article>
      ))}
    </div>
  );
}

const HELP_ROWS = [
  "about",
  "skills",
  "projects",
  "experience",
  "apps",
  "services",
  "music",
  "contact",
  "hire",
  "message",
  "cv",
  "theme",
  "clear",
] as const;

export function HelpTable() {
  const { t } = useTranslation();
  return (
    <>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginBottom: 12 }}>
        {t("terminal.help.intro")}
      </div>
      <dl>
        {HELP_ROWS.map((cmd) => (
          <div key={cmd} className={styles.row}>
            <dt className={styles.n} style={{ flexBasis: 104 }}>
              {cmd}
            </dt>
            <dd className={styles.c}>{t(`terminal.help.${cmd}`)}</dd>
          </div>
        ))}
      </dl>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 14 }}>
        {t("terminal.help.footer")}
      </div>
    </>
  );
}
