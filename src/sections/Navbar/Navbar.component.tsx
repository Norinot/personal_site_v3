import styles from "./Navbar.module.scss";
import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import NavButton from "@/components/NavButton/NavButton.component";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  activeSection: string;
  scrollTo: (id: string) => void;
}

const Navbar = ({ activeSection, scrollTo }: NavbarProps) => {
  const { i18n, t } = useTranslation();

  const currentLangLabel = i18n.language ? i18n.language.toUpperCase() : "EN";
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang.toLowerCase());
    setIsLangMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.backgroundLayer}>
        <ChamferBox
          variant="bevel"
          cutSize={30}
          bg="rgba(16, 21, 15, 0.95)"
          className={styles.headerInner}
          noPadding
          style={{ width: "100%", height: "100%" }}
        >
          <div style={{ width: "100%", height: "100%" }} />
        </ChamferBox>
      </div>

      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <div
            className={`chamfer-box ${styles.logoBox}`}
            style={{ "--cut-size": "8px" } as any}
          ></div>
          Norinot
        </div>

        <nav className={styles.navLinks}>
          {[
            { id: "hero", translationKey: "nav.about" },
            { id: "skills", translationKey: "nav.skills" },
            { id: "projects", translationKey: "nav.projects" },
            { id: "services", translationKey: "nav.services" },
            { id: "hobbies", translationKey: "nav.hobbies" },
          ].map((item) => (
            <NavButton
              key={item.id}
              label={t(item.translationKey)}
              onClick={() => scrollTo(item.id)}
              active={activeSection === item.id}
            />
          ))}
        </nav>
        <div className={styles.wrapper}>
          <div className={styles.langWrapper}>
            <div className={styles.dropdownContainer}>
              <ChamferBox
                cutSize={10}
                bg="rgba(255,255,255,0.05)"
                borderColor="rgba(255,255,255,0.1)"
                hoverEffect
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                noPadding
              >
                <div className={styles.triggerBtn}>
                  <div className={styles.currentLang}>
                    <Globe size={16} />
                    <span className={styles.langLabel}>{currentLangLabel}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`${styles.chevron} ${isLangMenuOpen ? styles.open : ""}`}
                  />
                </div>
              </ChamferBox>

              {isLangMenuOpen && (
                <div className={styles.menuPosition}>
                  <ChamferBox
                    cutSize={10}
                    bg="#181b21"
                    borderColor="rgba(255,255,255,0.1)"
                    noPadding
                  >
                    <div className={styles.menuList}>
                      {["en", "hu"].map((lang) => (
                        <div
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`${styles.menuItem} ${
                            i18n.language === lang ? styles.active : ""
                          }`}
                        >
                          {lang.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </ChamferBox>
                </div>
              )}
            </div>
          </div>

          <div className={styles.contactBtnWrapper}>
            <ChamferBox
              cutSize={10}
              bg="var(--accent)"
              hoverEffect
              onClick={() => scrollTo("contact")}
              noPadding
            >
              <div className={styles.contactBtnText}>{t("nav.contactMe")}</div>
            </ChamferBox>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
