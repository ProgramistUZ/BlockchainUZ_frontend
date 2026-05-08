export type SearchKind =
  | { kind: "hash"; value: string }
  | { kind: "address"; value: string }
  | { kind: "block"; value: number }
  | { kind: "empty" }
  | { kind: "invalid" };

const HEX_64 = /^0x[0-9a-f]{64}$/i;
const HEX_40 = /^0x[0-9a-f]{40}$/i;
const UINT = /^\d+$/;

export function classifySearch(raw: string): SearchKind {
  const q = raw.trim();
  if (!q) return { kind: "empty" };
  if (HEX_64.test(q)) return { kind: "hash", value: q.toLowerCase() };
  if (HEX_40.test(q)) return { kind: "address", value: q };
  if (UINT.test(q)) {
    const n = Number(q);
    if (Number.isSafeInteger(n) && n >= 0) return { kind: "block", value: n };
  }
  return { kind: "invalid" };
}

/**
 * Returns a deterministic route for queries that unambiguously identify a
 * resource. Tx hashes and block hashes share the same 32-byte format, so
 * hashes are resolved server-side via the /search page instead.
 */
export function routeForSearch(kind: SearchKind): string | null {
  switch (kind.kind) {
    case "block":
      return `/blocks/${kind.value}`;
    case "address":
      return `/wallets/${kind.value}`;
    case "hash":
    default:
      return null;
  }
}
