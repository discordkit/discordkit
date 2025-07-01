---
"@discordkit/client": patch
"@discordkit/core": patch
---

## Fix wildly complex type definitions

Turns out, if you use `import * as v from "valibot";` _instead of_ destructured imports (as Discordkit did previously), you get _way simpler_ type definitions back from `tsc`. Before, for example, `Message` was over 7.5k lines long (at best, before hand optimization it widened to `any`). Now after this refactor... it's down to _800 lines_! That's almost a 10x reduction just for changing up how you import things. Wild.

Could this have been solved by bundling instead? Maybe, who knows. Shipping Typescript be weird sometimes.
