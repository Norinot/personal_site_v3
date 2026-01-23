import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import ChamferInput from "@/components/CamferInput/ChamferInput.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { Mail, PhoneCall, Send } from "lucide-react";
import styles from "./Contact.module.scss";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { URL_BASEAPTH } from "@/App";
import { useAuth } from "@clerk/clerk-react";

interface Contact {
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleContact = async () => {
    const requestObj: Contact = {
      email: email,
      message: message,
      subject: subject,
    };

    try {
      const token = await getToken();

      const response = await fetch(URL_BASEAPTH + "contact", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestObj),
      });

      if (!response.ok) {
        throw new Error("Well it didn't work out I guess.");
      }

      console.info("Yippe");
    } catch (error) {
      console.error("Some error occoured", error);
    }

    console.log(email);
    console.log(subject);
    console.log(message);
  };

  return (
    <section id="contact" className={styles.contactContainer}>
      <SectionTitle
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />

      <ChamferBox cutSize={40} borderColor="rgba(0, 240, 255, 0.15)">
        <div className={styles.contactsWrapper}>
          <div className={styles.label}>
            <Mail />
            <span>bencemark.bernath@gmail.com</span>
          </div>
          <div className={styles.label}>
            <PhoneCall /> <span> +36 30 202 4133</span>
          </div>
        </div>
        <form className={styles.formSpacing}>
          <div className={styles.formGrid}>
            <ChamferInput
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              label={t("contact.emailLabel")}
              type="email"
              placeholder={t("contact.emailPlaceholder")}
              icon={<></>}
            />
            <ChamferInput
              onChange={(event) => {
                setSubject(event.target.value);
              }}
              label={t("contact.subjectLabel")}
              type="text"
              placeholder={t("contact.subjectPlaceholder")}
            />
          </div>

          <ChamferInput
            onChange={(event) => {
              setMessage(event.target.value);
            }}
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
            onClick={() => handleContact()}
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
