import type {
  Block,
  PaginatedResponse,
  PaginationParams,
  ReportExportParams,
  Stats,
  SyncStatus,
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

function buildPageQuery(params: PaginationParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.size != null) q.set("size", String(params.size));
  if (params.sort) q.set("sort", params.sort);
  return q;
}

// ── Blocks ─────────────────────────────────────────────────────────

export function getBlocks(params: PaginationParams = {}) {
  return apiFetch<PaginatedResponse<Block>>(`/blocks?${buildPageQuery(params)}`);
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

export function getPreviousBlock(number: number) {
  return apiFetch<Block>(`/blocks/number/${number}/previous`);
}

export function getNextBlock(number: number) {
  return apiFetch<Block>(`/blocks/number/${number}/next`);
}

// ── Transactions ───────────────────────────────────────────────────

export function getTransactions(params: PaginationParams = {}) {
  return apiFetch<PaginatedResponse<Transaction>>(
    `/transactions?${buildPageQuery(params)}`,
  );
}

export function getTransactionByHash(hash: string) {
  return apiFetch<Transaction>(`/transactions/${hash}`);
}

export function searchTransactions(params: TransactionSearchParams = {}) {
  const q = buildPageQuery(params);
  if (params.hash) q.set("hash", params.hash);
  if (params.blockNumber != null) q.set("blockNumber", String(params.blockNumber));
  if (params.status) q.set("status", params.status);
  if (params.address) q.set("address", params.address);
  return apiFetch<PaginatedResponse<Transaction>>(`/transactions/search?${q}`);
}

// ── Wallets ────────────────────────────────────────────────────────

export function getWallet(address: string) {
  return apiFetch<Wallet>(`/wallets/${address}`);
}

// Backend returns a bare BigDecimal; we keep it as a string for precision.
export function getWalletBalance(address: string) {
  return apiFetch<string>(`/wallets/${address}/balance`);
}

export function getWalletTransactions(
  address: string,
  params: PaginationParams = {},
) {
  return apiFetch<PaginatedResponse<Transaction>>(
    `/wallets/${address}/transactions?${buildPageQuery(params)}`,
  );
}

// ── Reports / analytics ────────────────────────────────────────────

export function getStats() {
  return apiFetch<Stats>("/reports/stats");
}

function buildExportQuery(params: ReportExportParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.startDate) q.set("startDate", params.startDate);
  if (params.endDate) q.set("endDate", params.endDate);
  if (params.address) q.set("address", params.address);
  return q;
}

export async function exportTransactionsCsv(
  params: ReportExportParams = {},
): Promise<Blob> {
  const res = await fetch(
    `${API_URL}/reports/export/csv?${buildExportQuery(params)}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      res.status,
      body.message ?? `Export failed: ${res.status}`,
    );
  }
  return res.blob();
}

// ── Sync ───────────────────────────────────────────────────────────

export function getSyncStatus() {
  return apiFetch<SyncStatus>("/sync/status");
}
