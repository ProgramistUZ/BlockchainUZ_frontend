"use client";

import { Link } from "@/i18n/navigation";
import { truncateHex } from "@/lib/format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Variant = "tx" | "block" | "wallet";

type Props = {
  value: string;
  variant: Variant;
  head?: number;
  tail?: number;
  className?: string;
};

function hrefFor(variant: Variant, value: string): string {
  switch (variant) {
    case "tx":
      return `/tx/${value}`;
    case "block":
      return `/blocks/${value}`;
    case "wallet":
      return `/wallets/${value}`;
  }
}

export function HashLink({ value, variant, head, tail, className }: Props) {
  const shown = truncateHex(value, head ?? 6, tail ?? 4);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={hrefFor(variant, value)}
            className={cn(
              "font-mono text-muted-foreground hover:text-primary hover:underline underline-offset-2",
              className,
            )}
          />
        }
      >
        {shown}
      </TooltipTrigger>
      <TooltipContent className="font-mono text-xs">{value}</TooltipContent>
    </Tooltip>
  );
}
