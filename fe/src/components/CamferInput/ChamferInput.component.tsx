import { useState } from "react";
import styles from "./ChamferInput.module.scss";
import ChamferBox from "../CamferBox/ChamferBox.component";

interface ChamferInputProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  icon?: React.ReactNode;
  label: string;
  as?: "input" | "textarea";
  rows?: number;
}

const ChamferInput: React.FC<ChamferInputProps> = ({
  icon,
  label,
  as = "input",
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <ChamferBox
        cutSize={15}
        borderColor={isFocused ? "var(--accent)" : "#374151"}
        bg="#0f1115"
        noPadding
        className={styles.boxTransition}
      >
        <div className={styles.inputWrapper}>
          {as === "input" ? (
            <input
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
              className={styles.inputField}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          ) : (
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              className={`${styles.inputField} ${styles.textarea}`}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          )}
          {icon && (
            <div
              className={`${styles.iconWrapper} ${
                isFocused ? styles.iconFocused : ""
              }`}
            >
              {icon}
            </div>
          )}
        </div>
      </ChamferBox>
    </div>
  );
};

export default ChamferInput;
