import { Suspense, lazy } from "react";
import MainContent from "./mainContent";
import { useUiMode } from "./ui-switch/useUiMode";
import { useUiTransition } from "./ui-switch/useUiTransition";
import TransitionOverlay from "./ui-switch/TransitionOverlay.component";
import transitionStyles from "./ui-switch/transition.module.scss";

const Terminal = lazy(() => import("./terminal"));

const HomeShell = () => {
  const { mode, setMode } = useUiMode();
  const { phase, direction, requestSwitch } = useUiTransition({ setMode });

  const rootClassName =
    phase === "corrupt"
      ? transitionStyles.corrupting
      : phase === "arrive"
        ? transitionStyles.arriving
        : phase === "void" || phase === "boot"
          ? transitionStyles.hiddenBehindOverlay
          : undefined;

  return (
    <>
      <div className={rootClassName}>
        {mode === "terminal" ? (
          <Suspense fallback={<div style={{ background: "#050107", height: "100vh" }} />}>
            <Terminal onSwitchToClassic={() => requestSwitch("classic")} />
          </Suspense>
        ) : (
          <MainContent onSwitchToTerminal={() => requestSwitch("terminal")} />
        )}
      </div>
      {phase !== "idle" && <TransitionOverlay phase={phase} direction={direction} />}
    </>
  );
};

export default HomeShell;
