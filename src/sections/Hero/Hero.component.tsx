import styles from "./Hero.module.scss";
import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import portrait from "@/assets/portrait.jpg";
import { useTranslation } from "react-i18next";

interface HeroProps {
  scrollTo: (id: string) => void;
}

const Hero = ({ scrollTo }: HeroProps) => {
  const { t } = useTranslation();

  return (
    <section id="hero" className={styles.heroSection}>
      <div className={styles.heroGrid}>
        <div className={styles.heroImageColumn}>
          <div className={styles.heroImageWrapper}>
            <div
              className={`chamfer-box ${styles.profileMask}`}
              style={
                { "--cut-size": "30px", backgroundColor: "#4b5563" } as any
              }
            >
              <img src={portrait} alt="Profile" className={styles.profileImg} />
            </div>
            <div
              className={`chamfer-box ${styles.profileBorder}`}
              style={{ "--cut-size": "30px" } as any}
            ></div>
          </div>
        </div>

        <div className={styles.heroContentColumn}>
          <ChamferBox cutSize={40} borderColor="rgba(0, 240, 255, 0.1)">
            <div className={styles.heroTexts}>
              <div>
                <h3 className={styles.greeting}>{t("hero.hi")}</h3>
                <h1 className={styles.mainHeadline}>
                  {t("hero.firstName")}
                  <br />
                  {t("hero.lastName")}
                </h1>
                <p className={styles.introText}>{t("hero.description")}</p>
              </div>

              <div className={styles.ctaRow}>
                <ChamferBox
                  cutSize={15}
                  bg="var(--accent)"
                  onClick={() => scrollTo("contact")}
                  hoverEffect
                  noPadding
                  className="inline-block"
                >
                  <div className={styles.hireBtnText}>{t("hero.hireMe")}</div>
                </ChamferBox>
                <ChamferBox
                  cutSize={15}
                  bg="var(--text-main)"
                  onClick={() => scrollTo("work")}
                  hoverEffect
                  noPadding
                  className="inline-block"
                >
                  <div className={styles.workBtnText}>{t("hero.viewWork")}</div>
                </ChamferBox>
              </div>
            </div>
          </ChamferBox>
        </div>
      </div>
    </section>
  );
};

export default Hero;
