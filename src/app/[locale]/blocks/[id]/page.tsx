"use client";

import { useCallback, use, useEffect } from "react";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { HashLink } from "@/components/hash-link";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState, EmptyState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { ApiError, getBlockByHash, getBlockByNumber } from "@/services/api";
import type { Block, Transaction } from "@/types/api";
import {
  formatEth,
  formatInt,
  formatRelative,
  formatTimestamp,
} from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default function BlockDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("blockDetails");
  const tb = useTranslations("breadcrumbs");
  const tt = useTranslations("transactions.columns");
  const locale = useLocale();

  const load = useCallback(() => {
    const asNumber = Number(id);
    if (Number.isSafeInteger(asNumber) && asNumber >= 0 && !/^0x/i.test(id)) {
      return getBlockByNumber(asNumber);
    }
    return getBlockByHash(id);
  }, [id]);

  const { data: block, error, loading } = useAsyncResource(load, [id]);

  useEffect(() => {
    if (error instanceof ApiError && error.isNotFound) notFound();
  }, [error]);

  const txColumns: DataTableColumn<Transaction>[] = [
    {
      key: "hash",
      header: tt("hash"),
      cell: (tx) => (
        <div className="pl-4">
          <HashLink value={tx.hash} variant="tx" />
        </div>
      ),
    },
    {
      key: "from",
      header: tt("from"),
      cell: (tx) => <HashLink value={tx.fromAddress} variant="wallet" head={8} tail={6} />,
    },
    {
      key: "to",
      header: tt("to"),
      cell: (tx) => <HashLink value={tx.toAddress} variant="wallet" head={8} tail={6} />,
    },
    {
      key: "value",
      header: tt("value"),
      cell: (tx) => <span className="tabular-nums">{formatEth(tx.value, locale)}</span>,
      sortBy: (tx) => Number(tx.value),
      align: "right",
    },
    {
      key: "status",
      header: tt("status"),
      cell: (tx) => (
        <div className="pr-4">
          <StatusBadge status={tx.status} />
        </div>
      ),
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
            <BreadcrumbLink render={<Link href="/blocks" />}>
              {tb("blocks")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">
              {block ? `#${formatInt(block.number, locale)}` : id}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {loading ? (
        <BlockSkeleton />
      ) : error ? (
        <ErrorState message={t("loadError")} />
      ) : !block ? (
        <EmptyState title={t("notFound")} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("title", { number: formatInt(block.number, locale) })}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/blocks/${block.number - 1}`} />}
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                {t("prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/blocks/${block.number + 1}`} />}
              >
                {t("next")}
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                {t("title", { number: formatInt(block.number, locale) })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <Field label={t("fields.number")}>
                  <span className="font-mono">#{formatInt(block.number, locale)}</span>
                </Field>
                <Field label={t("fields.txCount")}>
                  <span className="tabular-nums">{block.transactionCount}</span>
                </Field>
                <Field label={t("fields.hash")} copy={block.hash}>
                  <span className="font-mono break-all text-xs">{block.hash}</span>
                </Field>
                <Field label={t("fields.parent")} copy={block.parentHash}>
                  <Link
                    href={`/blocks/${block.parentHash}`}
                    className="font-mono break-all text-xs text-primary hover:underline"
                  >
                    {block.parentHash}
                  </Link>
                </Field>
                <Field label={t("fields.timestamp")}>
                  <time dateTime={block.timestamp} className="tabular-nums">
                    {formatTimestamp(block.timestamp, locale)}
                  </time>
                </Field>
                <Field label={t("fields.age")}>
                  <span className="text-muted-foreground">
                    {formatRelative(block.timestamp, locale)}
                  </span>
                </Field>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                {t("txTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {block.transactions && block.transactions.length > 0 ? (
                <DataTable<Transaction>
                  data={block.transactions}
                  pageSize={25}
                  rowKey={(tx) => tx.hash}
                  columns={txColumns}
                />
              ) : (
                <div className="px-6 pb-6">
                  <EmptyState title={t("noTx")} />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  copy,
  children,
}: {
  label: string;
  copy?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-2">
        {children}
        {copy && <CopyButton value={copy} />}
      </dd>
    </div>
  );
}

function BlockSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
