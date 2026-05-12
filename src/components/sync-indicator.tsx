"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { useInterval } from "@/hooks/use-interval";
import { getSyncStatus } from "@/services/api";
import { cn } from "@/lib/utils";

/**
 * Small footer badge showing how far the indexer is behind the chain head.
 * Stays silent while loading — no skeleton — since it's non-critical UI.
 */
export function SyncIndicator({ className }: { className?: string }) {
  const t = useTranslations("sync");

  const load = useCallback(() => getSyncStatus(), []);
  const { data, error, refresh } = useAsyncResource(load, []);

  useInterval(refresh, 30_000);

  if (error || !data) return null;

  const synced = data.isFullySynced ?? data.fullySynced ?? false;
  const disabled = !data.syncEnabled;

  return (
    <span
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        disabled
          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : synced
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        className,
      )}
      title={t("tooltip", {
        db: data.latestDatabaseBlock,
        chain: data.latestBlockchainBlock,
      })}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          disabled
            ? "bg-amber-500"
            : synced
              ? "bg-emerald-500"
              : "bg-sky-500",
        )}
        aria-hidden="true"
      />
      {disabled
        ? t("disabled")
        : synced
          ? t("synced")
          : t("behind", { n: data.blocksBehind })}
    </span>
  );
}
