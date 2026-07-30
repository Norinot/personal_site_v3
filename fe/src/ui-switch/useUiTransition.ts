import { useCallback, useRef, useState } from "react";
import type { UiMode } from "./useUiMode";

export type TransitionPhase = "idle" | "corrupt" | "void" | "boot" | "arrive";

// Beat timings from the brief. Tune by eye, not by spec — durations here must
// match the .corrupting / .arriving animation-durations in transition.module.scss,
// since the phase timer is what swaps the CSS class off at the end of each beat.
const BEATS: { phase: TransitionPhase; duration: number }[] = [
  { phase: "corrupt", duration: 1050 },
  { phase: "void", duration: 150 },
  { phase: "boot", duration: 700 },
  { phase: "arrive", duration: 400 },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function stopAllAudio() {
  document.querySelectorAll("audio").forEach((audio) => {
    audio.pause();
  });
}

function preload(target: UiMode) {
  if (target === "terminal") {
    import("@/terminal").catch(() => {});
  }
}

interface UseUiTransitionArgs {
  setMode: (mode: UiMode) => void;
}

export function useUiTransition({ setMode }: UseUiTransitionArgs) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<UiMode>("terminal");

  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const skipHandlerRef = useRef<((e: Event) => void) | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  const detachSkipListeners = () => {
    if (skipHandlerRef.current) {
      document.removeEventListener("click", skipHandlerRef.current, true);
      document.removeEventListener("keydown", skipHandlerRef.current, true);
      skipHandlerRef.current = null;
    }
  };

  const finish = useCallback(() => {
    clearTimers();
    detachSkipListeners();
    document.body.style.overflow = "";
    setPhase("idle");
    busyRef.current = false;
  }, []);

  const requestSwitch = useCallback(
    (target: UiMode) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setDirection(target);
      stopAllAudio();
      preload(target);

      const reduced = matchMedia(REDUCED_MOTION_QUERY).matches;

      if (reduced) {
        setMode(target);
        setPhase("arrive");
        const id = window.setTimeout(finish, 150);
        timersRef.current.push(id);
        return;
      }

      document.body.style.overflow = "hidden";
      setPhase("corrupt");

      let swapped = false;
      const jumpToEnd = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (!swapped) {
          swapped = true;
          setMode(target);
        }
        finish();
      };
      skipHandlerRef.current = jumpToEnd;
      // Attach on the next frame so the click that started the switch doesn't
      // immediately trip the skip listener too.
      requestAnimationFrame(() => {
        if (skipHandlerRef.current === jumpToEnd) {
          document.addEventListener("click", jumpToEnd, true);
          document.addEventListener("keydown", jumpToEnd, true);
        }
      });

      // BEATS[0] ("corrupt") already started synchronously above. Each subsequent
      // beat should begin exactly when the previous one's duration elapses — so the
      // cumulative delay for BEATS[i] is the sum of durations[0..i-1], not [0..i].
      let acc = 0;
      for (let i = 1; i < BEATS.length; i++) {
        acc += BEATS[i - 1].duration;
        const atPhase = BEATS[i].phase;
        const id = window.setTimeout(() => {
          if (atPhase === "void" && !swapped) {
            swapped = true;
            setMode(target);
          }
          setPhase(atPhase);
        }, acc);
        timersRef.current.push(id);
      }
      acc += BEATS[BEATS.length - 1].duration;
      const endId = window.setTimeout(finish, acc);
      timersRef.current.push(endId);
    },
    [setMode, finish],
  );

  return { phase, direction, requestSwitch };
}
