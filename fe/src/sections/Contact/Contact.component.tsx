import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import ChamferInput from "@/components/CamferInput/ChamferInput.component";
import SectionTitle from "@/components/SectionTitle/SectionTitle.component";
import { Mail, PhoneCall, Send, AlertCircle, CheckCircle } from "lucide-react";
import styles from "./Contact.module.scss";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

interface ContactFormState {
  email: string;
  subject: string;
  message: string;
}

interface StatusState {
  type: "success" | "error" | null;
  message: string;
}

const Contact = () => {
  const { t } = useTranslation();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState<ContactFormState>({
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<ContactFormState>>({});

  const [status, setStatus] = useState<StatusState>({
    type: null,
    message: "",
  });

  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setIsStatusVisible(true);
  };

  const hideStatus = (delay: number = 5000) => {
    setTimeout(() => {
      setIsStatusVisible(false);

      setTimeout(() => {
        setStatus({ type: null, message: "" });
      }, 500);
    }, delay);
  };

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormState> = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = t("contact.errors.required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("contact.errors.invalidEmail");
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t("contact.errors.required");
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t("contact.errors.required");
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setTimeout(() => {
        setErrors({});
      }, 3000);
    }

    return isValid;
  };

  const handleContact = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsStatusVisible(false);

    try {
      const token = await getToken();

      const response = await fetch("/contact", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Server response was not ok");
      }

      showStatus(
        "success",
        t("contact.successMessage") ||
          "Message received! I'll get back to you soon.",
      );
      setFormData({ email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submission error", error);
      showStatus(
        "error",
        t("contact.errorMessage") ||
          "System malfunction. Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
      hideStatus(5000);
    }
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
            <div className={styles.inputGroup}>
              <ChamferInput
                onChange={(e) => handleChange("email", e.target.value)}
                label={t("contact.emailLabel")}
                type="email"
                placeholder={t("contact.emailPlaceholder")}
                value={formData.email}
                icon={<></>}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <ChamferInput
                onChange={(e) => handleChange("subject", e.target.value)}
                label={t("contact.subjectLabel")}
                type="text"
                placeholder={t("contact.subjectPlaceholder")}
                value={formData.subject}
              />
              {errors.subject && (
                <span className={styles.errorText}>{errors.subject}</span>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <ChamferInput
              onChange={(e) => handleChange("message", e.target.value)}
              label={t("contact.messageLabel")}
              as="textarea"
              rows={5}
              placeholder={t("contact.messagePlaceholder")}
              value={formData.message}
            />
            {errors.message && (
              <span className={styles.errorText}>{errors.message}</span>
            )}
          </div>

          <div
            className={`${styles.statusWrapper} ${isStatusVisible ? styles.open : ""}`}
          >
            <div className={styles.overflowHidden}>
              {status.type && (
                <ChamferBox
                  bg={
                    status.type === "error"
                      ? "var(--accent-secondary)"
                      : "var(--accent)"
                  }
                  noPadding
                  borderColor={
                    status.type === "error"
                      ? "var(--accent-secondary)"
                      : "var(--accent)"
                  }
                >
                  <div className={styles.statusBox}>
                    {status.type === "success" ? (
                      <CheckCircle size={20} color="var(--text-on-accent)" />
                    ) : (
                      <AlertCircle size={20} color="var(--text-on-accent)" />
                    )}
                    <span className={styles.message}>{status.message}</span>
                  </div>
                </ChamferBox>
              )}
            </div>
          </div>

          <ChamferBox
            cutSize={15}
            bg="var(--accent)"
            hoverEffect
            noPadding
            className={`${styles.submitBtnContainer} ${isSubmitting ? styles.disabled : ""}`}
            onClick={() => !isSubmitting && handleContact()}
          >
            <button
              type="button"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              <Send size={18} />
              {isSubmitting
                ? t("contact.sendingButton")
                : t("contact.sendButton")}
            </button>
          </ChamferBox>
        </form>
      </ChamferBox>
    </section>
  );
};

export default Contact;
