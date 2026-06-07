import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { ExternalLink } from "lucide-react";
import styles from "./Apps.module.scss";
import { useTranslation } from "react-i18next";
import { getIcon } from "@/utils/getIcon";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";

interface PersonalApp {
  id: string;
  icon: string;
  link: string;
  tags: string[];
}

const apps: PersonalApp[] = [
  {
    id: "forno",
    icon: "pizza",
    link: "https://forno.norinot.hu",
    tags: ["React"],
  },
];

const Apps = () => {
  const { t } = useTranslation();

  return (
    <section id="apps">
      <SectionTitle
        title={t("apps.sectionTitle")}
        subtitle={t("apps.sectionSubtitle")}
      />

      <motion.div
        className={styles.appGrid}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {apps.map((app) => {
          const features = t(`apps.items.${app.id}.features`, {
            returnObjects: true,
          }) as string[];

          return (
            <motion.div key={app.id} variants={fadeUp}>
              <ChamferBox
                cutSize={15}
                borderColor="var(--bg-card-hover)"
                bg="var(--bg-card)"
                className={styles.appCard}
                noPadding
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconAndTitle}>
                      <div className={styles.appIcon}>{getIcon(app.icon, 28)}</div>
                      <div>
                        <h3 className={styles.appName}>
                          {t(`apps.items.${app.id}.title`)}
                        </h3>
                        <p className={styles.appTagline}>
                          {t(`apps.items.${app.id}.subtitle`)}
                        </p>
                      </div>
                    </div>
                    <span className={styles.launchBtnWrapper}>
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.launchBtn}
                      >
                        <ExternalLink size={14} />
                        {t("apps.launch")}
                      </a>
                    </span>
                  </div>

                  <p className={styles.description}>
                    {t(`apps.items.${app.id}.description`)}
                  </p>

                  <ul className={styles.featureList}>
                    {features.map((feature, i) => (
                      <li key={i} className={styles.feature}>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={styles.tags}>
                    {app.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ChamferBox>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default Apps;
