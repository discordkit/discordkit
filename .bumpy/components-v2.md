---
"@discordkit/client": minor
---

Components V2 messages can now be sent. Fixes [#88](https://github.com/discordkit/discordkit/issues/88).

**`components` accepts the V2 layout components.** The top-level `components` field was typed as `boundedArray(actionRowSchema, { max: 5 })`, so it admitted only `ActionRow`. `Container`, `TextDisplay`, `MediaGallery`, `Section`, `Separator` and `File` were all fully modelled and exported but had no path to the API — passing one was a type error, and casting past it failed validation. The field is now a union of the V1 shape (up to 5 action rows) and the V2 shape (up to 40 components, admitting the layout components), so `createMessage`, `editMessage`, the interaction responses and the webhook endpoints all take V2 messages. Anything that validated before still validates.

**`UnfurledMediaItem.attachmentId` is now optional.** It is response-only and present only when the media was uploaded as an attachment, as its own doc comment says, but the schema required it — which made every externally-hosted image unrepresentable. The other response-only fields on that object were already optional.

**`Section.accessroy` is now `Section.accessory`.** Discord names the field `accessory`, so the misspelling serialised to a field Discord ignores and a `Section` could never render its accessory. This renames a property on an exported interface, but no working code can depend on the old name: the misspelled field was dropped by Discord, so any Section relying on it was already broken. Rename the property at any construction site.

`MessageComponent` is now a type alias rather than an interface, because a union cannot be extended by one. It is still exported under the same name and infers from the same schema.

Reported against `@discordkit/client@4.3.3` while building [tome](https://github.com/crimson-witnesses/tome).
