import { useTranslation } from "react-i18next";
import ChamferBox from "@/components/CamferBox/ChamferBox.component";
import type { TransitionPhase } from "./useUiTransition";
import type { UiMode } from "./useUiMode";
import styles from "./transition.module.scss";

interface TransitionOverlayProps {
  phase: TransitionPhase;
  direction: UiMode;
}

/**
 * The one full-screen component that owns beats 2-4 of the switch transition
 * (beat 1's corruption lives on the outgoing root itself, see transition.module.scss).
 * Mounted for the whole ~1.6s sequence and unmounted the moment phase returns to idle
 * — nothing about it should outlive the transition.
 */
const TransitionOverlay = ({ phase, direction }: TransitionOverlayProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay} data-phase={phase} aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="ui-switch-rgb-split" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r"
            />
            <feOffset in="r" dx="-3" dy="0" result="rOff" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="g"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="b"
            />
            <feOffset in="b" dx="3" dy="0" result="bOff" />
            <feBlend in="rOff" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="bOff" mode="screen" />
          </filter>
        </defs>
      </svg>

      {(phase === "void" || phase === "boot") && <div className={styles.static} />}

      {phase === "boot" && (
        <div className={styles.bootBox}>
          {direction === "terminal" ? (
            <div className={styles.terminalBoot}>
              {(["line1", "line2", "line3", "line4"] as const).map((key, i) => (
                <div
                  key={key}
                  className={styles.line}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {t(`terminal.boot.${key}`)}
                </div>
              ))}
              <div className={styles.bar}>
                <div className={styles.barFill} />
              </div>
            </div>
          ) : (
            <div className={styles.classicBoot}>
              <ChamferBox cutSize={12} bg="rgba(11,10,20,0.85)" borderColor="rgba(0,240,255,0.4)" noPadding>
                <div style={{ padding: "18px 22px" }}>
                  <div className={styles.label}>{t("uiSwitch.reconnecting")}</div>
                  <div className={styles.bar}>
                    <div className={styles.barFill} />
                  </div>
                </div>
              </ChamferBox>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransitionOverlay;
