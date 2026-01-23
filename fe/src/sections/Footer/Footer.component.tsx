import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.copyright}>
          © 2026 Bernáth Márk bence. All systems nominal.
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>
            GitHub
          </a>
          <a href="#" className={styles.footerLink}>
            LinkedIn
          </a>
          <a href="#" className={styles.footerLink}>
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
