import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/clerk-react";
import styles from "./Terminal.module.scss";
import { PROFILE, SOCIAL_LINKS } from "@/content/profile";

export function ContactInfo() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.ln} style={{ marginBottom: 12 }}>
        {t("contact.subtitle")}
      </div>
      <dl style={{ maxWidth: 440 }}>
        <div className={styles.row}>
          <dt>email</dt>
          <dd>
            <a className={styles.f} href={`mailto:${PROFILE.email}`} style={{ textDecoration: "none" }}>
              {PROFILE.email}
            </a>
          </dd>
        </div>
        <div className={styles.row}>
          <dt>phone</dt>
          <dd>{PROFILE.phone}</dd>
        </div>
        {SOCIAL_LINKS.map((link) => (
          <div key={link.label} className={styles.row}>
            <dt>{link.label.toLowerCase()}</dt>
            <dd>
              <a className={styles.f} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                {link.url.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        ))}
      </dl>
      <div className={`${styles.ln} ${styles.c}`} style={{ marginTop: 14 }}>
        {t("terminal.contact.hint")}
      </div>
    </>
  );
}

interface FormState {
  email: string;
  subject: string;
  message: string;
}

export function MessageForm() {
  const { t } = useTranslation();
  const { getToken } = useAuth();
  const [form, setForm] = useState<FormState>({ email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const next: Partial<FormState> = {};
    if (!form.email.trim()) next.email = t("contact.errors.required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t("contact.errors.invalidEmail");
    if (!form.subject.trim()) next.subject = t("contact.errors.required");
    if (!form.message.trim()) next.message = t("contact.errors.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const token = await getToken();
      const response = await fetch("/contact", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Server response was not ok");
      setStatus({ type: "success", message: t("contact.successMessage") });
      setForm({ email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submission error", error);
      setStatus({ type: "error", message: t("contact.errorMessage") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.case} style={{ maxWidth: 460 }}>
      <div className={styles.field}>
        <label htmlFor="terminal-msg-email">{t("contact.emailLabel")}</label>
        <input
          id="terminal-msg-email"
          type="email"
          placeholder={t("contact.emailPlaceholder")}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        {errors.email && <span className={styles.e}>{errors.email}</span>}
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-msg-subject">{t("contact.subjectLabel")}</label>
        <input
          id="terminal-msg-subject"
          placeholder={t("contact.subjectPlaceholder")}
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
        />
        {errors.subject && <span className={styles.e}>{errors.subject}</span>}
      </div>
      <div className={styles.field}>
        <label htmlFor="terminal-msg-message">{t("contact.messageLabel")}</label>
        <textarea
          id="terminal-msg-message"
          rows={4}
          placeholder={t("contact.messagePlaceholder")}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
        />
        {errors.message && <span className={styles.e}>{errors.message}</span>}
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btn} disabled={submitting} onClick={submit}>
          {submitting ? t("contact.sendingButton") : t("contact.sendButton")}
        </button>
      </div>
      {status && (
        <div className={`${styles.ln} ${status.type === "error" ? styles.e : styles.s}`} style={{ marginTop: 10 }}>
          {status.message}
        </div>
      )}
    </div>
  );
}
