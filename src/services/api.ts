import type {
  Block,
  PaginatedResponse,
  PaginationParams,
  Transaction,
  TransactionSearchParams,
  Wallet,
} from "@/types/api";

import { env } from "@/lib/env";

const API_URL = env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Blocks ─────────────────────────────────────────────────────────

export function getBlocks(params: PaginationParams = {}) {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return apiFetch<PaginatedResponse<Block>>(`/blocks?${q}`);
}

export function getLatestBlock() {
  return apiFetch<Block>("/blocks/latest");
}

export function getBlockByHash(hash: string) {
  return apiFetch<Block>(`/blocks/hash/${hash}`);
}

export function getBlockByNumber(number: number) {
  return apiFetch<Block>(`/blocks/number/${number}`);
}

// ── Transactions ───────────────────────────────────────────────────

export function getTransactions(params: PaginationParams = {}) {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return apiFetch<PaginatedResponse<Transaction>>(`/transactions?${q}`);
}

export function getTransactionByHash(hash: string) {
  return apiFetch<Transaction>(`/transactions/${hash}`);
}

export function searchTransactions(params: TransactionSearchParams = {}) {
  const q = new URLSearchParams();
  if (params.hash) q.set("hash", params.hash);
  if (params.blockNumber != null) q.set("blockNumber", String(params.blockNumber));
  if (params.status) q.set("status", params.status);
  if (params.address) q.set("address", params.address);
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  return apiFetch<PaginatedResponse<Transaction>>(`/transactions/search?${q}`);
}

// ── Wallets ────────────────────────────────────────────────────────

export function getWallet(address: string) {
  return apiFetch<Wallet>(`/wallets/${address}`);
}

export function getWalletTransactions(
  address: string,
  params: PaginationParams = {},
) {
  return searchTransactions({ address, ...params });
}
