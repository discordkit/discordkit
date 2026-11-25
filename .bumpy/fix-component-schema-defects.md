---
"@discordkit/client": patch
---

Fixed message component and embed schemas that rejected payloads Discord accepts, and one that accepted payloads Discord rejects.

- **Select menus in action rows.** An action row's `components` is now always an array: up to five buttons, exactly one select menu, or (in a legacy modal) exactly one text input. A select was previously accepted only as a bare object, so a select menu could not be sent and real messages containing one failed to parse. **The `ActionRow` type changed shape**: `components` is now `Button[] | Select[] | TextInput[]` instead of `Button[] | TextInput | Select`, because the old type described a payload Discord never sends. Code that built a row with a bare select object must wrap it in an array.
- **File components.** `name` and `size` on `File` are now optional. Discord fills them in on the response and ignores them on a request, so a File component could not be sent before.
- **Embeds on webhook and interaction endpoints.** `executeWebhook`, `editWebhookMessage`, `createFollowupMessage`, `editFollowupMessage` and `editOriginalInteractionResponse` now accept an embed that sets only the fields it uses. Every field, `type` included, was required.
- **Components V2 limits.** A message with the `IS_COMPONENTS_V2` flag is now limited to 40 components counted across the whole tree (children of action rows, sections and containers, and section accessories), and to 4000 characters across all its text display components. Only the top level was counted before.
- **Message content length.** `createMessage` now caps `content` at 2000 characters, Discord's limit, instead of 20000.
