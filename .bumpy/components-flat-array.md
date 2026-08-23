---
"@discordkit/client": patch
---

`components` is a flat array everywhere. `messageComponentSchema` is itself an array (`boundedArray(actionRowSchema, …)`), but eight places wrapped it in `v.array()` again, producing `ActionRow[][]` — a shape Discord neither sends nor accepts. Those schemas rejected the real flat payload and admitted only a doubly nested one.

Affected: `Message`, `MessageSnapshot`, `ModalSubmitData`, `createFollowupMessage`, `editFollowupMessage`, `editOriginalInteractionResponse`, `executeWebhook` and `editWebhookMessage`. `createMessage`, `editMessage`, `startThreadInForumOrMediaChannel` and `InteractionCallbackData` already used it correctly and are unchanged.

In practice this means parsing a message that has components, and sending components through the interaction-followup and webhook endpoints, now work against Discord's actual wire format.
