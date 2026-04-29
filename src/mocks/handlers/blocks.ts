import { http, HttpResponse } from "msw";
import { blocks } from "../fixtures/blocks";
import { transactions } from "../fixtures/transactions";
import type { PaginatedResponse, Block } from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const blockHandlers = [
  // GET /api/blocks — paginated list
  http.get(`${API}/blocks`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);

    const start = page * size;
    const content = blocks.slice(start, start + size);

    return HttpResponse.json<PaginatedResponse<Block>>({
      content,
      page,
      size,
      totalElements: blocks.length,
      totalPages: Math.ceil(blocks.length / size),
    });
  }),

  // GET /api/blocks/latest
  http.get(`${API}/blocks/latest`, () => {
    return HttpResponse.json(blocks[0]);
  }),

  // GET /api/blocks/hash/:hash
  http.get(`${API}/blocks/hash/:hash`, ({ params }) => {
    const block = blocks.find((b) => b.hash === params.hash);
    if (!block) {
      return HttpResponse.json(
        { status: 404, message: "Block not found", timestamp: new Date().toISOString(), path: `/api/blocks/hash/${params.hash}` },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ...block,
      transactions: transactions.filter((tx) => tx.blockNumber === block.number),
    });
  }),

  // GET /api/blocks/number/:number
  http.get(`${API}/blocks/number/:number`, ({ params }) => {
    const num = Number(params.number);
    const block = blocks.find((b) => b.number === num);
    if (!block) {
      return HttpResponse.json(
        { status: 404, message: "Block not found", timestamp: new Date().toISOString(), path: `/api/blocks/number/${params.number}` },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      ...block,
      transactions: transactions.filter((tx) => tx.blockNumber === block.number),
    });
  }),
];
