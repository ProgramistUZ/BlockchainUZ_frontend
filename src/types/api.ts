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
  toAddress: string;
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

// ── Search params ──────────────────────────────────────────────────

export interface TransactionSearchParams {
  hash?: string;
  blockNumber?: number;
  status?: TransactionStatus;
  address?: string;
  page?: number;
  size?: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}
