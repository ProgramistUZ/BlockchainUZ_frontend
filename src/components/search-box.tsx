"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { classifySearch, routeForSearch } from "@/lib/search";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  initialValue?: string;
  compact?: boolean;
};

export function SearchBox({ className, initialValue = "", compact = false }: Props) {
  const t = useTranslations("search");
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const kind = classifySearch(value);
    const route = routeForSearch(kind);
    if (route) {
      router.push(route);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
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
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className={cn(
          "pl-8 font-mono text-xs placeholder:font-sans placeholder:text-muted-foreground",
          compact ? "h-8" : "h-9",
        )}
      />
    </form>
  );
}
