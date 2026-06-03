---
"@discordkit/core": major
"@discordkit/client": major
---

## `multipart()` schema wrapper and `fileUpload` helper

`@discordkit/core` adds two new exports for endpoints that send `multipart/form-data` bodies (file uploads, sticker creation, attachment-bearing messages):

- `multipart(schema)` — wraps an object schema so the request layer serializes it as `FormData` instead of JSON. Files declared in the schema become parts; other fields become JSON-encoded form fields keyed as `payload_json` per Discord's REST conventions.
- `fileUpload(opts)` — a Valibot schema for File/Blob inputs with optional MIME-type and byte-size constraints, used inside `multipart()` schemas.

```ts
import { fileUpload } from "@discordkit/core/validations/fileUpload";

const uploadSchema = multipart(
  v.object({
    avatar: fileUpload({
      mimeTypes: [`image/png`, `image/jpeg`],
      maxSize: 256_000
    }),
    nick: boundedString({ max: 32 })
  })
);
```

### Endpoints migrated to `multipart()` in `@discordkit/client`

Every endpoint that previously hand-rolled FormData now uses `multipart()` + `fileUpload` from `@discordkit/core`:

- `createMessage`, `editMessage`, `executeWebhook`, `editWebhookMessage`, `editOriginalInteractionResponse`, `editFollowupMessage`, `createFollowupMessage`, `createInteractionResponse`
- `createGuildSticker`, `modifyCurrentMember`, `modifyCurrentUser`, `modifyGuild`

### What changed for consumers

- The schemas exported by these endpoints now describe their **inputs** uniformly — no more separate `*Multipart` types vs. JSON-body types. The same `parse` / `safeParse` call validates both file and field shapes.
- `toValidated` automatically detects the multipart wrapper and validates uploads through the wrapped schema before the request goes out.

### Migration

If you previously constructed `FormData` by hand and passed it to one of these endpoints, switch to the structured shape the schema expects:

```ts
// Before
const formData = new FormData();
formData.append("file", file);
formData.append("payload_json", JSON.stringify({ content: "look at this" }));
await executeWebhook({ webhook, token, body: formData }, { anonymous: true });

// After
await executeWebhook(
  { webhook, token, body: { file, content: "look at this" } },
  { anonymous: true }
);
```

The request layer handles FormData construction internally.
