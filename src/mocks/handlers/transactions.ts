import { http, HttpResponse } from "msw";
import { transactions } from "../fixtures/transactions";
import type { PaginatedResponse, Transaction } from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const transactionHandlers = [
  // GET /api/transactions — paginated list
  http.get(`${API}/transactions`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    const start = page * size;
    const content = transactions.slice(start, start + size);

    return HttpResponse.json<PaginatedResponse<Transaction>>({
      content,
      page,
      size,
      totalElements: transactions.length,
      totalPages: Math.ceil(transactions.length / size),
    });
  }),

  // GET /api/transactions/search — filtered search
  http.get(`${API}/transactions/search`, ({ request }) => {
    const url = new URL(request.url);
    const hash = url.searchParams.get("hash");
    const blockNumber = url.searchParams.get("blockNumber");
    const status = url.searchParams.get("status");
    const address = url.searchParams.get("address");
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    let filtered = [...transactions];

    if (hash) {
      filtered = filtered.filter((tx) =>
        tx.hash.toLowerCase().includes(hash.toLowerCase()),
      );
    }
    if (blockNumber) {
      filtered = filtered.filter((tx) => tx.blockNumber === Number(blockNumber));
    }
    if (status) {
      filtered = filtered.filter((tx) => tx.status === status);
    }
    if (address) {
      const addr = address.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.fromAddress.toLowerCase() === addr ||
          tx.toAddress.toLowerCase() === addr,
      );
    }

    const start = page * size;
    const content = filtered.slice(start, start + size);

    return HttpResponse.json<PaginatedResponse<Transaction>>({
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
    });
  }),

  // GET /api/transactions/:hash — single transaction
  http.get(`${API}/transactions/:hash`, ({ params }) => {
    const tx = transactions.find((t) => t.hash === params.hash);
    if (!tx) {
      return HttpResponse.json(
        { status: 404, message: "Transaction not found", timestamp: new Date().toISOString(), path: `/api/transactions/${params.hash}` },
        { status: 404 },
      );
    }
    return HttpResponse.json(tx);
  }),
];
