import { useCallback, useState } from "react";

export type UiMode = "classic" | "terminal";

const STORAGE_KEY = "ui-mode";

function readStoredMode(): UiMode {
  return localStorage.getItem(STORAGE_KEY) === "terminal" ? "terminal" : "classic";
}

export function useUiMode() {
  const [mode, setModeState] = useState<UiMode>(readStoredMode);

  const setMode = useCallback((next: UiMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "classic" ? "terminal" : "classic");
  }, [mode, setMode]);

  return { mode, setMode, toggle };
}
