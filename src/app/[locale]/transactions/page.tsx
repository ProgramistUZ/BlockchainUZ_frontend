"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { searchTransactions } from "@/services/api";
import type { Transaction, TransactionStatus } from "@/types/api";
import { formatEth, formatInt, formatRelative } from "@/lib/format";

const STATUSES: TransactionStatus[] = ["CONFIRMED", "PENDING", "FAILED"];
const ALL = "ALL" as const;

type Filters = {
  hash: string;
  address: string;
  blockNumber: string;
  status: TransactionStatus | typeof ALL;
};

function readFilters(params: URLSearchParams): Filters {
  const status = params.get("status");
  return {
    hash: params.get("hash") ?? "",
    address: params.get("address") ?? "",
    blockNumber: params.get("blockNumber") ?? "",
    status: STATUSES.includes(status as TransactionStatus)
      ? (status as TransactionStatus)
      : ALL,
  };
}

function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.hash) params.set("hash", filters.hash.trim());
  if (filters.address) params.set("address", filters.address.trim());
  if (filters.blockNumber) params.set("blockNumber", filters.blockNumber.trim());
  if (filters.status !== ALL) params.set("status", filters.status);
  return params;
}

export default function TransactionsPage() {
  const t = useTranslations("transactions");
  const tb = useTranslations("breadcrumbs");
  const tf = useTranslations("transactions.filters");
  const tc = useTranslations("transactions.columns");
  const ts = useTranslations("status");
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();
  const urlParams = useSearchParams();
  const applied = useMemo(() => readFilters(urlParams), [urlParams]);
  const [draft, setDraft] = useState<Filters>(applied);

  const load = useCallback(() => {
    const blockNumber = applied.blockNumber
      ? Number(applied.blockNumber)
      : undefined;
    return searchTransactions({
      hash: applied.hash || undefined,
      address: applied.address || undefined,
      blockNumber: Number.isSafeInteger(blockNumber) ? blockNumber : undefined,
      status: applied.status === ALL ? undefined : applied.status,
      page: 0,
      size: 200,
    }).then((r) => r.content);
  }, [applied]);

  const { data, error, loading } = useAsyncResource(load, [applied]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = writeFilters(draft);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleReset() {
    setDraft({ hash: "", address: "", blockNumber: "", status: ALL });
    router.push(pathname);
  }

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
      key: "from",
      header: tc("from"),
      cell: (tx) => <HashLink value={tx.fromAddress} variant="wallet" head={8} tail={6} />,
    },
    {
      key: "to",
      header: tc("to"),
      cell: (tx) => <HashLink value={tx.toAddress} variant="wallet" head={8} tail={6} />,
    },
    {
      key: "value",
      header: tc("value"),
      cell: (tx) => <span className="tabular-nums">{formatEth(tx.value, locale)}</span>,
      sortBy: (tx) => Number(tx.value),
      align: "right",
    },
    {
      key: "status",
      header: tc("status"),
      cell: (tx) => <StatusBadge status={tx.status} />,
      sortBy: (tx) => tx.status,
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
            <BreadcrumbPage>{tb("transactions")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
            {tf("apply")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-hash">{tf("hash")}</Label>
              <Input
                id="f-hash"
                value={draft.hash}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, hash: e.target.value }))
                }
                placeholder="0x…"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-address">{tf("address")}</Label>
              <Input
                id="f-address"
                value={draft.address}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, address: e.target.value }))
                }
                placeholder="0x…"
                className="font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-block">{tf("blockNumber")}</Label>
              <Input
                id="f-block"
                type="number"
                inputMode="numeric"
                value={draft.blockNumber}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, blockNumber: e.target.value }))
                }
                placeholder="18946231"
                className="tabular-nums"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-status">{tf("status")}</Label>
              <Select
                value={draft.status}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    status: v as TransactionStatus | typeof ALL,
                  }))
                }
              >
                <SelectTrigger id="f-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{tf("allStatuses")}</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ts(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit" size="sm">
                {tf("apply")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                {tf("reset")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <ErrorState message={t("loadError")} />
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="sr-only">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Transaction>
              data={loading ? null : (data ?? [])}
              pageSize={20}
              rowKey={(tx) => tx.hash}
              columns={columns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
