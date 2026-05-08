"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { classifySearch, routeForSearch } from "@/lib/search";
import { saveRecentSearch } from "@/lib/recent-searches";
import { Input } from "@/components/ui/input";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { cn } from "@/lib/utils";

export const GLOBAL_SEARCH_ID = "global-search-input";

type Props = {
  className?: string;
  initialValue?: string;
  compact?: boolean;
  /**
   * When true (exactly one instance per page), registers the `/` shortcut
   * that focuses this input from anywhere on the page.
   */
  primary?: boolean;
};

export function SearchBox({
  className,
  initialValue = "",
  compact = false,
  primary = false,
}: Props) {
  const t = useTranslations("search");
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useKeyboardShortcut("/", (e) => {
    if (!primary) return;
    e.preventDefault();
    inputRef.current?.focus();
    inputRef.current?.select();
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    const kind = classifySearch(trimmed);
    const route = routeForSearch(kind);
    router.push(route ?? `/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative flex w-full items-center", className)}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        id={primary ? GLOBAL_SEARCH_ID : undefined}
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className={cn(
          "pl-8 pr-10 font-mono text-xs placeholder:font-sans placeholder:text-muted-foreground",
          compact ? "h-8" : "h-9",
        )}
      />
      {primary && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2 hidden items-center gap-0.5 rounded border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex"
        >
          /
        </kbd>
      )}
    </form>
  );
}
