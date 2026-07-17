"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Hero panel theme: "cookie" = confitería (green), "pencil" = papelería (pink). */
export type HeroMode = "cookie" | "pencil";

const HeroModeCtx = createContext<{
  mode: HeroMode;
  setMode: (m: HeroMode) => void;
}>({ mode: "cookie", setMode: () => {} });

/**
 * Single source of truth for the home's cookie/pencil mode. Shared across the
 * hero (panel background, wordmark, corner pills, overlay-header chips) AND the
 * "Destacados" showcase (department filter + its own toggle) — toggling in
 * either place keeps both in sync. Provided high in AppShell so those separate
 * subtrees read the same state. Resets to "cookie" on every load; not persisted.
 * Only the hero and Destacados react to it; no other section.
 */
export function HeroModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HeroMode>("cookie");
  return (
    <HeroModeCtx.Provider value={{ mode, setMode }}>
      {children}
    </HeroModeCtx.Provider>
  );
}

export function useHeroMode() {
  return useContext(HeroModeCtx);
}
