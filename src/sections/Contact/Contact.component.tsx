import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import ChamferInput from "@/components/CamferInput/ChamferInput.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { Send } from "lucide-react";
import styles from "./Contact.module.scss";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <section id="contact" className={styles.contactContainer}>
      <SectionTitle
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />

      <ChamferBox cutSize={40} borderColor="rgba(0, 240, 255, 0.15)">
        <form className={styles.formSpacing}>
          <div className={styles.formGrid}>
            <ChamferInput
              label={t("contact.emailLabel")}
              type="email"
              placeholder={t("contact.emailPlaceholder")}
              icon={<></>}
            />
            <ChamferInput
              label={t("contact.subjectLabel")}
              type="text"
              placeholder={t("contact.subjectPlaceholder")}
            />
          </div>

          <ChamferInput
            label={t("contact.messageLabel")}
            as="textarea"
            rows={5}
            placeholder={t("contact.messagePlaceholder")}
          />

          <ChamferBox
            cutSize={15}
            bg="var(--accent)"
            hoverEffect
            noPadding
            className={styles.submitBtnContainer}
            onClick={() => alert(t("contact.alert"))}
          >
            <button type="button" className={styles.submitBtn}>
              <Send size={18} /> {t("contact.sendButton")}
            </button>
          </ChamferBox>
        </form>
      </ChamferBox>
    </section>
  );
};

export default Contact;
