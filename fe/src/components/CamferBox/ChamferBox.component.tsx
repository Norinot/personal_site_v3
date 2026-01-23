import React from "react";
import styles from "./ChamferBox.module.scss";

interface ChamferBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: "chamfer" | "bevel";
  cutSize?: number;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  onClick?: () => void;
  hoverEffect?: boolean;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

const ChamferBox = ({
  children,
  className = "",
  variant = "chamfer",
  cutSize = 20,
  bg = "var(--bg-card)",
  borderColor,
  borderWidth = 1,
  onClick,
  hoverEffect = false,
  noPadding = false,
  style = {},
}: ChamferBoxProps) => {
  const cssVars = {
    "--requested-cut-size": `${cutSize}px`,
    ...style,
  } as React.CSSProperties;

  const shapeClass = variant === "chamfer" ? styles.chamfer : styles.bevel;
  const hoverClass = hoverEffect ? styles.hoverEffect : "";
  const cursorClass = onClick ? styles.clickable : "";
  const paddingClass = !noPadding ? styles.padded : "";

  const baseClasses = `${styles.box} ${shapeClass} ${hoverClass} ${cursorClass} ${className}`;

  if (borderColor) {
    return (
      <div
        className={baseClasses}
        onClick={onClick}
        style={{
          ...cssVars,
          backgroundColor: borderColor,
          padding: `${borderWidth}px`,
        }}
      >
        <div
          className={`${styles.innerContent} ${shapeClass} ${paddingClass}`}
          style={{
            backgroundColor: bg,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${paddingClass}`}
      onClick={onClick}
      style={{
        ...cssVars,
        backgroundColor: bg,
      }}
    >
      {children}
    </div>
  );
};

export default ChamferBox;
