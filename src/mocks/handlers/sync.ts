import { http, HttpResponse } from "msw";
import { blocks } from "../fixtures";
import type { SyncStatus } from "@/types/api";
import { env } from "@/lib/env";

const API = env.NEXT_PUBLIC_API_URL;

export const syncHandlers = [
  // GET /api/sync/status
  http.get(`${API}/sync/status`, () => {
    const latestDatabaseBlock = blocks[0]?.number ?? 0;
    // Pretend the chain is slightly ahead so the "behind" badge renders.
    const latestBlockchainBlock = latestDatabaseBlock + 2;
    const blocksBehind = latestBlockchainBlock - latestDatabaseBlock;

    return HttpResponse.json<SyncStatus>({
      latestBlockchainBlock,
      latestDatabaseBlock,
      blocksBehind,
      syncEnabled: true,
      isFullySynced: blocksBehind === 0,
    });
  }),
];
