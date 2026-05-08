"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Menu, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchBox } from "@/components/search-box";
import { cn } from "@/lib/utils";

type NavLink = { href: string; key: "dashboard" | "blocks" | "transactions" };

const LINKS: NavLink[] = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/blocks", key: "blocks" },
  { href: "/transactions", key: "transactions" },
];

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <Link2
              className="size-5 -rotate-45 text-primary"
              aria-hidden="true"
            />
            <span>
              BLOCKCHAIN<span className="text-primary">UZ</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors",
                  isActive(link.href)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBox className="max-w-md" compact />
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" aria-label={t("openMenu")} />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-0 p-0">
              <SheetHeader>
                <SheetTitle>{t("menu")}</SheetTitle>
              </SheetHeader>
              <div className="border-b px-4 pb-4">
                <SearchBox compact />
              </div>
              <nav className="flex flex-col gap-1 px-4 py-4 text-sm">
                {LINKS.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-2 hover:bg-muted",
                          isActive(link.href) && "bg-muted font-medium",
                        )}
                      />
                    }
                  >
                    {t(link.key)}
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex items-center gap-2 border-t p-4">
                <LanguageSwitcher />
                <span className="text-sm text-muted-foreground">{t("language")}</span>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
