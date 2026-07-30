import { Suspense, lazy } from "react";
import MainContent from "./mainContent";
import { useUiMode } from "./ui-switch/useUiMode";

const Terminal = lazy(() => import("./terminal"));

const HomeShell = () => {
  const { mode, toggle } = useUiMode();

  if (mode === "terminal") {
    return (
      <Suspense fallback={null}>
        <Terminal onSwitchToClassic={toggle} />
      </Suspense>
    );
  }

  return <MainContent onSwitchToTerminal={toggle} />;
};

export default HomeShell;
