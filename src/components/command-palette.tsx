"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Blocks,
  Clock,
  LayoutDashboard,
  Languages,
  MoonIcon,
  Receipt,
  SunIcon,
  LaptopIcon,
  ArrowRight,
} from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { classifySearch, routeForSearch } from "@/lib/search";
import { truncateHex } from "@/lib/format";
import {
  loadRecentSearches,
  saveRecentSearch,
} from "@/lib/recent-searches";

export function CommandPalette() {
  const t = useTranslations("commandPalette");
  const tn = useTranslations("nav");
  const tt = useTranslations("theme");
  const tl = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(loadRecentSearches());
  }, [open]);

  useKeyboardShortcut(
    "k",
    (e) => {
      e.preventDefault();
      setOpen((prev) => !prev);
    },
    { modifier: "meta-or-ctrl", allowInInputs: true },
  );

  const classified = useMemo(() => classifySearch(query), [query]);

  const handleSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      saveRecentSearch(trimmed);
      const kind = classifySearch(trimmed);
      const route = routeForSearch(kind);
      router.push(route ?? `/search?q=${encodeURIComponent(trimmed)}`);
      setOpen(false);
      setQuery("");
    },
    [router],
  );

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
      setQuery("");
    },
    [router],
  );

  const swapLocale = useCallback(() => {
    const newLocale = pathname.startsWith("/en") ? "pl" : "en";
    router.replace(pathname, { locale: newLocale as "pl" | "en" });
    setOpen(false);
  }, [router, pathname]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={t("title")}>
      <CommandInput
        placeholder={t("placeholder")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{t("empty")}</CommandEmpty>

        {query && classified.kind !== "empty" && classified.kind !== "invalid" && (
          <CommandGroup heading={t("goto")}>
            <CommandItem value={`search-${query}`} onSelect={() => handleSearch(query)}>
              <ArrowRight />
              <span className="truncate">{query}</span>
              <CommandShortcut>↵</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading={t("navigation")}>
          <CommandItem onSelect={() => handleNavigate("/dashboard")}>
            <LayoutDashboard />
            <span>{tn("dashboard")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/blocks")}>
            <Blocks />
            <span>{tn("blocks")}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/transactions")}>
            <Receipt />
            <span>{tn("transactions")}</span>
          </CommandItem>
        </CommandGroup>

        {recent.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("recent")}>
              {recent.map((q) => (
                <CommandItem
                  key={q}
                  value={`recent-${q}`}
                  onSelect={() => handleSearch(q)}
                >
                  <Clock />
                  <span className="font-mono text-xs">
                    {q.startsWith("0x") ? truncateHex(q, 10, 8) : q}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading={t("preferences")}>
          <CommandItem value="theme-light" onSelect={() => setTheme("light")}>
            <SunIcon />
            <span>{tt("light")}</span>
          </CommandItem>
          <CommandItem value="theme-dark" onSelect={() => setTheme("dark")}>
            <MoonIcon />
            <span>{tt("dark")}</span>
          </CommandItem>
          <CommandItem value="theme-system" onSelect={() => setTheme("system")}>
            <LaptopIcon />
            <span>{tt("system")}</span>
          </CommandItem>
          <CommandItem value="locale-swap" onSelect={swapLocale}>
            <Languages />
            <span>{tl("switchLanguage")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
