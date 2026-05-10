import { HttpResponse } from "msw";
import { env } from "@/lib/env";

/**
 * Occasionally injects a 500 response when NEXT_PUBLIC_CHAOS=true.
 * Keeps the demo path deterministic by default — flip the flag on when you want
 * to show error boundaries, retry buttons, or ErrorState components in action.
 */
export function maybeFail(probability = 0.1): Response | null {
  if (!env.NEXT_PUBLIC_CHAOS) return null;
  if (Math.random() > probability) return null;
  return HttpResponse.json(
    {
      status: 500,
      message: "Simulated backend failure (chaos mode).",
      timestamp: new Date().toISOString(),
      path: "/chaos",
    },
    { status: 500 },
  );
}
