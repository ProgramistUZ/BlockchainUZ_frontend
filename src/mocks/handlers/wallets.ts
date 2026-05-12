import { http, HttpResponse } from "msw";
import { transactions, wallets } from "../fixtures";
import { maybeFail } from "../chaos";
import type { PaginatedResponse, Transaction } from "@/types/api";

import { env } from "@/lib/env";

const API = env.NEXT_PUBLIC_API_URL;

function findWallet(address: string) {
  const addr = address.toLowerCase();
  return wallets.find((w) => w.address.toLowerCase() === addr);
}

export const walletHandlers = [
  // GET /api/wallets/:address
  http.get(`${API}/wallets/:address`, ({ params }) => {
    const wallet = findWallet(String(params.address));
    if (!wallet) {
      return HttpResponse.json(
        { status: 404, message: "Wallet not found", timestamp: new Date().toISOString(), path: `/api/wallets/${params.address}` },
        { status: 404 },
      );
    }
    return HttpResponse.json(wallet);
  }),

  // GET /api/wallets/:address/balance — backend returns a bare BigDecimal.
  http.get(`${API}/wallets/:address/balance`, ({ params }) => {
    const wallet = findWallet(String(params.address));
    // Fall back to "0" for unknown wallets — matches the backend behaviour
    // when the node call fails.
    return HttpResponse.json(wallet?.balance ?? "0");
  }),

  // GET /api/wallets/:address/transactions — paginated history
  http.get(`${API}/wallets/:address/transactions`, ({ params, request }) => {
    const fail = maybeFail();
    if (fail) return fail;
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    const addr = String(params.address).toLowerCase();
    const history = transactions.filter(
      (tx) =>
        tx.fromAddress.toLowerCase() === addr ||
        tx.toAddress?.toLowerCase() === addr,
    );

    const start = page * size;
    const content = history.slice(start, start + size);

    return HttpResponse.json<PaginatedResponse<Transaction>>({
      content,
      page,
      size,
      totalElements: history.length,
      totalPages: Math.max(1, Math.ceil(history.length / size)),
    });
  }),
];
