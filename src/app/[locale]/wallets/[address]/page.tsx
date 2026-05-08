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
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { HashLink } from "@/components/hash-link";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState, EmptyState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { ApiError, getWallet, getWalletTransactions } from "@/services/api";
import type { Transaction } from "@/types/api";
import {
  formatEth,
  formatInt,
  formatRelative,
  formatTimestamp,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ address: string; locale: string }>;
};

export default function WalletPage({ params }: PageProps) {
  const { address } = use(params);
  const t = useTranslations("wallet");
  const tb = useTranslations("breadcrumbs");
  const tc = useTranslations("transactions.columns");
  const ttx = useTranslations("transactions");
  const locale = useLocale();

  const loadWallet = useCallback(() => getWallet(address), [address]);
  const loadTx = useCallback(
    () => getWalletTransactions(address, { size: 100 }).then((r) => r.content),
    [address],
  );

  const { data: wallet, error: walletErr, loading: walletLoading } =
    useAsyncResource(loadWallet, [address]);
  const { data: txs, error: txErr } = useAsyncResource(loadTx, [address]);

  useEffect(() => {
    if (walletErr instanceof ApiError && walletErr.isNotFound) notFound();
  }, [walletErr]);

  const columns: DataTableColumn<Transaction>[] = [
    {
      key: "hash",
      header: tc("hash"),
      cell: (tx) => (
        <div className="pl-4">
          <HashLink value={tx.hash} variant="tx" />
        </div>
      ),
    },
    {
      key: "direction",
      header: tc("from"),
      cell: (tx) => {
        const outgoing = tx.fromAddress.toLowerCase() === address.toLowerCase();
        return (
          <span
            className={
              outgoing
                ? "text-xs font-medium text-destructive"
                : "text-xs font-medium text-emerald-600"
            }
          >
            {outgoing ? "OUT" : "IN"}
          </span>
        );
      },
    },
    {
      key: "counterparty",
      header: tc("to"),
      cell: (tx) => {
        const outgoing = tx.fromAddress.toLowerCase() === address.toLowerCase();
        const counterparty = outgoing ? tx.toAddress : tx.fromAddress;
        return <HashLink value={counterparty} variant="wallet" head={8} tail={6} />;
      },
    },
    {
      key: "value",
      header: tc("value"),
      cell: (tx) => <span className="tabular-nums">{formatEth(tx.value, locale)}</span>,
      sortBy: (tx) => Number(tx.value),
      align: "right",
    },
    {
      key: "block",
      header: tc("block"),
      cell: (tx) => (
        <Link
          href={`/blocks/${tx.blockNumber}`}
          className="font-mono text-primary hover:underline"
        >
          #{formatInt(tx.blockNumber, locale)}
        </Link>
      ),
      sortBy: (tx) => tx.blockNumber,
    },
    {
      key: "status",
      header: tc("status"),
      cell: (tx) => <StatusBadge status={tx.status} />,
    },
    {
      key: "timestamp",
      header: tc("timestamp"),
      cell: (tx) => (
        <span className="pr-4 text-xs text-muted-foreground">
          {formatRelative(tx.timestamp, locale)}
        </span>
      ),
      sortBy: (tx) => tx.timestamp,
      align: "right",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>{tb("home")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{tb("wallets")}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono text-xs">
              {address.slice(0, 10)}…
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t("title")}</h1>

      {walletLoading ? (
        <Skeleton className="mb-6 h-40 w-full" />
      ) : walletErr ? (
        <ErrorState message={t("loadError")} className="mb-6" />
      ) : !wallet ? (
        <EmptyState title={t("notFound")} className="mb-6" />
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("fields.address")}
                </dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="font-mono break-all text-xs">
                    {wallet.address}
                  </span>
                  <CopyButton value={wallet.address} />
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("fields.balance")}
                </dt>
                <dd className="mt-1 tabular-nums text-xl font-semibold">
                  {formatEth(wallet.balance, locale)} ETH
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("fields.txCount")}
                </dt>
                <dd className="mt-1 tabular-nums">{wallet.transactionCount}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("fields.lastSeen")}
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  <time dateTime={wallet.lastSeen} className="tabular-nums">
                    {formatTimestamp(wallet.lastSeen, locale)}
                  </time>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            {t("txTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {txErr ? (
            <div className="px-6 pb-6">
              <ErrorState message={ttx("loadError")} />
            </div>
          ) : (
            <DataTable<Transaction>
              data={txs}
              pageSize={20}
              rowKey={(tx) => tx.hash}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
