# Spec — `examples/with-tauri` ("Friends List Studio")

> Status: **Draft for review** · Owner: Drake Costa · Date: 2026-06-17
> The Tauri example for `@discordkit/tauri`, and the social-graph counterpart to
> `examples/with-electron`'s "Rich Presence Visualizer". Same ethos — _tweak it
> live, see the real result_ — but for the **relationships / social surface** the
> Electron example deliberately doesn't touch. Grounds the build in (a) what a solo
> developer can realistically test on first run, and (b) a deployment model that
> keeps the default experience zero-backend.

## 1. What it is, in one paragraph

**Friends List Studio** is a developer tool for building and tuning a game's
**unified friends list** against Discord's design guidelines. On launch the dev
signs in with their own Discord account; the app loads their **real** relationships
and renders them as a live, sectioned friends list (online-in-game / online-elsewhere
/ offline, status matrix, Game-vs-Discord friend tiers, the Discord "universal
communication" badge, connection-point states). A controls panel lets the dev tune
the presentation — density, badges, custom status icons, sectioning rules — and see
it update instantly, the same way with-electron lets them tweak a presence payload
and watch Discord update. It is the **interactive** version of Discord's Figma
"Friend List Starter Pack".

## 2. Why this, and not a broad "Social SDK Workbench"

We surveyed the full SDK capability surface (auth, presence, users, relationships,
activity invites, lobbies, messaging, voice) and asked the only question that
matters for an example: **what can one developer, logged into only their own
Discord, actually exercise on first run?**

| Capability                                                               | Solo, first-run, own Discord — observable?                                                                                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth / `getCurrentUser`                                                  | ✅ Real, immediate.                                                                                                                                      |
| **Relationships (read)**                                                 | ✅ **Your actual friends list loads, populated** — real, free, no rate limit.                                                                            |
| Voice **device** enumeration                                             | ✅ Your own mics/speakers (an availability detail).                                                                                                      |
| Relationships (mutate), invites, DMs, lobby membership, live voice calls | ❌/⚠️ Need a **second party** (or fake accounts) and burn the strict comms rate limits (100 ops / 2h). On first run they show empty or contrived states. |

So a broad Workbench would have roughly half its panels empty on first run — a poor
first impression — while the **friends list is the one rich, real, populated,
solo-observable, rate-limit-free surface**. Discord prioritized it enough to ship a
Figma starter pack; we ship the live version. (The full Workbench remains a possible
future once provisional/second-account testing is in scope.)

## 3. The capability → tuning-surface map (what the tool exposes)

Drawn from `social-sdk-docs/guides/design-guidelines/` — the tool turns each
guideline into a live, adjustable control:

- **Sectioning** (`unified-friends-list`): order by descending availability —
  _Online — {GameTitle}_, _Online — Elsewhere_, _Offline_. Toggle/relabel sections.
- **Status matrix** (`status-rich-presence`): online / idle / dnd / offline. Core
  colors + symbols must stay readable (green/yellow/red, circle/moon/minus); _custom
  status icons are swappable live_ to see the constraint in action.
- **Game vs Discord friend tiers** (`game-friends`): the two-tier model; equally-
  weighted "add friend" affordances; identity-priority rules.
- **Discord badge** = universal communication, shown on online-elsewhere connected
  friends (not provisional).
- **Connection points** (`connection-points`): the sign-in CTA + blurple button when
  not connected; the persistent friends-list call-to-action; the documented copy.
- **Principles** (`principles`): immersion, trust, consistency — surfaced as preset
  "themes" the dev can flip between.

Showcases `@discordkit/tauri`'s **users + relationships** domains and the **signals**
conveniences: `asyncSignal` for the relationships read (a pull-only list with a
`reload()`), `statusSignal` for connection state. Mirrors with-electron's structure
(sidecar entry + client composition), oklch + `light-dark()` theme, and `components/`
organized by family.

## 4. The hard part: what a developer must actually do to run it

with-electron requires **no login at all** (presence is unauthenticated RPC). This
example needs, at minimum, a Discord sign-in — so "clone, build, run" is not the
whole story. The setup cost splits cleanly along a feature line, which we make the
**central architectural decision**: two tiers.

### Tier 1 — Discord-only (the default; ZERO backend)

The decisive fact: **the Discord side needs no server.** `@discordkit/native`'s
`authorize` uses **OAuth2 PKCE** with the desktop redirect `http://127.0.0.1/callback`,
and exchanges the auth code for a token using only the **public Application ID + the
PKCE verifier — no client secret** (`Discord_Client_GetToken(handle, applicationId,
code, verifier, redirectUri, …)`). The SDK is a public/native client; the entire
auth-and-relationships flow runs locally in the sidecar.

So Tier 1 setup is essentially with-electron's:

1. Clone, `vp install`, build the sidecar.
2. Put your **Discord Application ID** in `.env` (public, not a secret —
   `.env.schema` is committed, like with-electron).
3. Register the redirect URI `http://127.0.0.1/callback` in the Developer Portal
   (one click, one-time).
4. Supply the Social SDK binary (the existing BYO-binary step, shared with every
   discordkit native example).
5. Run.

No deploy, no hosted anything, no shared backend. Every developer can run the full
friends-list experience against their own data. **This is what the spec leads with
and what the README's quickstart covers.**

### Tier 2 — Steam reconciliation (OPT-IN; requires a backend)

The friends-list design is fundamentally about reconciling identities _across_
platforms, so a second real graph makes the tool far more demonstrative. Steam is the
natural choice (the owner has a Steam developer account) — but it is **architecturally
different from Discord** and cannot be zero-backend:

- The **Steam Web API key is a true secret** — it cannot ship in a desktop client.
- **`api.steampowered.com` blocks CORS** — even a non-secret call can't be made from
  the client; it _must_ be proxied server-side.
- **Steam OpenID** return-URL verification wants a stable host.

Therefore Steam is gated behind an optional, tiny **companion backend**:

```
Tauri webview ──(STEAM_BACKEND_URL)──▶ companion backend (holds STEAM_API_KEY)
                                          ├─ GET  /auth/steam       → OpenID redirect
                                          ├─ GET  /auth/steam/return → verify, set session
                                          └─ GET  /friends           → proxy GetFriendList
                                                                       + GetPlayerSummaries
```

- The webview reads `STEAM_BACKEND_URL` from env. **Unset → the Steam panel is hidden
  and the app is exactly Tier 1.** Set → a "Connect Steam" connection point appears.
- The backend is a **separate, optional deployable** (a small Hono/Nitro/Worker app
  under `examples/with-tauri/backend/` or a sibling). The owner hosts the **public
  demo instance** once; self-runners either point at a backend they deploy or skip
  Steam entirely.
- The backend is the only place the Steam key lives; the desktop app never sees it.

> This keeps the friction honest: the _advertised_ default demo is zero-backend, and
> the one feature that genuinely needs infrastructure is clearly opt-in and degrades
> away when absent.

## 5. Deployment strategy (the public, demoable instance)

The owner wants this **demoable** without every visitor self-hosting. Two things can
be hosted, with very different needs:

1. **The desktop app itself** is a Tauri binary — distribution is download-and-run
   (or build-from-source), not a hosted web page. There's no "deploy the app to a
   URL" for the Tauri shell; the demo _is_ the binary. (A future web build is out of
   scope — the SDK is a native binary.)
