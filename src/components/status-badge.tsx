"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/types/api";

const variants: Record<
  TransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  FAILED: "destructive",
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const t = useTranslations("status");
  return (
    <Badge variant={variants[status]} className="font-medium uppercase tracking-wide">
      {t(status)}
    </Badge>
  );
}
