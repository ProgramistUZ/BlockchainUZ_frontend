import { http, HttpResponse } from "msw";
import type { AuthResponse, User } from "@/types/api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

const mockUser: User = {
  id: "usr_001",
  email: "demo@blockchainuz.pl",
  username: "demo",
  role: "USER",
};

export const authHandlers = [
  // POST /api/auth/login
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { status: 400, message: "Email and password are required", timestamp: new Date().toISOString(), path: "/api/auth/login" },
        { status: 400 },
      );
    }

    return HttpResponse.json<AuthResponse>({
      token: "mock-jwt-token-" + Date.now(),
      user: { ...mockUser, email: body.email },
    });
  }),

  // POST /api/auth/register
  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; username?: string; password?: string };

    if (!body.email || !body.username || !body.password) {
      return HttpResponse.json(
        { status: 400, message: "Email, username and password are required", timestamp: new Date().toISOString(), path: "/api/auth/register" },
        { status: 400 },
      );
    }

    return HttpResponse.json<AuthResponse>({
      token: "mock-jwt-token-" + Date.now(),
      user: { ...mockUser, email: body.email, username: body.username },
    });
  }),
];
