import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { Code, Users, Server, Cog } from "lucide-react";
import styles from "./MyServices.module.scss";
import { useTranslation } from "react-i18next";

const MyServices = () => {
  const { t } = useTranslation();

  return (
    <section id="services">
      <SectionTitle
        title={t("services.title")}
        subtitle={t("services.subtitle")}
      />

      <div className={styles.servicesGrid}>
        {[
          {
            icon: <Users size={32} />,
            title: t("services.consulting.title"),
            desc: t("services.consulting.description"),
          },
          {
            icon: <Code size={32} />,
            title: t("services.frontendDevelopment.title"),
            desc: t("services.frontendDevelopment.description"),
          },
          {
            icon: <Server size={32} />,
            title: t("services.backendDevelopment.title"),
            desc: t("services.backendDevelopment.description"),
          },
          {
            icon: <Cog size={32} />,
            title: t("services.maintenanceAndSupport.title"),
            desc: t("services.maintenanceAndSupport.description"),
          },
        ].map((service, idx) => (
          <ChamferBox
            key={idx}
            cutSize={20}
            hoverEffect
            className={`${styles.serviceCard} group`}
          >
            <div className={styles.serviceIcon}>{service.icon}</div>
            <h3 className={styles.serviceTitle}>{service.title}</h3>
            <p className={styles.serviceDesc}>{service.desc}</p>
          </ChamferBox>
        ))}
      </div>
    </section>
  );
};

export default MyServices;
