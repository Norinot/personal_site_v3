import { useEffect, useRef, useState } from "react";
import styles from "./SwitchButton.module.scss";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01アカサタナ";

function scrambledLike(text: string, revealCount: number): string {
  return text
    .split("")
    .map((ch, i) => {
      if (ch === " ") return " ";
      if (i < revealCount) return ch;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}

interface SwitchButtonProps {
  /** The true, stable label — used as both the accessible name and the resting visual text. */
  label: string;
  onActivate: () => void;
}

/**
 * The switch between the two UIs. Deliberately looks like it doesn't belong on
 * either page — an idle character-scramble every few seconds, an RGB-split /
 * scanline "armed" look on hover, a hard press feel on activation.
 */
const SwitchButton = ({ label, onActivate }: SwitchButtonProps) => {
  const [displayText, setDisplayText] = useState(label);
  const busyRef = useRef(false);
  const reduced = useRef(
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current;

  useEffect(() => {
    setDisplayText(label);
    if (reduced) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    let frameTimer: ReturnType<typeof setInterval>;

    const scheduleIdleScramble = () => {
      const delay = 4000 + Math.random() * 3000;
      idleTimer = setTimeout(() => {
        let frame = 0;
        const totalFrames = 8;
        frameTimer = setInterval(() => {
          frame++;
          const revealCount = Math.floor((frame / totalFrames) * label.length);
          setDisplayText(frame >= totalFrames ? label : scrambledLike(label, revealCount));
          if (frame >= totalFrames) {
            clearInterval(frameTimer);
            scheduleIdleScramble();
          }
        }, 40);
      }, delay);
    };

    scheduleIdleScramble();
    return () => {
      clearTimeout(idleTimer);
      clearInterval(frameTimer);
    };
  }, [label, reduced]);

  const handleClick = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    onActivate();
    setTimeout(() => {
      busyRef.current = false;
    }, 400);
  };

  return (
    <button type="button" className={styles.btn} aria-label={label} onClick={handleClick}>
      <span className={styles.face}>
        <span className={styles.label} aria-hidden="true">
          {displayText}
        </span>
      </span>
    </button>
  );
};

export default SwitchButton;
