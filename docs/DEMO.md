# BlockchainUZ — Live demo playbook

**Duration:** ~8 minutes. **Audience:** reviewers at the final presentation.
**Goal:** walk through the explorer end-to-end — from landing page, through smart search,
into block/tx/wallet details, and back — showing that the frontend is fully functional against
the API mock (so the demo is not coupled to the backend being up).

---

## Pre-flight (do this 15 minutes before the session)

1. **Pull latest `main`** on both repos.
2. **Frontend**
   ```bash
   cd BlockchainUZ_frontend
   npm ci
   npm run build      # catches any last-minute type or lint errors
   npm run dev        # leave it running on :3000
   ```
3. **Backend** (optional, only if you want to disable mocks live)
   ```bash
   cd BlockchainUZ_backend
   docker compose up -d
   ./gradlew bootRun
   ```
4. **Browser:**
   - Use an incognito window (clean storage, predictable cookies).
   - Zoom to **110 %** for visibility on projectors.
   - Pre-open these tabs so tab-switching is instant:
     1. http://localhost:3000/en
     2. http://localhost:3000/en/dashboard
     3. http://localhost:3000/en/blocks
     4. http://localhost:3000/en/transactions
5. **Copy these strings to clipboard** (scripted below) — you'll paste them into the search box:
   - Block number: `18946229`
   - Block hash: `0xb3a1f2e8c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1`
   - Tx hash: `0xaa01b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f001`
   - Wallet: `0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28` (alice — 12 txs)
6. **DevTools off** — press `F12` to close the panel so the viewport is clean.
7. Verify the **MSW banner** shows `[MSW] Mocking enabled.` in the console once (then close).

---

## Demo script (8 minutes)

### Scene 1 — Landing page (60 s)
**URL:** `/en`
- "This is the BlockchainUZ explorer — a block explorer inspired by Etherscan but scoped to our
  curriculum. Frontend is Next.js 16 with React 19, backend is Spring Boot."
- Point at the hero + quick tiles.
- **Talking point:** _i18n is live — switch to `pl` in the navbar and show the PL strings._
- Switch back to `en`.

### Scene 2 — Smart global search (90 s)
**Still on `/en`.**
- Paste **`18946229`** into the search box, press Enter → navigates to `/blocks/18946229`.
  - Narrate: "A plain integer is resolved as a block number — no dropdown, no mode switch."
- Hit browser-back. Paste the **wallet address** → jumps straight to `/wallets/0x742d35…`.
- Hit browser-back. Paste the **block hash** (64-char hex):
  - Narrate: "Block hashes and tx hashes are structurally identical, so the `/search` route
    resolves them in parallel against both endpoints and redirects to whichever responds."
  - Show the brief spinner → lands on the block page.

### Scene 3 — Dashboard (90 s)
**URL:** `/en/dashboard`
- KPI strip: processed blocks, total tx, avg gas, total ETH.
- Hover the tx-per-block chart.
- **Talking point:** _Everything is loaded from the API mock; the exact same code path works
  against the real backend (flip `NEXT_PUBLIC_USE_MOCKS=false`)._
- Click the "→" next to **Latest blocks** → jumps to `/blocks`.

### Scene 4 — Blocks list + detail (90 s)
**URL:** `/en/blocks`
- Point out the sortable columns (click "Txs" header to sort desc — the arrow animates).
- Click block **#18,946,229**.
- On the detail page, talk through:
  - Header with prev/next navigation
  - Hash + parent hash with copy buttons (click copy to show the toast check-mark)
  - The embedded transactions table (click a tx hash to drill in).

### Scene 5 — Transaction detail + wallet (90 s)
- On the tx detail page:
  - Show the structured `dl` with status badge, value, from/to.
  - Click the **from** address → jumps to `/wallets/0x742d35…`.
- On the wallet page:
  - Balance + tx count card.
  - Transactions table with an **IN/OUT** direction column (red/green).

### Scene 6 — URL-driven filters (60 s)
**URL:** `/en/transactions`
- Select **Status = Pending**, click Apply.
- Read the URL aloud: `/en/transactions?status=PENDING`.
- **Talking point:** _Filters live in the URL, so analysts can share a filter link or bookmark
  it — refresh-safe, back/forward-safe._
