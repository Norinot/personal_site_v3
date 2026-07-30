import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import styles from "./MyServices.module.scss";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/animations";
import { getIcon } from "@/utils/getIcon";
import { SERVICES } from "@/content/services";

const MyServices = () => {
  const { t } = useTranslation();

  return (
    <section id="services">
      <SectionTitle
        title={t("services.title")}
        subtitle={t("services.subtitle")}
      />

      <motion.div
        className={styles.servicesGrid}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {SERVICES.map((service) => (
          <motion.div key={service.id} variants={fadeUp}>
            <ChamferBox
              cutSize={20}
              hoverEffect
              className={`${styles.serviceCard} group`}
            >
              <div className={styles.serviceIcon}>
                {getIcon(service.iconName, 32)}
              </div>
              <h3 className={styles.serviceTitle}>
                {t(`services.${service.id}.title`)}
              </h3>
              <p className={styles.serviceDesc}>
                {t(`services.${service.id}.description`)}
              </p>
            </ChamferBox>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default MyServices;
