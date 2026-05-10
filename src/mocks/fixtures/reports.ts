import type { Stats, TopAddress, VolumeReport } from "@/types/api";
import { blocks, transactions } from "./index";

/**
 * Derive reporting fixtures from the deterministic block/tx generator so they
 * stay consistent with the rest of the mock dataset.
 */

const confirmed = transactions.filter((tx) => tx.status === "CONFIRMED");

const uniqueAddresses = new Set<string>();
for (const tx of transactions) {
  uniqueAddresses.add(tx.fromAddress);
  uniqueAddresses.add(tx.toAddress);
}

const totalEth = confirmed.reduce((s, tx) => s + Number(tx.value), 0);
const avgTxValue = confirmed.length > 0 ? totalEth / confirmed.length : 0;

// Backend computes avgBlockTime from adjacent timestamps. Our fixture generator
// uses a constant 12 s interval.
const AVG_BLOCK_TIME_SEC = 12;

export const stats: Stats = {
  totalBlocks: blocks.length,
  totalTransactions: transactions.length,
  totalUniqueAddresses: uniqueAddresses.size,
  averageBlockTime: AVG_BLOCK_TIME_SEC,
  averageTransactionValue: avgTxValue.toFixed(9),
};

// Group transactions by day / week of their timestamp.
function bucketByDate(
  isoToKey: (d: Date) => string,
): VolumeReport[] {
  const bucket = new Map<string, { count: number; volume: number }>();
  for (const tx of confirmed) {
    const key = isoToKey(new Date(tx.timestamp));
    const cur = bucket.get(key) ?? { count: 0, volume: 0 };
    cur.count += 1;
    cur.volume += Number(tx.value);
    bucket.set(key, cur);
  }
  return [...bucket.entries()]
    .map(([date, { count, volume }]) => ({
      date,
      transactionCount: count,
      totalVolume: volume.toFixed(9),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toWeekKey(d: Date): string {
  // ISO week bucket keyed by Monday of that week.
  const date = new Date(d);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

export const dailyVolume: VolumeReport[] = bucketByDate(toDayKey);
export const weeklyVolume: VolumeReport[] = bucketByDate(toWeekKey);

// Top addresses by transaction count across the fixture set.
const counts = new Map<string, number>();
for (const tx of transactions) {
  counts.set(tx.fromAddress, (counts.get(tx.fromAddress) ?? 0) + 1);
  counts.set(tx.toAddress, (counts.get(tx.toAddress) ?? 0) + 1);
}

export const topAddresses: TopAddress[] = [...counts.entries()]
  .map(([address, transactionCount]) => ({ address, transactionCount }))
  .sort((a, b) => b.transactionCount - a.transactionCount);
