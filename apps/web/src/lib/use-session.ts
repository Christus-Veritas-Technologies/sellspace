"use client";

import { useMemo } from "react";

export function useSession() {
  const isAuthenticated = useMemo(() => {
    if (typeof document === "undefined") return false;
    return document.cookie.split(";").some((c) => c.trim().startsWith("ss_has_session="));
  }, []);

  return { isAuthenticated };
}
