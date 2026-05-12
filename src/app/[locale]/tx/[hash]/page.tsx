"use client";

import { useCallback, use, useEffect } from "react";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState, EmptyState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { ApiError, getTransactionByHash } from "@/services/api";
import {
  formatEth,
  formatInt,
  formatRelative,
  formatTimestamp,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ hash: string; locale: string }>;
};

export default function TransactionDetailsPage({ params }: PageProps) {
  const { hash } = use(params);
  const t = useTranslations("txDetails");
  const tb = useTranslations("breadcrumbs");
  const locale = useLocale();

  const load = useCallback(() => getTransactionByHash(hash), [hash]);
  const { data: tx, error, loading } = useAsyncResource(load, [hash]);

  useEffect(() => {
    if (error instanceof ApiError && error.isNotFound) notFound();
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>{tb("home")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/transactions" />}>
              {tb("transactions")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-xs">
              {hash.slice(0, 10)}…
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        {t("title")}
      </h1>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <ErrorState message={t("loadError")} />
      ) : !tx ? (
        <EmptyState title={t("notFound")} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <Field label={t("fields.hash")} copy={tx.hash} fullWidth>
                <span className="font-mono break-all text-xs">{tx.hash}</span>
              </Field>
              <Field label={t("fields.status")}>
                <StatusBadge status={tx.status} />
              </Field>
              <Field label={t("fields.block")}>
                <Link
                  href={`/blocks/${tx.blockNumber}`}
                  className="font-mono text-primary hover:underline"
                >
                  #{formatInt(tx.blockNumber, locale)}
                </Link>
              </Field>
              <Field label={t("fields.from")} copy={tx.fromAddress} fullWidth>
                <Link
                  href={`/wallets/${tx.fromAddress}`}
                  className="font-mono break-all text-xs text-primary hover:underline"
                >
                  {tx.fromAddress}
                </Link>
              </Field>
              <Field
                label={t("fields.to")}
                copy={tx.toAddress ?? undefined}
                fullWidth
              >
                {renderToAddress(tx.toAddress, t)}
              </Field>
              <Field label={t("fields.value")}>
                <span className="tabular-nums font-medium">
                  {formatEth(tx.value, locale)} ETH
                </span>
              </Field>
              <Field label={t("fields.timestamp")}>
                <div className="flex flex-col">
                  <time dateTime={tx.timestamp} className="tabular-nums">
                    {formatTimestamp(tx.timestamp, locale)}
                  </time>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(tx.timestamp, locale)}
                  </span>
                </div>
              </Field>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Renders the "to" field of a transaction.
 *
 * Contract-creation transactions have `toAddress: null` — the recipient is a
 * brand-new contract whose address is derivable only from the receipt. Until
 * we wire up the receipt lookup, decide how to communicate "no recipient" here.
 *
 * TODO(you): implement the null branch. Options:
 *   (a) Plain disabled label — simple, honest, least information.
 *   (b) Badge + short hint ("Contract creation — recipient derived from receipt").
 *   (c) Link to an explainer page or external explorer.
 * Keep the happy path (string) untouched.
 */
function renderToAddress(
  toAddress: string | null,
  t: (key: string) => string,
): React.ReactNode {
  if (toAddress === null) {
    // TODO: replace with your chosen UX — 5-10 lines, use the `t("fields.contractCreation")` key.
    return (
      <span className="font-mono text-xs italic text-muted-foreground">
        {t("fields.contractCreation")}
      </span>
    );
  }
  return (
    <Link
      href={`/wallets/${toAddress}`}
      className="font-mono break-all text-xs text-primary hover:underline"
    >
      {toAddress}
    </Link>
  );
}

function Field({
  label,
  copy,
  fullWidth,
  children,
}: {
  label: string;
  copy?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-2">
        {children}
        {copy && <CopyButton value={copy} />}
      </dd>
    </div>
  );
}
