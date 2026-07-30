import Accordion from "@/components/Accordion/Accordion.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { MapPin } from "lucide-react";
import styles from "./WorkExperience.module.scss";
import { useTranslation, Trans } from "react-i18next";
import { getIcon } from "@/utils/getIcon";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";
import { EXPERIENCE } from "@/content/experience";

const WorkExperience = () => {
  const { t } = useTranslation();

  return (
    <section id="work">
      <SectionTitle title={t("work.title")} subtitle={t("work.subtitle")} />

      <motion.div
        className={styles.experienceList}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {EXPERIENCE.map((job) => {
          const bulletPoints = t(`work.items.${job.id}.bullets`, {
            returnObjects: true,
          }) as string[];

          return (
            <motion.div key={job.id} variants={fadeUp}>
              <Accordion
                title={t(`work.items.${job.id}.role`)}
                subtitle={t(`work.items.${job.id}.company`)}
                date={job.date}
                icon={getIcon(job.iconName)}
                sideAction={
                  <div className={styles.locationWrapper}>
                    <span className={styles.locationText}>{job.location}</span>
                    <MapPin size={16} className={styles.locationIcon} />
                  </div>
                }
              >
                <ul className={styles.expDetails}>
                  <li className={styles.expHeader}>
                    {t("work.achievementsLabel")}
                  </li>

                  {bulletPoints.map((_, index) => (
                    <li key={index}>
                      <Trans
                        i18nKey={`work.items.${job.id}.bullets.${index}`}
                        components={[
                          <span key="0" className={styles.highlight} />,
                        ]}
                      />
                    </li>
                  ))}
                </ul>
              </Accordion>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default WorkExperience;
