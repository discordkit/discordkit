---
"@discordkit/client": major
---

## Discord docs alignment, JSDoc refresh, and shape corrections

Every folder in `@discordkit/client` was re-audited against the current Discord API documentation. The output is partly cosmetic (JSDoc text matches the official docs verbatim, with proper cross-links) and partly load-bearing (several schemas were carrying wrong wire shapes inherited from older Discord docs).

### Wire-shape corrections

- **`authorizingIntegrationOwners`** (commit `2718d44`) — was modeled as a discriminated picklist; Discord actually returns a record keyed by `ApplicationIntegrationType`. Four schemas affected. Wrong shape would have caused `safeParse` failures against real Discord responses for any interaction that included this field.
- **`createInteractionResponse`** (commit `c7b51d1`) — request body was missing the `with_response` query flag and the discriminated `data` shape. Now matches the docs exactly, with a discriminated union on `type`.
- **`ModerationAction`** (commit `e06e777`) — extracted into a `variantSchema` discriminated by `type`, mirroring Discord's auto-moderation rule action shape.
- **Embed sub-objects** (commit `db5702b`) — `EmbedFooter`, `EmbedImage`, etc. extracted as their own types with correct optionality; previously inline shapes had drifted from the docs.
- **Component schemas** (commits `1f838de`, `b905e99`) — aligned with Discord's current message-components reference. Select-component `default_values` narrowed to a discriminated union on `type`.
- **`searchGuildMessages` query string** (commit `07708d0`) — array query params now serialize as repeated keys (`?author_id=1&author_id=2`) instead of comma-separated, matching what Discord accepts.
- **`createGuildTagBadgeImage`** (commit `44ab93f`) — added missing endpoint exposed through guild tags; threaded the right permission bits and role color shape.

### Permission bits

- Several endpoint metadata entries were missing newer permission bits (`CREATE_GUILD_EXPRESSIONS`, etc.). The JSDoc refresh sweep picked these up from the docs.

### Template

- The `template` path parameter was renamed to `code` to match Discord's docs; the schema and Fetcher signatures were updated in lockstep.

### JSDoc

- Every endpoint and every type's JSDoc was regenerated from a fresh fetch of Discord's docs (the audit/diff/scaffolder tooling that built this lives under `scripts/docs/`).
- Cross-references between schema types now use `{@link}` annotations that the doc-generator preserves through subsequent passes.
- `@deprecated` wording is normalized across all endpoints.
