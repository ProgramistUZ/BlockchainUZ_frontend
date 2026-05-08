"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { getBlocks, getTransactions } from "@/services/api";
import type { Block, Transaction } from "@/types/api";
import { Download } from "lucide-react";

type Kpi = {
  processedBlocks: number;
  sinceBlock: number;
  totalTransactions: number;
  avgTxPerBlock: number;
  avgGasPerTx: number;
  totalEth: number;
};

function truncate(hash: string, head = 6, tail = 4) {
  if (hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [b, tx] = await Promise.all([
          getBlocks({ page: 0, size: 20 }),
          getTransactions({ page: 0, size: 45 }),
        ]);
        if (cancelled) return;
        setBlocks(b.content);
        setTransactions(tx.content);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : t("loadError"));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const kpi: Kpi | null =
    blocks && transactions
      ? {
          processedBlocks: blocks.length,
          sinceBlock: blocks.length > 0 ? blocks[blocks.length - 1]!.number : 0,
          totalTransactions: transactions.length,
          avgTxPerBlock:
            blocks.length > 0
              ? Math.round(
                  blocks.reduce((sum, b) => sum + b.transactionCount, 0) /
                    blocks.length,
                )
              : 0,
          // mock: we don't have gas in types, so derive a stable demo value
          avgGasPerTx: 83293,
          totalEth:
            Math.round(
              transactions.reduce((s, x) => s + Number(x.value ?? 0), 0) * 10,
            ) / 10,
        }
      : null;

  const chartData =
    blocks?.slice(0, 12).map((b) => ({
      block: `#${b.number}`,
      count: b.transactionCount,
    })) ?? [];

  const blockColumns: DataTableColumn<Block>[] = [
    {
      key: "number",
      header: t("latestBlocks.number"),
      cell: (b) => <span className="pl-4 font-mono">#{b.number}</span>,
      sortBy: (b) => b.number,
    },
    {
      key: "hash",
      header: t("latestBlocks.hash"),
      cell: (b) => (
        <span className="font-mono text-muted-foreground">{truncate(b.hash)}</span>
      ),
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
      cell: (tx) => <span className="pl-4 font-mono">{truncate(tx.hash)}</span>,
    },
    {
      key: "from",
      header: t("transactions.from"),
      cell: (tx) => (
        <span className="font-mono text-muted-foreground">{truncate(tx.fromAddress)}</span>
      ),
    },
    {
      key: "to",
      header: t("transactions.to"),
      cell: (tx) => (
        <span className="font-mono text-muted-foreground">{truncate(tx.toAddress)}</span>
      ),
    },
    {
      key: "value",
      header: t("transactions.value"),
      cell: (tx) => <span className="tabular-nums">{tx.value}</span>,
      sortBy: (tx) => Number(tx.value),
      align: "right",
    },
    {
      key: "status",
      header: t("transactions.status"),
      cell: (tx) => (
        <span className="pr-4 text-xs font-medium">{tx.status}</span>
      ),
      sortBy: (tx) => tx.status,
      align: "right",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <Button
          variant="outline"
          size="default"
          aria-label={t("downloadReport")}
        >
          <Download className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("downloadReport")}</span>
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <section
        aria-label={t("kpi.label")}
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label={t("kpi.processedBlocks")}
          value={kpi?.processedBlocks}
          sub={kpi ? `${t("kpi.sinceBlock")} #${kpi.sinceBlock}` : undefined}
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
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("latestBlocks.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Block>
              data={blocks}
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
                <dd className="font-medium tabular-nums">2,385,189</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("summary.sentToday")}</dt>
                <dd className="font-medium tabular-nums">$5,358,947,237</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("summary.blocks")}</dt>
                <dd className="font-medium tabular-nums">24,850,684</dd>
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
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
              {t("transactions.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <DataTable<Transaction>
              data={transactions}
              pageSize={10}
              rowKey={(tx) => tx.hash}
              columns={txColumns}
            />
          </CardContent>
        </Card>
      </section>
    </div>
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
          <p className="text-3xl font-semibold tabular-nums">{value?.toLocaleString()}</p>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
