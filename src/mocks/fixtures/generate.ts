import type { Block, Transaction, TransactionStatus, Wallet } from "@/types/api";

/**
 * Deterministic blockchain fixture generator.
 *
 * Seeded PRNG (Mulberry32) so running this function twice produces byte-identical
 * output — repro-friendly demos, stable snapshot tests, and deterministic failures
 * for future debugging.
 */

type GenOptions = {
  seed?: number;
  blockCount?: number;
  walletCount?: number;
  firstBlockNumber?: number;
  /** Time between blocks, in seconds. Default 12 — matches Ethereum. */
  blockIntervalSec?: number;
  /** Latest block's timestamp. Defaults to "now" floored to the nearest minute. */
  latestTimestamp?: Date;
};

export type GeneratedFixtures = {
  blocks: Block[];
  transactions: Transaction[];
  wallets: Wallet[];
  addressBook: Record<string, string>;
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hex(rng: () => number, length: number): string {
  let s = "";
  while (s.length < length) {
    s += Math.floor(rng() * 16).toString(16);
  }
  return s.slice(0, length);
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

const WALLET_NAMES = [
  "alice", "bob", "charlie", "dave", "eve",
  "frank", "grace", "heidi", "ivan", "judy",
  "karl", "lea", "mallory", "niaj", "olivia",
  "peggy", "rupert", "sybil", "trent", "victor",
  "walter", "xenia", "yves", "zoe", "arthur",
  "bella", "ciril", "dina", "elton", "faith",
];

const STATUS_WEIGHTS: Array<[TransactionStatus, number]> = [
  ["CONFIRMED", 0.82],
  ["PENDING", 0.1],
  ["FAILED", 0.08],
];

function weightedStatus(rng: () => number): TransactionStatus {
  const r = rng();
  let acc = 0;
  for (const [status, weight] of STATUS_WEIGHTS) {
    acc += weight;
    if (r < acc) return status;
  }
  return "CONFIRMED";
}

function fixedAddress(rng: () => number): string {
  return `0x${hex(rng, 40)}`;
}

/**
 * Generates a value in ETH weighted toward realistic amounts: mostly <1 ETH,
 * occasional medium transfers, rare whales.
 */
function randomValue(rng: () => number): string {
  const r = rng();
  let eth: number;
  if (r < 0.5) eth = rng() * 0.5;
  else if (r < 0.85) eth = rng() * 10;
  else if (r < 0.98) eth = rng() * 200;
  else eth = 100 + rng() * 2000;
  return eth.toFixed(9);
}

export function generateFixtures(
  options: GenOptions = {},
): GeneratedFixtures {
  const {
    seed = 0x424c4f43, // "BLOC"
    blockCount = 150,
    walletCount = 30,
    firstBlockNumber = 18_946_082,
    blockIntervalSec = 12,
    latestTimestamp = new Date("2026-05-08T10:30:00Z"),
  } = options;

  const rng = mulberry32(seed);

  const addresses = Array.from({ length: walletCount }, () => fixedAddress(rng));
  const addressBook: Record<string, string> = {};
  addresses.forEach((addr, idx) => {
    const name = WALLET_NAMES[idx] ?? `wallet_${idx}`;
    addressBook[name] = addr;
  });

  const blocks: Block[] = [];
  const transactions: Transaction[] = [];

  let parentHash = `0x${hex(rng, 64)}`;
  for (let i = 0; i < blockCount; i++) {
    const number = firstBlockNumber + (blockCount - 1 - i);
    const secondsBack = i * blockIntervalSec;
    const timestamp = new Date(
      latestTimestamp.getTime() - secondsBack * 1000,
    ).toISOString();
    const hash = `0x${hex(rng, 64)}`;

    const txCountRoll = rng();
    const transactionCount =
      txCountRoll < 0.05
        ? 0
        : txCountRoll < 0.3
          ? 1 + Math.floor(rng() * 3)
          : txCountRoll < 0.85
            ? 3 + Math.floor(rng() * 5)
            : 8 + Math.floor(rng() * 8);

    for (let t = 0; t < transactionCount; t++) {
      const from = pick(rng, addresses);
      let to = pick(rng, addresses);
      while (to === from) to = pick(rng, addresses);
      transactions.push({
        hash: `0x${hex(rng, 64)}`,
        fromAddress: from,
        toAddress: to,
        value: randomValue(rng),
        blockNumber: number,
        status: weightedStatus(rng),
        timestamp,
      });
    }

    blocks.push({
      hash,
      number,
      timestamp,
      parentHash,
      transactionCount,
    });
    parentHash = hash;
  }

  blocks.reverse();

  // Recompute wallets from the transaction graph so balances + counts are
  // internally consistent with the generated data.
  const walletStats = new Map<
    string,
    { balance: number; count: number; lastSeen: string }
  >();
  for (const addr of addresses) {
    walletStats.set(addr, { balance: 0, count: 0, lastSeen: "" });
  }
  for (const tx of transactions) {
    if (tx.status !== "CONFIRMED") continue;
    const v = Number(tx.value);
    const sender = walletStats.get(tx.fromAddress)!;
    const receiver = walletStats.get(tx.toAddress)!;
    sender.balance -= v;
    receiver.balance += v;
    sender.count += 1;
    receiver.count += 1;
    if (tx.timestamp > sender.lastSeen) sender.lastSeen = tx.timestamp;
    if (tx.timestamp > receiver.lastSeen) receiver.lastSeen = tx.timestamp;
  }

  const wallets: Wallet[] = addresses.map((addr) => {
    const stats = walletStats.get(addr)!;
    const seed = Math.abs(Math.sin(addr.length * 17)) * 500 + 100;
    return {
      address: addr,
      balance: Math.max(0, stats.balance + seed).toFixed(9),
      transactionCount: stats.count,
      lastSeen: stats.lastSeen || blocks[0]!.timestamp,
    };
  });

  return { blocks, transactions, wallets, addressBook };
}
