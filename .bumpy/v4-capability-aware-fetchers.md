---
"@discordkit/core": major
"@discordkit/client": major
---

## Capability-aware `Fetcher<S, R, C>` and required per-call options

Every endpoint Fetcher now carries a capability marker that determines which per-call options it accepts. The two capabilities introduced in v4:

- `{ anonymous: true }` — endpoints whose Discord docs explicitly state "does not require authentication". Required at the call site; passing anything other than `true` is a type error.
- `{ auditLogReason: true }` — endpoints whose Discord docs explicitly state "supports the `X-Audit-Log-Reason` header". The call accepts an optional `{ reason: string }`.

The `Fetcher<S, R, C>` generic in `@discordkit/core` encodes these capabilities at the type level:

```ts
type FetcherCapabilities = {
  anonymous?: boolean; // endpoint MUST skip Authorization
  auditLogReason?: boolean; // endpoint accepts X-Audit-Log-Reason
};

type Fetcher<S, R, C extends FetcherCapabilities = {}> = (
  input: S,
  options: RequestOptionsFor<C>
) => Promise<R>;
```

### What changed for consumers

#### Anonymous endpoints (17 total)

These endpoints REQUIRE `{ anonymous: true }` as the second argument:

- **Webhook (9)**: `getWebhookWithToken`, `modifyWebhookWithToken`, `deleteWebhookWithToken`, `getWebhookMessage`, `editWebhookMessage`, `deleteWebhookMessage`, `executeWebhook`, `executeSlackCompatibleWebhook`, `executeGitHubCompatibleWebhook`
- **Interaction tokens (8)**: `createInteractionResponse`, `getOriginalInteractionResponse`, `editOriginalInteractionResponse`, `deleteOriginalInteractionResponse`, `createFollowupMessage`, `getFollowupMessage`, `editFollowupMessage`, `deleteFollowupMessage`

```ts
// Before (v3.x)
await editWebhookMessage({ webhook, token, message, body });

// After (v4)
await editWebhookMessage(
  { webhook, token, message, body },
  { anonymous: true }
);
```

#### Audit-log-reason endpoints (54 total)

These endpoints OPTIONALLY accept `{ reason: string }`:

```ts
// Before (v3.x): no way to thread X-Audit-Log-Reason at the call site
await modifyGuildRole({ guild, role, body: { name: "Mod" } });

// After (v4)
await modifyGuildRole(
  { guild, role, body: { name: "Mod" } },
  { reason: "Promoted alice to moderator" }
);
```

Affected folders: `auto-moderation`, `application-commands`, `channel`, `emoji`, `guild`, `guild-scheduled-event`, `invite`, `messages`, `permissions`, `sticker`, `template`, `webhook`.

### Why

- The previous "second-argument boolean for anonymous, no support for audit-log reason" pattern was easy to forget and easy to misuse.
- A type-level capability marker surfaces the requirement at the call site instead of failing silently at runtime when Discord rejects the request.
- Wrappers like `toValidated`, `toProcedure`, and `toQuery` forward the capability through `Fetcher<S, R, C>` so the same guarantees hold post-composition.

### Migration

For each call site, audit whether the endpoint is now capability-marked:

- Anonymous endpoints — add `{ anonymous: true }` as the second arg. TypeScript will flag every site you missed.
- Audit-log endpoints — no change required. Add `{ reason: "..." }` opportunistically wherever you've previously logged the cause-of-mutation elsewhere.
