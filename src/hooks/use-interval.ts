"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `callback` every `delay` ms. Pauses when the tab is hidden.
 * Set `delay` to null to disable.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    let id: number | null = null;
    const start = () => {
      stop();
      id = window.setInterval(() => saved.current(), delay);
    };
    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    if (typeof document === "undefined" || !document.hidden) start();

    function onVisibilityChange() {
      if (document.hidden) stop();
      else {
        saved.current();
        start();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [delay]);
}
