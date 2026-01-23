import React from "react";
import styles from "./NavButton.module.scss";

interface NavButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`${styles.navBtn} ${active ? styles.active : ""}`}
  >
    {label}
  </button>
);

export default NavButton;
