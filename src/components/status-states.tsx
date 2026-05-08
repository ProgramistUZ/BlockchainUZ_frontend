"use client";

import { AlertCircle, Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ title, message, onRetry, className }: ErrorStateProps) {
  const t = useTranslations("common");
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center",
        className,
      )}
    >
      <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center",
        className,
      )}
    >
      <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
