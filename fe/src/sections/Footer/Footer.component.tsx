import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.copyright}>
          © 2026 Bernáth Márk bence. All systems nominal.
        </div>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/Norinot"
            target="_blank"
            className={styles.footerLink}
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/bernath-mark-bence/"
            target="_blank"
            className={styles.footerLink}
          >
            LinkedIn
          </a>
          <a
            href="https://soundcloud.com/bence-ber"
            target="_blank"
            className={styles.footerLink}
          >
            SoundCloud
          </a>
          <a
            href="https://open.spotify.com/artist/6mdH9R4KsdLJzfu6hAOd7F"
            target="_blank"
            className={styles.footerLink}
          >
            Spotify
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
