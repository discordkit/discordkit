---
"@discordkit/client": patch
"@discordkit/core": patch
---

Added a new versioning script to workaround `@changeset/cli`'s inability to correctly run `yarn npm publish`, which accidentally leaves workspace protocol dependency versions unchanged and published to npm. Shoutout to https://github.com/PrairieLearn/PrairieLearn/pull/7533 for the fix.
