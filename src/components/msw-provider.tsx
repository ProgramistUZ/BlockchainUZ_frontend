"use client";

import { useEffect, useState } from "react";
import { env } from "@/lib/env";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!env.NEXT_PUBLIC_USE_MOCKS) {
      setReady(true);
      return;
    }

    import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass" }),
    ).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
