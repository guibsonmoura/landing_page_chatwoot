"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

export type HeaderState = {
  title: string;
  subtitle?: string;
};

export type HeaderContextValue = HeaderState & {
  setHeader: (state: HeaderState) => void;
  resetHeader: () => void;
};

const defaultState: HeaderState = {
  title: "Dashboard",
  subtitle: "Visão geral da sua agência de IA",
};

const HeaderContext = createContext<HeaderContextValue | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HeaderState>(defaultState);

  const setHeader = useCallback((next: HeaderState) => {
    setState({
      title: next.title || defaultState.title,
      subtitle: next.subtitle ?? defaultState.subtitle,
    });
  }, []);

  const resetHeader = useCallback(() => setState(defaultState), []);

  const value = useMemo<HeaderContextValue>(() => ({
    ...state,
    setHeader,
    resetHeader,
  }), [state, setHeader, resetHeader]);

  return <HeaderContext.Provider value={value}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const ctx = useContext(HeaderContext);
  if (!ctx) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return ctx;
}
