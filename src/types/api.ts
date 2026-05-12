// ── Entity types (synced with backend DTOs) ────────────────────────

export interface Block {
  hash: string;
  number: number;
  timestamp: string; // ISO 8601
  parentHash: string;
  transactionCount: number;
  transactions?: Transaction[];
}

export interface Transaction {
  hash: string;
  fromAddress: string;
  // `null` for contract-creation transactions — backend preserves the RPC value.
  toAddress: string | null;
  value: string; // string to preserve BigDecimal precision
  blockNumber: number;
  status: TransactionStatus;
  timestamp: string; // ISO 8601
}

export type TransactionStatus = "PENDING" | "CONFIRMED" | "FAILED";

export interface Wallet {
  address: string;
  balance: string; // string to preserve BigDecimal precision
  transactionCount: number;
  lastSeen: string; // ISO 8601
}

// ── Reports / analytics (Sprint 3 backend) ─────────────────────────

export interface Stats {
  totalBlocks: number;
  totalTransactions: number;
  totalUniqueAddresses: number;
  averageBlockTime: number; // seconds
  averageTransactionValue: string; // BigDecimal — string preserves precision
}

export interface VolumeReport {
  date: string; // ISO 8601 date (yyyy-MM-dd)
  transactionCount: number;
  totalVolume: string; // BigDecimal
}

export type VolumePeriod = "daily" | "weekly";

export interface TopAddress {
  address: string;
  transactionCount: number;
}

// ── Sync (Sprint 1/2 backend) ──────────────────────────────────────

export interface SyncStatus {
  latestBlockchainBlock: number;
  latestDatabaseBlock: number;
  blocksBehind: number;
  syncEnabled: boolean;
  // Jackson may serialize the backend's `isFullySynced` boolean as either
  // `isFullySynced` or `fullySynced` depending on Lombok/Jackson introspection.
  // Accept both; readers should coalesce.
  isFullySynced?: boolean;
  fullySynced?: boolean;
}

// ── Generic response wrappers ──────────────────────────────────────

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
}

// ── Search / query params ──────────────────────────────────────────

export interface TransactionSearchParams {
  hash?: string;
  blockNumber?: number;
  status?: TransactionStatus;
  address?: string;
  page?: number;
  size?: number;
  sort?: string; // Spring Pageable — e.g. "timestamp,desc"
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string; // Spring Pageable — e.g. "number,desc"
}

export interface ReportExportParams {
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
  address?: string;
}