- Add a block number filter (`18946229`) + Apply → table shrinks in-place.
- Reset.

### Scene 7 — Command palette + power-user UX (60 s)
- Hit **`⌘K`** (or `Ctrl+K` on Linux/Windows) — palette opens.
  - Type `bloc` → Navigation → Blocks highlights. Enter.
  - Reopen with `⌘K`, arrow-down to **Recent searches** (from scene 2). Hit Enter.
- Press **`/`** anywhere on the page → the global search box gets focused.

### Scene 8 — Theme + i18n (30 s)
- Toggle dark mode in the navbar.
- Switch to `pl` → everything translates instantly (page, breadcrumbs, status
  badges, palette labels, etc).

### Scene 9 — Wrap (30 s)
- "Under the hood: typed API client + `ApiError` class (`src/services/api.ts`)
  → env parsed with zod at boot (`src/lib/env.ts`) → MSW handlers with optional
  chaos mode (`src/mocks/handlers/`) → deterministic PRNG seeds 150 blocks + 500
  transactions (`src/mocks/fixtures/generate.ts`) → shared UI primitives.
  Full type-safety from response to render."
- Covered by **23 unit tests** (Vitest + RTL) and **4 e2e specs** (Playwright) —
  wired into GitHub Actions.
- Hand over for Q&A.

---

## Seed data (summary)

The fixtures live in `src/mocks/fixtures/`. They're deliberately realistic — Etherscan-like
block numbers, 42-char checksummed addresses, 64-char tx hashes, mixed statuses.

| Dataset          | Size | Notes                                                           |
| ---------------- | ---- | --------------------------------------------------------------- |
| `blocks`         | 150  | Block numbers 18,946,082 → 18,946,231, 12 s apart               |
| `transactions`   | ~500 | Weighted mix of CONFIRMED (82 %) / PENDING (10 %) / FAILED (8 %) |
| `wallets`        | 30   | `alice`…`faith`, balances derived from the transaction graph     |

All data is generated deterministically (Mulberry32 PRNG, seed=`0x424c4f43`) —
rerunning the dev server produces byte-identical fixtures, so the demo path is
reproducible and the seed-data cheat sheet below stays accurate.

**Useful records to demo:** open `/en/blocks` and the latest block is the
highest-numbered one (typically with 3–10 txs). The palette's **Recent
searches** grows as you navigate; paste any wallet from the `/en/transactions`
list into the search box to land on its page.

To demo error states, restart the dev server with
`NEXT_PUBLIC_CHAOS=true npm run dev` — ~10 % of list requests then fail.

---

## Backup plan — "what if it breaks live?"

| Scenario                                           | Mitigation                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Dev server won't start / port 3000 busy            | `lsof -ti:3000 \| xargs kill -9` and retry. Or: `PORT=3001 npm run dev`.                                                             |
| MSW isn't intercepting (stale service worker)      | In devtools → Application → Service Workers → **Unregister** → hard refresh. Then reload once.                                       |
| Laptop has no internet                             | Everything demoable runs locally — no CDN / external API dependencies. Fonts are self-hosted via `next/font` (Geist).                |
| Backend is down (wanting to demo it live)          | Flip `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local`, restart dev, continue on mocks.                                                    |
| Dark theme looks wrong on projector                | Toggle back to light in the navbar.                                                                                                  |
| Browser crashes mid-demo                           | Use the pre-built `npm run build && npm start` output. It's faster to recover than a cold dev restart.                               |
| `npm run build` fails right before the talk        | Fall back to the `gh-pages`-deployed preview of the latest green commit (link pinned in the `#demo` Slack thread; record it below). |
| Question we can't answer on stage                  | "Great question — let's take that offline, I'll follow up by end of day."                                                            |

### Recovery cheat sheet

```bash
# Full reset, 30 seconds
cd BlockchainUZ_frontend
lsof -ti:3000 | xargs kill -9 2>/dev/null
rm -rf .next
npm run build && npm start
```

### Pinned URLs (fill in before the presentation)

- Staging preview: _TBD_
- Recording of a rehearsal run: _TBD_
- Slack channel for live support: _#demo_
