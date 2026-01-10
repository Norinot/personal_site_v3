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
    "--cut-size": `${cutSize}px`,
    ...style,
  } as React.CSSProperties;

  const shapeClass = variant === "chamfer" ? styles.chamfer : styles.bevel;
  const hoverClass = hoverEffect ? styles.hoverEffect : "";
  const cursorClass = onClick ? styles.clickable : "";

  const containerClasses = `${styles.box} ${shapeClass} ${hoverClass} ${cursorClass} ${className}`;

  const contentPadding = noPadding
    ? "0"
    : variant === "chamfer"
      ? `1.5rem calc(${cutSize}px + 10px)`
      : `1.5rem 1rem calc(${cutSize}px + 1rem) 1rem`;

  if (borderColor) {
    return (
      <div
        className={containerClasses}
        onClick={onClick}
        style={{
          ...cssVars,
          backgroundColor: borderColor,
          padding: `${borderWidth}px`,
        }}
      >
        <div
          className={`${styles.innerContent} ${shapeClass}`}
          style={
            {
              "--cut-size": `${cutSize}px`,
              backgroundColor: bg,
              padding: contentPadding,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      style={{
        ...cssVars,
        backgroundColor: bg,
        padding: contentPadding,
      }}
    >
      {children}
    </div>
  );
};

export default ChamferBox;
