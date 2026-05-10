import { http, HttpResponse } from "msw";
import { transactions } from "../fixtures";
import {
  dailyVolume,
  stats,
  topAddresses,
  weeklyVolume,
} from "../fixtures/reports";
import { maybeFail } from "../chaos";
import { env } from "@/lib/env";

const API = env.NEXT_PUBLIC_API_URL;

function filterTransactionsForExport(url: URL) {
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const address = url.searchParams.get("address");

  let filtered = [...transactions];

  if (startDate) {
    const start = new Date(startDate + "T00:00:00Z").getTime();
    filtered = filtered.filter((tx) => new Date(tx.timestamp).getTime() >= start);
  }
  if (endDate) {
    // Backend treats endDate as inclusive by adding +1 day as exclusive bound.
    const end = new Date(endDate + "T00:00:00Z").getTime() + 24 * 60 * 60 * 1000;
    filtered = filtered.filter((tx) => new Date(tx.timestamp).getTime() < end);
  }
  if (address) {
    const addr = address.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.fromAddress.toLowerCase() === addr ||
        tx.toAddress.toLowerCase() === addr,
    );
  }

  return filtered;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const reportHandlers = [
  // GET /api/reports/stats
  http.get(`${API}/reports/stats`, () => {
    const fail = maybeFail();
    if (fail) return fail;
    return HttpResponse.json(stats);
  }),

  // GET /api/reports/volume?period=daily|weekly
  http.get(`${API}/reports/volume`, ({ request }) => {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") ?? "daily";
    const data = period.toLowerCase() === "weekly" ? weeklyVolume : dailyVolume;
    return HttpResponse.json(data);
  }),

  // GET /api/reports/top-addresses?limit=N
  http.get(`${API}/reports/top-addresses`, ({ request }) => {
    const url = new URL(request.url);
    let limit = Number(url.searchParams.get("limit") ?? 10);
    if (!Number.isFinite(limit) || limit < 1 || limit > 100) limit = 10;
    return HttpResponse.json(topAddresses.slice(0, limit));
  }),

  // GET /api/reports/export/csv
  http.get(`${API}/reports/export/csv`, ({ request }) => {
    const filtered = filterTransactionsForExport(new URL(request.url));
    const header =
      "Hash,From Address,To Address,Value,Block Number,Status,Timestamp\n";
    const rows = filtered
      .map((tx) =>
        [
          csvEscape(tx.hash),
          csvEscape(tx.fromAddress),
          csvEscape(tx.toAddress),
          tx.value,
          tx.blockNumber,
          tx.status,
          tx.timestamp,
        ].join(","),
      )
      .join("\n");
    return new HttpResponse(header + rows + (rows ? "\n" : ""), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=transactions.csv",
      },
    });
  }),

  // GET /api/reports/export/json
  http.get(`${API}/reports/export/json`, ({ request }) => {
    const filtered = filterTransactionsForExport(new URL(request.url));
    return HttpResponse.json(filtered, {
      headers: {
        "Content-Disposition": "attachment; filename=transactions.json",
      },
    });
  }),
];