2. **The Tier-2 Steam backend** is the only hosted moving part. Recommended:
   - A single small serverless/edge deploy (Cloudflare Worker, or Vercel/Fly) holding
     `STEAM_API_KEY`, with the demo build's `STEAM_BACKEND_URL` pointing at it.
   - The owner's existing Discord application is used as the demo build's default
     `DISCORD_APPLICATION_ID` so a downloaded demo binary "just works" for Discord
     with no portal setup — _while self-built copies use their own App ID_ (env-driven,
     so the committed default is the owner's public demo app, overridable).

**Open deployment questions to settle before building Tier 2** (Tier 1 needs none):

- Which host for the Steam backend? (lean: Cloudflare Worker — cheapest, edge,
  matches "tiny proxy".)
- Session model for the Steam OpenID round-trip from a desktop webview: a
  loopback/deep-link return like Discord's, or a hosted return page that hands back a
  token the app stores? (Desktop OpenID return is the fiddly bit; needs a short spike.)
- Does the public demo binary ship the owner's `DISCORD_APPLICATION_ID` as the
  committed default, or must every runner enter their own? (Recommend: ship the
  owner's as default for the downloadable demo; `.env` override for self-builders.)

## 6. Structure (mirrors with-electron + the tauri adapter)

```
examples/with-tauri/
├── src/
│   ├── discord.sidecar.ts        # composes @discordkit/tauri/sidecar + registerUsers/registerRelationships
│   ├── client wiring             # createClient([usersSlice, relationshipsSlice])
│   ├── style.css                 # oklch + light-dark() theme (per with-electron)
│   ├── components/               # by family: FriendList, FriendRow, StatusBadge, Section,
│   │                             #   ConnectionPoint, ControlsPanel, SteamPanel (Tier 2), …
│   ├── signals / hooks           # asyncSignal(relationships.list), statusSignal
│   └── App.tsx
├── src-tauri/                    # capabilities (merge @discordkit/tauri/tauri/capabilities.json)
├── backend/                      # Tier 2 ONLY — the optional Steam companion (separate deployable)
└── .env.schema                   # committed: DISCORD_APPLICATION_ID, optional STEAM_BACKEND_URL
```

## 7. Build order

1. **Tier 1 vertical, zero-backend** — sidecar (`registerRelationships`/`registerUsers`),
   client, auth/connect, current-user card, live relationships list via `asyncSignal`.
2. **The Studio layer** — sectioning + status matrix + tiers + connection points,
   each driven by a live controls panel (the dev-tool payoff). Visual reference:
   Discord's Figma "Friend List Starter Pack" (community file `1512487996808869592`),
   inspected via the Figma MCP / Playwright and rebuilt interactively.
3. **Tier 2 (opt-in) Steam** — the companion backend + the gated reconciliation panel;
   deploy the public instance; resolve the §5 open questions first.

[unified-friends-list]: ../social-sdk-docs/guides/design-guidelines/unified-friends-list.md
