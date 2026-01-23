import { useState } from "react";
import ChamferBox from "../CamferBox/ChamferBox.component";
import styles from "./Accordion.module.scss";
import { CalendarIcon, MapPin } from "lucide-react";

interface AccordionProps {
  title: string;
  subtitle: string;
  date?: string;
  where?: string;
  tags?: string[];
  children: React.ReactNode;
  icon?: React.ReactNode;
  sideAction?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  subtitle,
  date,
  where,
  tags,
  children,
  icon,
  sideAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <ChamferBox
        cutSize={15}
        className={styles.chamferBox}
        bg={isOpen ? "#232730" : "var(--bg-card)"}
        noPadding
      >
        {/* Header Section */}
        <div
          className={`${styles.header} ${isOpen ? styles.open : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.headerLeft}>
            {icon && <div className={styles.icon}>{icon}</div>}
            <div>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.subtitle}>{subtitle}</p>
              {date && (
                <div className={styles.date}>
                  <CalendarIcon /> {date}
                </div>
              )}
              {where && (
                <div className={styles.date}>
                  <MapPin /> {where}
                </div>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            {sideAction && (
              <div onClick={(e) => e.stopPropagation()}>{sideAction}</div>
            )}
            <div
              className={`${styles.chevronWrapper} ${isOpen ? styles.open : ""}`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div
          className={`${styles.contentWrapper} ${isOpen ? styles.open : ""}`}
        >
          <div className={styles.contentInner}>
            <div className={styles.contentBody}>
              <div className={styles.bodyText}>{children}</div>
              {tags && (
                <div className={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </ChamferBox>
    </div>
  );
};

export default Accordion;
