import { http, HttpResponse } from "msw";
import { wallets } from "../fixtures/wallets";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const walletHandlers = [
  // GET /api/wallets/:address
  http.get(`${API}/wallets/:address`, ({ params }) => {
    const wallet = wallets.find(
      (w) => w.address.toLowerCase() === String(params.address).toLowerCase(),
    );
    if (!wallet) {
      return HttpResponse.json(
        { status: 404, message: "Wallet not found", timestamp: new Date().toISOString(), path: `/api/wallets/${params.address}` },
        { status: 404 },
      );
    }
    return HttpResponse.json(wallet);
  }),
];
