/** Active sessions are indicated with an "online", "idle", or "dnd" string per platform. If a user is offline or invisible, the corresponding field is not present. */

import * as v from "valibot";

export const clientStatusSchema = v.object({
  /** the user's status set for an active desktop (Windows, Linux, Mac) application session */
  desktop: v.optional(v.string()),
  /** the user's status set for an active mobile (iOS, Android) application session */
  mobile: v.optional(v.string()),
  /** the user's status set for an active web (browser, bot account) application session */
  web: v.optional(v.string())
});

export interface ClientStatus
  extends v.InferOutput<typeof clientStatusSchema> {}
