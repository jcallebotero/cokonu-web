"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/** Hero panel theme: "cookie" = confitería (green), "pencil" = papelería (pink). */
export type HeroMode = "cookie" | "pencil";

const HeroModeCtx = createContext<{
  mode: HeroMode;
  setMode: (m: HeroMode) => void;
}>({ mode: "cookie", setMode: () => {} });

/**
 * Shares the hero's cookie/pencil mode between the panel (background, wordmark,
 * corner pills) and the integrated overlay header (chip tints), which live in
 * separate subtrees under AppShell. Resets to "cookie" on every load — it's
 * hero-local UI state, not persisted.
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
