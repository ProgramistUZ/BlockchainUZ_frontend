"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { HashLink } from "@/components/hash-link";
import { ErrorState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { getBlocks } from "@/services/api";
import type { Block } from "@/types/api";
import { formatInt, formatRelative } from "@/lib/format";

const PAGE_SIZE = 100;

export default function BlocksPage() {
  const t = useTranslations("blocks");
  const tb = useTranslations("breadcrumbs");
  const locale = useLocale();

  const load = useCallback(
    () => getBlocks({ page: 0, size: PAGE_SIZE }).then((r) => r.content),
    [],
  );
  const { data, error, loading } = useAsyncResource(load, []);

  const columns: DataTableColumn<Block>[] = [
    {
      key: "number",
      header: t("columns.number"),
      cell: (b) => (
        <Link
          href={`/blocks/${b.number}`}
          className="pl-4 font-mono text-primary hover:underline"
        >
          #{formatInt(b.number, locale)}
        </Link>
      ),
      sortBy: (b) => b.number,
    },
    {
      key: "hash",
      header: t("columns.hash"),
      cell: (b) => <HashLink value={b.hash} variant="block" />,
    },
    {
      key: "parent",
      header: t("columns.parent"),
      cell: (b) => <HashLink value={b.parentHash} variant="block" />,
    },
    {
      key: "timestamp",
      header: t("columns.timestamp"),
      cell: (b) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(b.timestamp, locale)}
        </span>
      ),
      sortBy: (b) => b.timestamp,
    },
    {
      key: "tx",
      header: t("columns.tx"),
      cell: (b) => <span className="pr-4 tabular-nums">{b.transactionCount}</span>,
      sortBy: (b) => b.transactionCount,
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
            <BreadcrumbPage>{tb("blocks")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { n: data?.length ?? PAGE_SIZE })}
        </p>
      </div>

      {error ? (
        <ErrorState message={t("loadError")} />
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="sr-only">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Block>
              data={loading ? null : (data ?? [])}
              pageSize={20}
              rowKey={(b) => b.hash}
              columns={columns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
