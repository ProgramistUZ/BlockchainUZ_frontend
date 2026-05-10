"use client";

import { useEffect } from "react";

type Modifier = "meta" | "ctrl" | "meta-or-ctrl";

type Options = {
  modifier?: Modifier;
  /**
   * When true, the shortcut still fires while focus is inside an input/textarea.
   * Defaults to false — protects against hijacking typing.
   */
  allowInInputs?: boolean;
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

const matchesModifier = (e: KeyboardEvent, mod?: Modifier): boolean => {
  switch (mod) {
    case "meta":
      return e.metaKey;
    case "ctrl":
      return e.ctrlKey;
    case "meta-or-ctrl":
      return e.metaKey || e.ctrlKey;
    case undefined:
      return !e.metaKey && !e.ctrlKey && !e.altKey;
  }
};

export function useKeyboardShortcut(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: Options = {},
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== key) return;
      if (!matchesModifier(e, options.modifier)) return;
      if (!options.allowInInputs && isTypingTarget(e.target)) return;
      handler(e);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, options.modifier, options.allowInInputs]);
}
