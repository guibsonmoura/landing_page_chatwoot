"use client";

import { useEffect } from "react";
import { useHeader } from "@/components/layout/HeaderContext";

export function HeaderSetter({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setHeader, resetHeader } = useHeader();

  useEffect(() => {
    setHeader({ title, subtitle });
    return () => {
      // Reset to defaults when leaving the page/component
      resetHeader();
    };
  }, [title, subtitle, setHeader, resetHeader]);

  return null;
}
