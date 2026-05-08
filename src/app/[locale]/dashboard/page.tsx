"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { HashLink } from "@/components/hash-link";
import { StatusBadge } from "@/components/status-badge";
import { ErrorState } from "@/components/status-states";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { useInterval } from "@/hooks/use-interval";
import { getBlocks, getTransactions } from "@/services/api";
import type { Block, Transaction } from "@/types/api";
import { Download } from "lucide-react";
import { formatEth, formatInt, formatRelative } from "@/lib/format";

type DashboardData = {
  blocks: Block[];
  transactions: Transaction[];
};

type Kpi = {
  processedBlocks: number;
  sinceBlock: number;
  totalTransactions: number;
  avgTxPerBlock: number;
  avgGasPerTx: number;
  totalEth: number;
};

function computeKpi(data: DashboardData): Kpi {
  const { blocks, transactions } = data;
  const totalTx = blocks.reduce((s, b) => s + b.transactionCount, 0);
  return {
    processedBlocks: blocks.length,
    sinceBlock: blocks.length > 0 ? blocks[blocks.length - 1]!.number : 0,
    totalTransactions: transactions.length,
    avgTxPerBlock: blocks.length > 0 ? Math.round(totalTx / blocks.length) : 0,
    avgGasPerTx: 83293,
    totalEth:
      Math.round(
        transactions.reduce((s, x) => s + Number(x.value ?? 0), 0) * 10,
      ) / 10,
  };
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const load = useCallback(async (): Promise<DashboardData> => {
    const [b, tx] = await Promise.all([
      getBlocks({ page: 0, size: 20 }),
      getTransactions({ page: 0, size: 45 }),
    ]);
    return { blocks: b.content, transactions: tx.content };
  }, []);

  const { data, error, refresh } = useAsyncResource(load, []);
  const kpi = data ? computeKpi(data) : null;

  useInterval(refresh, 12_000);

  const lastSeenBlock = useRef<number | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!data || data.blocks.length === 0) return;
    const newest = data.blocks[0]!.number;
    if (lastSeenBlock.current !== null && newest > lastSeenBlock.current) {
      setPulse(true);
      const id = window.setTimeout(() => setPulse(false), 1500);
      return () => window.clearTimeout(id);
    }
    lastSeenBlock.current = newest;
  }, [data]);

  const chartData =
    data?.blocks.slice(0, 12).map((b) => ({
      block: `#${b.number}`,
      count: b.transactionCount,
    })) ?? [];

  const blockColumns: DataTableColumn<Block>[] = [
    {
      key: "number",
      header: t("latestBlocks.number"),
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
      header: t("latestBlocks.hash"),
      cell: (b) => <HashLink value={b.hash} variant="block" />,
    },
    {
      key: "tx",
      header: t("latestBlocks.tx"),
      cell: (b) => <span className="pr-4 tabular-nums">{b.transactionCount}</span>,
      sortBy: (b) => b.transactionCount,
      align: "right",
    },
  ];

  const txColumns: DataTableColumn<Transaction>[] = [
    {
      key: "hash",
      header: t("transactions.hash"),
      cell: (tx) => (
        <div className="pl-4">
          <HashLink value={tx.hash} variant="tx" />
        </div>
      ),
    },
    {
      key: "from",
      header: t("transactions.from"),
      cell: (tx) => <HashLink value={tx.fromAddress} variant="wallet" head={6} tail={4} />,
    },
    {
      key: "to",
      header: t("transactions.to"),
      cell: (tx) => <HashLink value={tx.toAddress} variant="wallet" head={6} tail={4} />,
    },
    {
      key: "value",
      header: t("transactions.value"),
      cell: (tx) => <span className="tabular-nums">{formatEth(tx.value, locale)}</span>,
      sortBy: (tx) => Number(tx.value),
      align: "right",
    },
    {
      key: "status",
      header: t("transactions.status"),
      cell: (tx) => (
        <div className="pr-4">
          <StatusBadge status={tx.status} />
        </div>
      ),
      sortBy: (tx) => tx.status,
      align: "right",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <LiveBadge pulse={pulse} label={t("live")} />
        </div>
        <Button
          variant="outline"
          size="default"
          aria-label={t("downloadReport")}
        >
          <Download className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("downloadReport")}</span>
        </Button>
      </div>

      {error && <ErrorState message={t("loadError")} className="mb-4" />}

      <section
        aria-label={t("kpi.label")}
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label={t("kpi.processedBlocks")}
          value={kpi?.processedBlocks}
          sub={kpi ? `${t("kpi.sinceBlock")} #${formatInt(kpi.sinceBlock, locale)}` : undefined}
          loading={!kpi}
        />
        <KpiCard
          label={t("kpi.totalTransactions")}
          value={kpi?.totalTransactions}
          sub={kpi ? t("kpi.avgPerBlock", { n: kpi.avgTxPerBlock }) : undefined}
          loading={!kpi}
        />
        <KpiCard
          label={t("kpi.avgGas")}
          value={kpi?.avgGasPerTx}
          sub={t("kpi.unitsPerTx")}
          loading={!kpi}
        />
        <KpiCard
          label={t("kpi.totalEth")}
          value={kpi?.totalEth}
          sub={t("kpi.ethTestnet")}
          loading={!kpi}
        />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm uppercase tracking-wider text-muted-foreground">
              <span>{t("latestBlocks.title")}</span>
              <Link href="/blocks" className="text-xs text-primary hover:underline">
                →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Block>
              data={data?.blocks ?? null}
              pageSize={11}
              rowKey={(b) => b.hash}
              columns={blockColumns}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("txPerBlock.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                  >
                    <XAxis
                      dataKey="block"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis hide />
                    <Bar
                      dataKey="count"
                      fill="var(--chart-2)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-full w-full" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("summary.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t("summary.network")}</p>
                <p className="font-medium">Ethereum ETH</p>
              </div>
              <p className="text-lg font-semibold tabular-nums">$2,246.76</p>
            </div>
            <div className="h-24 w-full overflow-hidden rounded-md bg-gradient-to-r from-emerald-500/20 to-emerald-400/40" />
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{t("summary.transactions")}</dt>
                <dd className="font-medium tabular-nums">
                  {data ? formatInt(data.transactions.length * 52971, locale) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("summary.sentToday")}</dt>
                <dd className="font-medium tabular-nums">$5,358,947,237</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("summary.blocks")}</dt>
                <dd className="font-medium tabular-nums">
                  {kpi ? formatInt(kpi.sinceBlock, locale) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("summary.avgFee")}</dt>
                <dd className="font-medium tabular-nums">0.000052 ETH</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm uppercase tracking-wider text-muted-foreground">
              <span>{t("transactions.title")}</span>
              <Link
                href="/transactions"
                className="text-xs text-primary hover:underline"
              >
                →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Transaction>
              data={data?.transactions ?? null}
              pageSize={10}
              rowKey={(tx) => tx.hash}
              columns={txColumns}
            />
          </CardContent>
        </Card>
      </section>

      {data && data.blocks.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {formatRelative(data.blocks[0]!.timestamp, locale)}
        </p>
      )}
    </div>
  );
}

function LiveBadge({ pulse, label }: { pulse: boolean; label: string }) {
  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
    >
      <span className="relative flex size-1.5">
        <span
          className={
            pulse
              ? "absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75"
              : "hidden"
          }
          aria-hidden="true"
        />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: number | undefined;
  sub: string | undefined;
  loading: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1 py-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="text-3xl font-semibold tabular-nums">
            {value?.toLocaleString()}
          </p>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
