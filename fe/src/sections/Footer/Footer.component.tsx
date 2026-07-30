import styles from "./Footer.module.scss";
import { SOCIAL_LINKS } from "@/content/profile";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.copyright}>
          © 2026 Bernáth Márk bence. All systems nominal.
        </div>
        <div className={styles.footerLinks}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              className={styles.footerLink}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
