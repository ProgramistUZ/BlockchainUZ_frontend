"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled route error", error);
    }
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <AlertCircleIcon className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            {t("reference")}: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}
